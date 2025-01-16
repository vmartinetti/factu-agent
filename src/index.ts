import { getFirstPendingInvoiceData, getInvoiceJSON } from "./controllers/invoiceController";
import { sequelize } from "./database";
import { buildItemsDet, getdDenSuc, getDescription, getgCamCond, getgCamDEAsoc, getgCamFE, getgCamNCDE, getgDatRec, getgOpeCom, getgTotSub } from "./controllers/helpers";
import { dDesTiDEList, dDesTipEmiList } from "./constants";
import { ciudadesList, departamentosList, distritosList } from "./geographic";
import { getCDCSinDv, validateJSON, eliminarValoresNulos, calcularDV, getXMLFromDocumento, getFullXML, signXML } from "./controllers/documentController";
import clipboard from 'clipboardy';

// test database connection with sequelize
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    processInvoice();
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

async function processInvoice() {
  const { invoice, company, invoiceItems } = await getFirstPendingInvoiceData();
  if (!invoice) {
    console.log("No pending invoices found");
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
  
  // old way is commented
  const documentoConNulos = {
    // rDE: {
    //   $:{
    //     "xmlns":"http://ekuatia.set.gov.py/sifen/xsd",
    //     "xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance",
    //     "xsi:schemaLocation":"http://ekuatia.set.gov.py/sifen/xsd siRecepDE_v150.xsd"
    //   },
    //   dVerFor: 150,
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
    // ,
    // gCamFuFD:{
    //   dCarQR:''
    // }
    // },
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
  console.log('Firmado!');
  clipboard.writeSync(xmlSigned);
  return ;
}
