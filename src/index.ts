import { getAllInvoices, getAllNoZippedInvoicesByCompany, getFirstNoZippedInvoice, getFirstPendingEmailInvoice, getFirstPendingInvoiceData, getFirstRepairedInvoice, getInvoiceJSON, updateInvoice, getFirstCancelPendingInvoice } from "./controllers/invoiceController";
import { sequelize } from "./database";
import { buildItemsDet, getdDenSuc, getDescription, getgCamCond, getgCamDEAsoc, getgCamFE, getgCamNCDE, getgDatRec, getgOpeCom, getgTotSub } from "./controllers/helpers";
import { dDesTiDEList, dDesTipEmiList, getDefaultHTML, getDefaultText } from "./constants";
import { ciudadesList, departamentosList, distritosList } from "./geographic";
import { validateJSON, eliminarValoresNulos, getXMLFromDocumento, getFullXML, signXML, getNewCDC } from "./controllers/documentController";
// import clipboard from "clipboardy";
import fs from "fs";
import archiver from "archiver";
import { getLoteStatus, sendZip } from "./controllers/sifenController";
import { createEmptyZip, getFirstPendingZip, getFirstSentZip } from "./controllers/zipController";
import { getCompany } from "./controllers/companyController";
import xml2js from "xml2js";
import { Invoice } from "./models/invoice";
import { schedule } from "node-cron";
import { Resend } from "resend";
import { RESEND_API_KEY, API_KEY, API_URL } from "./config";
import { Kude } from "./models/kude";
import axios from "axios";
import { getLatestDollarExchangeRate } from "./controllers/exchangeRateController";
import { getAllCreditNotes, getAllNoZippedCreditNotesByCompany, getCreditNoteJSON, getFirstNoZippedCreditNote, getFirstPendingCreditNoteData, updateCreditNote } from "./controllers/creditNoteController";
import { CreditNote } from "./models/creditNote";

const parser = new xml2js.Parser({ explicitArray: false });

const resend = new Resend(RESEND_API_KEY);

// test database connection with sequelize
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    processCanceledInvoices();
    processRepairedInvoice();
    processInvoice();
    processCreditNote();
    scheduleJobs();
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

// function that creates CRON jobs
function scheduleJobs() {
  if (process.env.NODE_ENV === "production") {
    schedule("0 * * * *", () => {
      // every hour at minute 0
      processInvoice();
    });
    schedule("* * * * *", () => {
      createInvoicesZip();
    });
    schedule("* * * * *", () => {
      sendZipToSIFEN();
    });
    schedule("* * * * *", () => {
      checkZipStatus();
    });
    schedule("* * * * *", () => {
      // every minutes
      sendInvoicesByEmail();
    });
    schedule("* * * * *", () => {
      // every minute
      processRepairedInvoice();
    });
    schedule("0 * * * *", () => {
      // every hour at minute 0
      updateExchangeRate();
    });
    schedule("*/45 * * * * *", () => {
      // every hour at minute 0
      processCanceledInvoices();
    });
    schedule("0 * * * *", () => {
      // every hour at minute 0
      processCreditNote();
    });
  } else {
    schedule("*/60 * * * * *", () => {
      // every 60 seconds
      processInvoice();
    });
    schedule("*/60 * * * * *", () => {
      // every 60 seconds
      createInvoicesZip();
    });
    schedule("*/60 * * * * *", () => {
      // every 60 seconds
      sendZipToSIFEN();
    });
    schedule("*/60 * * * * *", () => {
      // every 60 seconds
      checkZipStatus();
    });
    schedule("*/33 * * * * *", () => {
      // every 33 seconds
      sendInvoicesByEmail();
    });
    schedule("*/43 * * * * *", () => {
      // every 43 seconds
      processRepairedInvoice();
    });
    schedule("*/39 * * * * *", () => {
      // every 39 seconds
      updateExchangeRate();
    });
    schedule("*/30 * * * * *", () => {
      // every 30 seconds
      processCanceledInvoices();
    });
    schedule("*/30 * * * * *", () => {
      // every 30 seconds
      processCreditNote();
    });
  }
}

async function sendInvoicesByEmail() {
  const invoice = await getFirstPendingEmailInvoice();
  if (!invoice) return console.log("No pending email invoices found");
  const company = await getCompany(invoice.companyId);
  if (!company) return console.error("Error getting company");
  const kude = await Kude.findByPk(invoice.CDC);
  if (!kude) {
    console.error("No Kude found for invoice");
    return await invoice.update({ emailStatus: "ERROR_NO_KUDE" });
  }
  // send email with resend
  // update invoice with emailStatus
  const rootFileName = `factura_${invoice.salespointSucursal.toString().padStart(3, "0")}-${invoice.salespointPunto.toString().padStart(3, "0")}-${invoice.number.toString().padStart(7, "0")}`;
  const xmlString = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"><soap:Header/><soap:Body><rEnviDe xmlns="http://ekuatia.set.gov.py/sifen/xsd"><dId>120697</dId><xDE>${invoice.xml}</xDE></rEnviDe></soap:Body></soap:Envelope>`;
  const xmlFileName = `${rootFileName}.xml`;
  fs.writeFileSync(xmlFileName, xmlString);
  const pdfBuffer = Buffer.from(kude.base64, "base64");
  const pdfFileName = `${rootFileName}.pdf`;
  fs.writeFileSync(pdfFileName, pdfBuffer);
  if (!invoice.customerEmail) {
    console.error("Error sending email");
    invoice.update({ emailStatus: "ERROR_NO_EMAIL" });
  }

  const { error } = await resend.emails.send({
    from: "Factu <factura.electronica@factu.com.py>",
    to: invoice.customerEmail,
    subject: `Tu factura electrónica de ${company.nombreFantasia || company.razonSocial}`,
    text: getDefaultText(invoice, company),
    html: getDefaultHTML(invoice, company),
    attachments: [
      {
        filename: xmlFileName,
        content: fs.readFileSync(xmlFileName),
      },
      {
        filename: pdfFileName,
        content: fs.readFileSync(pdfFileName),
      },
    ],
  });
  try {
    fs.unlinkSync(xmlFileName);
    fs.unlinkSync(pdfFileName);
  } catch (error) {
    console.log("Seems like the files don't exist yet or anymore");
  }
  if (error) {
    console.log("Error sending email", error);
    invoice.update({ emailStatus: "ERROR" });
  } else {
    invoice.update({ emailStatus: "ENVIADO" });
  }
  // wait 3 seconds before sending another email
  setTimeout(() => {
    return sendInvoicesByEmail();
  }, 3000);
}

async function processInvoice() {
  const { invoice, company, invoiceItems } = await getFirstPendingInvoiceData();
  if (!invoice) {
    console.log("No pending xml/sign invoices found");
    return;
  }
  console.log("Found invoice", invoice.id);
  const invoiceJSON = await getInvoiceJSON(invoice, company, invoiceItems);
  if (!invoiceJSON) {
    console.log("Error generating invoice JSON");
    return;
  }

  // test with zod
  const isValid = await validateJSON(invoiceJSON);
  if (!isValid.success) {
    console.log("Error validating JSON on invoiceId:", invoice.id, isValid.errors);
    const invoiceUpdatedFields = {
      sifenStatus: "ERROR_JSON",
    };
    const updateResult = await updateInvoice(invoiceUpdatedFields, invoice.id);
    if (!updateResult) {
      console.log("Error updating invoice at processInvoice");
    }
    return;
  }

  console.log("JSON isValid!");

  // TODO: check if we definitely need to get CDC from the invoice
  // const cdcSinDv: string | null = getCDCSinDv(invoiceJSON);
  // get 43 of the 44 characters of the CDC
  const cdcSinDv = invoice.CDC.slice(0, -1);

  if (!cdcSinDv) {
    // TODO: Marcar en base de datos como error ( y en todos los lugares donde se maneje el error)
    return console.log("Fallo en la formación del CDC sin DV");
  }
  // TODO: check if we need to calculate the DV from the CDC
  // const dv = calcularDV(cdcSinDv);
  const dv = Number(invoice.CDC.slice(-1));
  let cdc = `${cdcSinDv}${dv}`;

  const documentoConNulos = {
    DE: {
      $: {
        Id: cdc,
      },
      dDVId: dv,
      dFecFirma: invoiceJSON.dFecFirma,
      dSisFact: 1,
      gOpeDE: {
        iTipEmi: invoiceJSON.iTipEmi,
        dDesTipEmi: getDescription(invoiceJSON.iTipEmi, dDesTipEmiList, "dDesTipEmiList"),
        dCodSeg: invoiceJSON.dCodSeg,
      },
      gTimb: {
        iTiDE: invoiceJSON.iTiDE,
        dDesTiDE: getDescription(invoiceJSON.iTiDE, dDesTiDEList, "dDesTiDEList"),
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
          dDesDepEmi: getDescription(invoiceJSON.cDepEmi, departamentosList, "departamentosList"),
          cDisEmi: invoiceJSON.cDisEmi,
          dDesDisEmi: getDescription(invoiceJSON.cDisEmi, distritosList, "distritosList"),
          cCiuEmi: invoiceJSON.cCiuEmi,
          dDesCiuEmi: getDescription(invoiceJSON.cCiuEmi, ciudadesList, "ciudadesList"),
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
  let invoiceUpdatedFields: { sifenStatus: string; xml?: string };
  if (!xmlSigned) {
    invoiceUpdatedFields = {
      sifenStatus: "ERROR_FIRMA",
    };
    console.log("Error signing XML");
  } else {
    invoiceUpdatedFields = {
      xml: xmlSigned,
      sifenStatus: "PENDIENTE",
    };
  }
  // clipboard.writeSync(xmlSigned);
  // save xmlSigned and CDC to database
  const updateResult = await updateInvoice(invoiceUpdatedFields, invoice.id);
  if (!updateResult) {
    console.log("Error updating invoice at processInvoice");
    return;
  }
  return await processInvoice();
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
  const zip = await createEmptyZip(emisorRuc, 1);
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
    sendZipToSIFEN();
  } catch (error) {
    await t.rollback();
    console.log("Error zipping invoices", error);
  }
}

async function sendZipToSIFEN() {
  // get zip invoices
  const zip = await getFirstPendingZip();
  if (!zip) return console.log("No pending zip found");
  console.log("preparing to send zip id:", zip.id);
  const documentGetAllOptions = { attributes: ["id", "xml", "CDC"], where: { zipId: zip.id } };
  let documents: Invoice[] | CreditNote[] = [];
  if (zip.documentType === 1) {
    const invoices = await getAllInvoices(documentGetAllOptions);
    documents = invoices;
  }
  if (zip.documentType === 5) {
    const creditNotes = await getAllCreditNotes(documentGetAllOptions);
    documents = creditNotes;
  }
  if (!documents.length) {
    try {
      await zip.update({ status: "ZERO_DOCUMENTS" });
    } catch (error) {
      console.log("Error updating zip status", error);
    }
    return console.log("No zip invoices found");
  }
  // extract the <rDE> from each document using parser
  const rDEs = documents.map((doc) => {
    const rDE = doc.xml;
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
    if (!response.success) {
      try {
        await zip.update({ status: "ERROR_SENDING" });
      } catch (error) {
        return console.error("Error updating zip status", error);
      }
      // delete zip file and xml file
      try {
        fs.unlinkSync(`${zip.id}.zip`);
        fs.unlinkSync(`${zip.id}.xml`);
      } catch (error) {
        console.log("Seems like the files don't exist yet or anymore");
      } finally {
        console.error("Error sending zip to SIFEN:", response.error);
        return;
      }
    }
    try {
      const result = await parser.parseStringPromise(response.data);
      const dCodRes = result["env:Envelope"]["env:Body"]["ns2:rResEnviLoteDe"]["ns2:dCodRes"];
      const dProtConsLote = result["env:Envelope"]["env:Body"]["ns2:rResEnviLoteDe"]["ns2:dProtConsLote"];
      if (dCodRes === "0300") {
        console.log("Zip received by SIFEN!");
        // update zip status to ENVIADO
        await zip.update({ status: "ENVIADO", loteNro: dProtConsLote, envioXML: response.data });
        if (zip.documentType === 1) {
          await Invoice.update({ sifenStatus: "ENVIADO" }, { where: { zipId: zip.id } });
        }
        if (zip.documentType === 5) {
          await CreditNote.update({ sifenStatus: "ENVIADO" }, { where: { zipId: zip.id } });
        }
      } else {
        console.error("Error getting result from zip sent to SIFEN", dCodRes);
      }
    } catch (error) {
      console.error("Error parsing response XML", error);
    } finally {
      try {
        // delete zip file and xml file
        fs.unlinkSync(`${zip.id}.zip`);
        fs.unlinkSync(`${zip.id}.xml`);
      } catch (error) {
        console.log("Seems like the files don't exist yet or anymore");
      }
    }
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
  if (status === "PROCESADO") {
    const xml = resultLoteStatus.xml;
    const resultados = resultLoteStatus.data;
    console.log("resultados form zip status", resultados);
    // update every invoice with the status PROCESADO
    const t = await sequelize.transaction();
    try {
      for (const result of resultados) {
        let { id, dEstRes: res, gResProc: error } = result;
        if (res === "Aprobado con observación") res = "APROBADO";
        const resultado = res.toUpperCase();
        await Invoice.update({ sifenStatus: resultado, sifenMensaje: `${error?.dCodRes} - ${error?.dMsgRes}` }, { where: { CDC: id }, transaction: t });
      }
      await zip.update({ status: "PROCESADO", consultaXML: xml }, { transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      console.log("Error updating invoices with sifen status", error);
    }
  }
}

async function processRepairedInvoice() {
  const invoice = await getFirstRepairedInvoice();
  if (!invoice) {
    console.log("No pending repaired invoices found");
    return;
  }
  const company = await getCompany(invoice.companyId);
  if (!company) {
    console.error("Error getting company");
    return;
  }
  const currentTimestamp = new Date().getTime();
  const newSecurityCode = Number(String(currentTimestamp).slice(0, -4));
  const newCDC = getNewCDC(invoice, company, newSecurityCode);
  const invoiceUpdatedFields = {
    securityCode: newSecurityCode,
    CDC: newCDC,
    xml: null,
    zipId: null,
    sifenStatus: "PENDIENTE",
  };
  const result = await updateInvoice(invoiceUpdatedFields, invoice.id);
  if (!result) {
    console.log("Error updating repaired invoice");
    return;
  }
  console.log("Repaired invoice updated!");
  return processRepairedInvoice();
}

async function processCanceledInvoices() {
  const invoice = await getFirstCancelPendingInvoice();
  if (!invoice) {
    console.log("No pending canceled invoices found");
    return;
  }
  const company = await getCompany(invoice.companyId);
  if (!company) {
    console.error("Error getting company");
    return;
  }
  const cancelEvent = {
    rEnviEventoDe: {
      $: {
        xmlns: "http://ekuatia.set.gov.py/sifen/xsd",
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      },
      dId: new Date().getTime().toString().slice(0, -4),
      dEvReg: {
        gGroupGesEve: {
          $: {
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:schemaLocation": "http://ekuatia.set.gov.py/sifen/xsd siRecepEvento_v150.xsd",
          },
          rGesEve: {
            $: {
              "xsi:schemaLocation": "http://ekuatia.set.gov.py/sifen/xsd siRecepEvento_v150.xsd",
            },
            rEve: {
              $: {
                Id: "4",
              },
              dFecFirma: new Date().toISOString().slice(0, -5),
              dVerFor: 150,
              gGroupTiEvt: {
                rGeVeCan: {
                  Id: invoice.CDC,
                  mOtEve: "Error en datos del receptor",
                },
              },
            },
          },
        },
      },
    },
  };
  const cancelXML = getXMLFromDocumento(cancelEvent);
  if (!cancelXML) {
    console.log("Error generating cancel XML");
    return;
  }
  const rucWithoutDv = company.ruc.split("-")[0] as string;
  const cancelXMLSigned = await signXML(cancelXML, rucWithoutDv, invoice.CDC, "", "");
  // write cancelXML to file
  if (!cancelXMLSigned) {
    console.log("Error signing cancel XML");
    return;
  }
  const xmlFileName = `cancel_${invoice.CDC}.xml`;
  fs.writeFileSync(xmlFileName, cancelXMLSigned);
  // send cancel XML to SIFEN
  console.log("Send cancelation TO BE IMPLEMENTED");
}

async function updateExchangeRate() {
  const exchangeRateResult = await getLatestDollarExchangeRate();
  if (!exchangeRateResult || !exchangeRateResult.success) {
    console.error("Error getting exchange rate");
    return;
  }
  const exchangeRate = exchangeRateResult.data;
  console.log("to be sent for update", exchangeRate);
  if (!exchangeRate) {
    console.error("Error getting exchange rate");
    return;
  }
  try {
    const result = await axios.post(
      `${API_URL}/exchange-rate`,
      {
        date: exchangeRate.date,
        salesRate: exchangeRate.salesRate,
      },
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    return console.log("Exchange rate updated:", result.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return console.error("Error updating exchange rate:", error.response?.data);
    }
    return console.error("Unknown updating exchange rate");
  }
}

async function processCreditNote() {
  const { creditNote, company, creditNoteItems } = await getFirstPendingCreditNoteData();
  if (!creditNote) {
    console.log("No pending xml/sign creditNotes found");
    createCreditNotesZip();
    return;
  }
  console.log("Found creditNote", creditNote.id);
  const creditNoteJSON = await getCreditNoteJSON(creditNote, company, creditNoteItems);
  if (!creditNoteJSON) {
    console.log("Error generating creditNote JSON");
    return;
  }

  // test with zod
  const isValid = await validateJSON(creditNoteJSON);
  if (!isValid.success) {
    console.log("Error validating JSON on creditNoteId:", creditNote.id, isValid.errors);
    const creditNoteUpdatedFields = {
      sifenStatus: "ERROR_JSON",
    };
    const updateResult = await updateCreditNote(creditNoteUpdatedFields, creditNote.id);
    if (!updateResult) {
      console.log("Error updating creditNote at processcreditNote");
    }
    return;
  }

  console.log("JSON isValid!");

  const cdcSinDv = creditNote.CDC.slice(0, -1);

  if (!cdcSinDv) {
    // TODO: Marcar en base de datos como error ( y en todos los lugares donde se maneje el error)
    return console.log("Fallo en la formación del CDC sin DV");
  }
  // TODO: check if we need to calculate the DV from the CDC
  // const dv = calcularDV(cdcSinDv);
  const dv = Number(creditNote.CDC.slice(-1));
  let cdc = `${cdcSinDv}${dv}`;

  const documentoConNulos = {
    DE: {
      $: {
        Id: cdc,
      },
      dDVId: dv,
      dFecFirma: creditNoteJSON.dFecFirma,
      dSisFact: 1,
      gOpeDE: {
        iTipEmi: creditNoteJSON.iTipEmi,
        dDesTipEmi: getDescription(creditNoteJSON.iTipEmi, dDesTipEmiList, "dDesTipEmiList"),
        dCodSeg: creditNoteJSON.dCodSeg,
      },
      gTimb: {
        iTiDE: creditNoteJSON.iTiDE,
        dDesTiDE: getDescription(creditNoteJSON.iTiDE, dDesTiDEList, "dDesTiDEList"),
        dNumTim: creditNoteJSON.dNumTim,
        dEst: creditNoteJSON.dEst,
        dPunExp: creditNoteJSON.dPunExp,
        dNumDoc: creditNoteJSON.dNumDoc,
        dFeIniT: creditNoteJSON.dFeIniT,
      },
      gDatGralOpe: {
        dFeEmiDE: creditNoteJSON.dFeEmiDE,
        gOpeCom: getgOpeCom(creditNoteJSON),
        gEmis: {
          dRucEm: creditNoteJSON.dRucEm,
          dDVEmi: creditNoteJSON.dDVEmi,
          iTipCont: creditNoteJSON.iTipCont,
          dNomEmi: creditNoteJSON.dNomEmi,
          dDirEmi: creditNoteJSON.dDirEmi,
          dNumCas: creditNoteJSON.dNumCas,
          cDepEmi: creditNoteJSON.cDepEmi,
          dDesDepEmi: getDescription(creditNoteJSON.cDepEmi, departamentosList, "departamentosList"),
          cDisEmi: creditNoteJSON.cDisEmi,
          dDesDisEmi: getDescription(creditNoteJSON.cDisEmi, distritosList, "distritosList"),
          cCiuEmi: creditNoteJSON.cCiuEmi,
          dDesCiuEmi: getDescription(creditNoteJSON.cCiuEmi, ciudadesList, "ciudadesList"),
          dTelEmi: creditNoteJSON.dTelEmi,
          dEmailE: creditNoteJSON.dEmailE,
          dDenSuc: getdDenSuc(creditNoteJSON),
          gActEco: {
            cActEco: creditNoteJSON.cActEco,
            dDesActEco: creditNoteJSON.dDesActEco,
          },
        },
        gDatRec: getgDatRec(creditNoteJSON),
      },
      gDtipDE: {
        gCamFE: getgCamFE(creditNoteJSON),
        gCamNCDE: getgCamNCDE(creditNoteJSON),
        // gCamNRE: getgCamNRE(),
        gCamCond: getgCamCond(creditNoteJSON),
        // gTransp: getgTransp(),
        gCamItem: buildItemsDet(creditNoteJSON.itemsDet, creditNoteJSON),
      },
      gTotSub: getgTotSub(creditNoteJSON),
      gCamDEAsoc: getgCamDEAsoc(creditNoteJSON),
    },
  };

  const documento = eliminarValoresNulos(documentoConNulos);
  const xml = getXMLFromDocumento(documento);
  if (!xml) {
    return console.log("Error generating XML from Documento");
  }

  const securityCode = creditNote.securityCode;
  const xmlPrefirma = await getFullXML(xml, cdcSinDv, dv, securityCode);
  if (!xmlPrefirma) {
    return console.log("Error generating XML Prefirma");
  }
  const xmlBuffer = Buffer.from(xmlPrefirma).toString("utf8");
  const { dRucEm, IdcSC, CSC } = creditNoteJSON;
  const xmlSigned = await signXML(xmlBuffer, dRucEm, cdc, IdcSC, CSC);
  let creditNoteUpdatedFields: { sifenStatus: string; xml?: string };
  if (!xmlSigned) {
    creditNoteUpdatedFields = {
      sifenStatus: "ERROR_FIRMA",
    };
    console.log("Error signing XML");
  } else {
    creditNoteUpdatedFields = {
      xml: xmlSigned,
      sifenStatus: "PENDIENTE",
    };
  }
  // clipboard.writeSync(xmlSigned);
  // save xmlSigned and CDC to database
  const updateResult = await updateCreditNote(creditNoteUpdatedFields, creditNote.id);
  if (!updateResult) {
    console.log("Error updating creditNote at processcreditNote");
    return;
  }
  return await processCreditNote();
}

async function createCreditNotesZip() {
  const creditNote = await getFirstNoZippedCreditNote();
  if (!creditNote) return;
  console.log("First creditNote customer", creditNote.companyId);

  const company = await getCompany(creditNote.companyId);
  if (!company) return console.error("Error getting company");

  const emisorRuc = company.ruc.split("-")[0];
  if (!emisorRuc) return console.error("Error getting emisorRuc");

  const creditNotes = await getAllNoZippedCreditNotesByCompany(creditNote.companyId);
  if (!creditNotes.length) return console.log("No pending zip creditNotes found");

  console.log(`${creditNotes.length} Credit Notes to zip`);
  // create zip record
  const zip = await createEmptyZip(emisorRuc, 5);
  if (!zip) return console.error("Error creating zip");

  const zipId = zip.id;
  // update invoices with zipId with a transaction
  const t = await sequelize.transaction();
  try {
    for (const cn of creditNotes) {
      await cn.update({ zipId: zipId }, { transaction: t });
    }
    await t.commit();
    console.log("Credit notes zipped! id:", zipId);
    sendZipToSIFEN();
  } catch (error) {
    await t.rollback();
    console.log("Error zipping creditNotes", error);
  }
}
