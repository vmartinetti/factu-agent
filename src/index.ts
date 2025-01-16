import { getAllNoZippedInvoicesByCompany, getFirstNoZippedInvoice, getFirstPendingInvoiceData, getInvoiceJSON } from "./controllers/invoiceController";
import { sequelize } from "./database";
import { buildItemsDet, getdDenSuc, getDescription, getgCamCond, getgCamDEAsoc, getgCamFE, getgCamNCDE, getgDatRec, getgOpeCom, getgTotSub } from "./controllers/helpers";
import { dDesTiDEList, dDesTipEmiList } from "./constants";
import { ciudadesList, departamentosList, distritosList } from "./geographic";
import { getCDCSinDv, validateJSON, eliminarValoresNulos, calcularDV, getXMLFromDocumento, getFullXML, signXML } from "./controllers/documentController";
import { Invoice } from "./models/invoice";
import clipboard from 'clipboardy';

// test database connection with sequelize
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    processInvoice();
    createInvoicesZip();
    sendZipToSIFEN();
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

async function processInvoice() {
  const { invoice, company, invoiceItems } = await getFirstPendingInvoiceData();
  if (!invoice) {
    console.log("No pending xml/sign invoices found");
    return;
  }

  const invoiceJSON = await getInvoiceJSON(invoice, company, invoiceItems);
  if (!invoiceJSON) {
    console.log("Error generating invoice JSON");
    return;
  }

  // test with zod
  const isValid = await validateJSON(invoiceJSON);
  if (!isValid.success) {
    console.log("Error validating JSON", isValid.errors);
    return;
  }

  console.log("JSON isValid!");

  const cdcSinDv: string | null = getCDCSinDv(invoiceJSON);

  if (!cdcSinDv) {
    // TODO: Marcar en base de datos como error ( y en todos los lugares donde se maneje el error)
    return console.log("Fallo en la formación del CDC sin DV");
  }

  const dv = calcularDV(cdcSinDv);
  let cdc = `${cdcSinDv}${dv}`;
  
  const documentoConNulos = {
    DE: {
      $: {
        Id: cdc,
      },
      dDVId: dv,
      dFecFirma: "2024-12-04T12:12:07",
      dSisFact: 1,
      gOpeDE: {
        iTipEmi: invoiceJSON.iTipEmi,
        dDesTipEmi: getDescription(invoiceJSON.iTipEmi, dDesTipEmiList),
        dCodSeg: invoiceJSON.dCodSeg,
      },
      gTimb: {
        iTiDE: invoiceJSON.iTiDE,
        dDesTiDE: getDescription(invoiceJSON.iTiDE, dDesTiDEList),
        dNumTim: invoiceJSON.dNumTim,
        dEst: invoiceJSON.dEst,
        dPunExp: invoiceJSON.dPunExp,
        dNumDoc: invoiceJSON.dNumDoc,
        dFeIniT: invoiceJSON.dFeIniT,
      },
      gDatGralOpe: {
        dFeEmiDE: invoiceJSON.dFeEmiDE,
        gOpeCom: getgOpeCom(invoiceJSON),
        gEmis: {
          dRucEm: invoiceJSON.dRucEm,
          dDVEmi: invoiceJSON.dDVEmi,
          iTipCont: invoiceJSON.iTipCont,
          dNomEmi: invoiceJSON.dNomEmi,
          dDirEmi: invoiceJSON.dDirEmi,
          dNumCas: invoiceJSON.dNumCas,
          cDepEmi: invoiceJSON.cDepEmi,
          dDesDepEmi: getDescription(invoiceJSON.cDepEmi, departamentosList),
          cDisEmi: invoiceJSON.cDisEmi,
          dDesDisEmi: getDescription(invoiceJSON.cDisEmi, distritosList),
          cCiuEmi: invoiceJSON.cCiuEmi,
          dDesCiuEmi: getDescription(invoiceJSON.cCiuEmi, ciudadesList),
          dTelEmi: invoiceJSON.dTelEmi,
          dEmailE: invoiceJSON.dEmailE,
          dDenSuc: getdDenSuc(invoiceJSON),
          gActEco: {
            cActEco: invoiceJSON.cActEco,
            dDesActEco: invoiceJSON.dDesActEco,
          },
        },
        gDatRec: getgDatRec(invoiceJSON),
      },
      gDtipDE: {
        gCamFE: getgCamFE(invoiceJSON),
        gCamNCDE: getgCamNCDE(invoiceJSON),
        // gCamNRE: getgCamNRE(),
        gCamCond: getgCamCond(invoiceJSON),
        // gTransp: getgTransp(),
        gCamItem: buildItemsDet(invoiceJSON.itemsDet, invoiceJSON),
      },
      gTotSub: getgTotSub(invoiceJSON),
      gCamDEAsoc: getgCamDEAsoc(invoiceJSON),
    }
  };

  const documento = eliminarValoresNulos(documentoConNulos);
  const xml = getXMLFromDocumento(documento);
  if (!xml) {
    return console.log("Error generating XML from Documento");
  }

  const securityCode = invoice.securityCode;
  const xmlPrefirma = await getFullXML(xml, cdcSinDv, dv, securityCode);
  if (!xmlPrefirma) {
    return console.log("Error generating XML Prefirma");
  }
  const xmlBuffer = Buffer.from(xmlPrefirma).toString("utf8");
  const { dRucEm, IdcSC, CSC } = invoiceJSON;
  const xmlSigned = await signXML(xmlBuffer, dRucEm, cdc, IdcSC, CSC);
  // save xmlSigned and CDC to database
  try{
    await invoice.update({
      xml: xmlSigned,
      CDC: cdc
    });
    console.log('Firmado!');
  } catch{
    console.log('Error saving xmlSigned and CDC to database');
  }
  clipboard.writeSync(xmlSigned);
  return ;
}

async function createInvoicesZip() {
  const invoice = await getFirstNoZippedInvoice();
  if (!invoice) {
    console.log("No pending zip invoices found");
    return;
  }
  console.log('First invoice customer', invoice.companyId)
  const invoices = await getAllNoZippedInvoicesByCompany(invoice.companyId);
  if (!invoices.length) {
    console.log("No pending zip invoices found");
    return;
  }
  console.log('Invoices to zip', invoices.length)
  // create zip record
  // const zip = await Zip.create({
  // fake create zip record
  const zipId = Number(String(new Date().getTime()).slice(0, 9));
  // update invoices with zipId with a transaction
  const t = await sequelize.transaction();
  try {
    for (const inv of invoices) {
      await inv.update({ zipId: zipId }, { transaction: t });
    }
    await t.commit();
    console.log("Invoices zipped! id:", zipId);
  } catch (error) {
    await t.rollback();
    console.log("Error zipping invoices", error);
  }
}

async function sendZipToSIFEN() {
  // get zip invoices
  // const zip = await Zip.findOne({ where: { status: 'PENDIENTE' } });
  // fake get zip
  const zip = { id: 173706043 };
  if (!zip) {
    console.log("No pending zip found");
    return;
  }
  const invoices = await Invoice.findAll({attributes: ['id','xml','CDC'], where: { zipId: zip.id } });

  if (!invoices.length) {
    console.log("No zip invoices found");
    return;
  }
  // extract the <rDE> from each invoice using parser
  const rDEs = invoices.map((inv) => {
    const rDE = inv.xml;
    return rDE;
  });

  console.log('rDEs', rDEs)
  // clipboard.writeSync(rDEs.join('\n'));
  console.log('rDEs joined!')
  // send zip to TiSIFEN
  // const response = await sendZipToTiSIFEN(zip);
  // if (response) {
  //   await zip.update({ sent: true });
  //   console.log("Zip sent to TiSIFEN");
  // }
  // console.log("Error sending zip to TiSIFEN");
  // return;
}