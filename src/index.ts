import { getAllInvoices, getAllNoZippedInvoicesByCompany, getFirstNoZippedInvoice, getFirstPendingInvoiceData, getInvoiceJSON, updateInvoice } from "./controllers/invoiceController";
import { sequelize } from "./database";
import { buildItemsDet, getdDenSuc, getDescription, getgCamCond, getgCamDEAsoc, getgCamFE, getgCamNCDE, getgDatRec, getgOpeCom, getgTotSub } from "./controllers/helpers";
import { dDesTiDEList, dDesTipEmiList } from "./constants";
import { ciudadesList, departamentosList, distritosList } from "./geographic";
import { getCDCSinDv, validateJSON, eliminarValoresNulos, calcularDV, getXMLFromDocumento, getFullXML, signXML } from "./controllers/documentController";
// import clipboard from "clipboardy";
import fs from "fs";
import archiver from "archiver";
import { getLoteStatus, sendZip } from "./controllers/sifenController";
import { createEmptyZip, getFirstPendingZip, getFirstSentZip } from "./controllers/zipController";
import { getCompany } from "./controllers/company";
import xml2js from "xml2js";
import util from "util";
import { Invoice } from "./models/invoice";
import { where } from "sequelize";

const parser = new xml2js.Parser({ explicitArray: false });

// test database connection with sequelize
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    // processInvoice();
    // createInvoicesZip();
    // sendZipToSIFEN();
    checkZipStatus();
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
    console.log("Error validating JSON on invoiceId:", invoice.id, isValid.errors);
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
    },
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
  // clipboard.writeSync(xmlSigned);
  // save xmlSigned and CDC to database
  const invoiceUpdatedFields = {
    xml: xmlSigned,
    CDC: cdc,
  };
  return await updateInvoice(invoiceUpdatedFields, invoice.id);
}

async function createInvoicesZip() {
  const invoice = await getFirstNoZippedInvoice();
  if (!invoice) return;
  console.log("First invoice customer", invoice.companyId);

  const company = await getCompany(invoice.companyId);
  if (!company) return console.error("Error getting company");

  const emisorRuc = company.ruc.split("-")[0];
  if (!emisorRuc) return console.error("Error getting emisorRuc");

  const invoices = await getAllNoZippedInvoicesByCompany(invoice.companyId);
  if (!invoices.length) return console.log("No pending zip invoices found");

  console.log(`${invoices.length} Invoices to zip`);
  // create zip record
  const zip = await createEmptyZip(emisorRuc);
  if (!zip) return console.error("Error creating zip");

  const zipId = zip.id;
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
  const zip = await getFirstPendingZip();
  if (!zip) return console.log("No pending zip found");

  const invoiceGetAllOptions = { attributes: ["id", "xml", "CDC"], where: { zipId: zip.id } };
  const invoices = await getAllInvoices(invoiceGetAllOptions);
  if (!invoices.length) {
    try {
      await zip.update({ status: "ZERO_INVOICES" });
    } catch (error) {
      console.log("Error updating zip status", error);
    }
    return console.log("No zip invoices found");
  }
  // extract the <rDE> from each invoice using parser
  const rDEs = invoices.map((inv) => {
    const rDE = inv.xml;
    return rDE;
  });

  // create zip file with rDEs
  const rLoteDE = `<rLoteDE>${rDEs.join("")}</rLoteDE>`;
  console.log("rDEs joined!");
  try {
    fs.unlinkSync(`${zip.id}.zip`);
    fs.unlinkSync(`${zip.id}.xml`);
  } catch (error) {
    console.log("Seems like the files don't exist yet or anymore");
  }

  fs.writeFileSync(`${zip.id}.xml`, rLoteDE);
  // Create zip
  const output = fs.createWriteStream(`${zip.id}.zip`);
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.pipe(output);
  archive.file(`${zip.id}.xml`, { name: `${zip.id}.xml` });
  archive.finalize();

  output.on("close", async () => {
    const zipData = fs.readFileSync(`${zip.id}.zip`);
    const base64Zip = zipData.toString("base64");
    // console.log(base64Zip);
    const response = await sendZip(zip.id, zip.emisorRuc, base64Zip);
    if (response.success) {
      console.log(util.inspect(response.data, false, null));
      try {
        const result = await parser.parseStringPromise(response.data);
        const dCodRes = result["env:Envelope"]["env:Body"]["ns2:rResEnviLoteDe"]["ns2:dCodRes"];
        const dProtConsLote = result["env:Envelope"]["env:Body"]["ns2:rResEnviLoteDe"]["ns2:dProtConsLote"];
        if (dCodRes === "0300") {
          console.log("Zip received by SIFEN!");
          // update zip status to ENVIADO
          await zip.update({ status: "ENVIADO", loteNro: dProtConsLote, envioXML: response.data });
          await Invoice.update({ sifenStatus: "ENVIADO" }, { where: { zipId: zip.id } });
        }
      } catch (error) {
        console.log("Error parsing response XML", error);
      }
    }
    fs.unlinkSync(`${zip.id}.zip`);
    fs.unlinkSync(`${zip.id}.xml`);
    // delete zip file and xml file
  });
}

async function checkZipStatus() {
  const zip = await getFirstSentZip();
  if (!zip) return console.log("No zip with status ENVIADO found");
  const { id: zipId, loteNro, emisorRuc } = zip;
  // get lote status
  const resultLoteStatus = await getLoteStatus(loteNro, zipId, emisorRuc);
  if (!resultLoteStatus.success) {
    return console.log(resultLoteStatus.error);
  }
  const status = resultLoteStatus.status;
  if (status === "PROCESADO"){
    const resultados = resultLoteStatus.data;
    // update every invoice with the status PROCESADO
    const t = await sequelize.transaction();
    try{
      for (const result of resultados) {
        const { id, dEstRes: res, gResProc: error } = result;
        const resultado = res.toUpperCase();
        await Invoice.update({ sifenStatus: resultado, sifenMensaje: `${error?.dCodRes} - ${error?.dMsgRes}` }, { where: { CDC: id }, transaction: t });
      }
      await zip.update({ status: "PROCESADO" }, { transaction: t });
      await t.commit();
    }catch (error) {
      await t.rollback();
      console.log("Error updating invoices with sifen status", error);
    }
  }
}
