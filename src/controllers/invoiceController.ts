import { Company } from "../models/company";
import { Invoice } from "../models/invoice";
import { NODE_ENV } from "../config";
import { InvoiceItem } from "../models/invoiceItem";
import moment from "moment";
import { Op } from "sequelize";

export async function getAllInvoices(options: any) {
  try {
    const invoices = await Invoice.findAll(options);
    return invoices;
  } catch (error) {
    console.log("Error getting all invoices", error);
    return [];
  }
}
export async function getFirstNoZippedInvoice() {
  try {
    const invoice = await Invoice.findOne({
      where: {
        annulled: false,
        sifenStatus: "PENDIENTE",
        CDC: { [Op.ne]: null },
        xml: { [Op.ne]: null },
        zipId: null,
      },
      order: [["createdAt", "ASC"]],
      logging: false,
    });
    if (!invoice) {
      console.log("No pending zip invoices found");
      return null;
    }
    return invoice;
  } catch (error) {
    console.log("Error getting first no zipped invoice", error);
    return null;
  }
}

export async function getAllNoZippedInvoicesByCompany(companyId: string) {
  try {
    const invoices = await Invoice.findAll({
      where: {
        companyId,
        annulled: false,
        sifenStatus: "PENDIENTE",
        CDC: { [Op.ne]: null },
        zipId: null,
      },
      limit: 50,
      order: [["createdAt", "ASC"]],
      logging: false,
    });
    return invoices;
  } catch (error) {
    console.log("Error getting all no zipped invoices by company", error);
    return [];
  }
}
export async function getFirstPendingInvoiceData() {
  let invoice;
  try {
    invoice = await Invoice.findOne({
      where: {
        annulled: false,
        sifenStatus: "PENDIENTE",
        CDC: { [Op.ne]: null },
        xml: null,
      },
      logging: false,
    });
    if (!invoice) {
      return { invoice: null, company: null, invoiceItems: null };
    }
  } catch (error) {
    console.log("Error getting first pending invoice", error);
    return { invoice: null, company: null, invoiceItems: null };
  }
  let company;
  try {
    company = await Company.findOne({ where: { id: invoice.companyId }, logging: false });
    if (!company) {
      console.log("Company not found");
      return { invoice: null, company: null, invoiceItems: null };
    }
  } catch (error) {
    console.log("Error getting company", error);
    return { invoice: null, company: null, invoiceItems: null };
  }
  let invoiceItems;
  try {
    invoiceItems = await InvoiceItem.findAll({ where: { invoiceId: invoice.id }, logging: false, raw: true });
    if (!invoiceItems) {
      console.log("No invoice items found");
      return { invoice: null, company: null, invoiceItems: null };
    }
  } catch (error) {
    console.log("Error getting invoice items", error);
    return { invoice: null, company: null, invoiceItems: null };
  }
  if (!invoiceItems.length) {
    return { invoice: null, company: null, invoiceItems: null };
  }
  return { invoice, company, invoiceItems };
}

export async function getAllPendingInvoicesByCustomer(customerDocId: string) {
  try {
    const invoices = await Invoice.findAll({
      where: {
        annulled: false,
        customerDocId,
        sifenStatus: "PENDIENTE",
      },
    });
    return invoices;
  } catch (error) {
    console.error("Error getting all pending invoices by customer", error);
    return [];
  }
}

export async function getInvoiceJSON(invoice: Invoice, company: Company, invoiceItems: InvoiceItem[]) {
  const dDVEmiString = company.ruc.split("-")[1];
  if (!dDVEmiString) return null;
  const dRucEm = company.ruc.split("-")[0];
  const dRucRec = invoice.customerDocId.split("-")[0];
  const dDVRecString = invoice.customerDocId.split("-")[1];
  const esInnominada = invoice.customerDocId === "44444401-7";
  if (!dDVRecString) return null;
  const dDVRec = parseInt(dDVRecString);
  const invoiceJSONWithNull = {
    IdcSC: NODE_ENV === "development" ? "0001" : String(company.idCSC).padStart(4, "0"),
    CSC: NODE_ENV === "development" ? "ABCD0000000000000000000000000000" : company.CSC,
    dFecFirma: moment(invoice.dateTimeIssued).format("YYYY-MM-DDTHH:mm:ss"),
    iTipEmi: 1,
    dCodSeg: invoice.securityCode,
    iTiDE: 1, //Factura
    dNumTim: invoice.timbrado.toString().padStart(8, "0"),
    dEst: invoice.salespointSucursal.toString().padStart(3, "0"),
    dPunExp: invoice.salespointPunto.toString().padStart(3, "0"),
    dNumDoc: invoice.number.toString().padStart(7, "0"),
    dFeIniT: invoice.salespointValidSince,
    dFeEmiDE: moment(invoice.dateTimeIssued, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DDTHH:mm:ss"),
    iTImp: 1, // IVA
    iTipTra: 3, // 1-Venta de merc, 2-Prestación serv, 3- mixto
    cMoneOpe: invoice.currencyCode,
    dTiCam: invoice?.exchangeRate ? Number(invoice.exchangeRate) : null,
    dCondTiCam: invoice.currencyCode === "PYG" ? null : 1,
    dRucEm: dRucEm,
    dDVEmi: parseInt(dDVEmiString),
    iTipCont: company.type, //1- Persona fisica, 2- Persona juridica
    dNomEmi: NODE_ENV === "development" ? "DE generado en ambiente de prueba - sin valor comercial ni fiscal" : company.razonSocial,
    dDirEmi: `${company.addressLine1} ${company.addressLine2}`,
    dNumCas: 0,
    cDepEmi: company.stateCode,
    dDesDepEmi: company.stateName,
    cDisEmi: company.districtCode,
    dDesDisEmi: company.districtName,
    cCiuEmi: company.cityCode,
    dDesCiuEmi: company.cityName,
    dTelEmi: company.phoneNumber,
    dEmailE: company.email,
    cActEco: company.economicActivityCod,
    dDesActEco: company.economicActivityDesc,
    iTipIDRespDE: 1,
    dNumIDRespDE: company.feResponsibleDocId,
    dNomRespDE: company.feResponsibleName,
    dDTipIDRespDE: "Cédula paraguaya",
    dCarRespDE: "Facturador",
    iNatRec: esInnominada ? 2 : invoice.customerDocId.includes("-") ? 1 : 2,
    iTiOpe: invoice.customerDocId.includes("-") && invoice.customerDocId.startsWith("800") ? 1 : 2,
    cPaisRec: "PRY",
    iTiContRec: invoice.customerDocId.includes("-") ? (invoice.customerDocId.startsWith("800") ? 1 : 2) : null,
    dRucRec: !esInnominada && invoice.customerDocId.includes("-") ? dRucRec : null,
    dDVRec: !esInnominada && invoice.customerDocId.includes("-") ? dDVRec : null,
    dNomRec: invoice.customerName,
    //
    iTipIDRec: esInnominada ? 5 : !invoice.customerDocId.includes("-") ? 1 : null,
    // dDTipIDRec: esInnominada ? "Innominado" : !invoice.customerDocId.includes("-") ? "Cédula paraguaya" : null,
    dNumIDRec: esInnominada ? "0" : !invoice.customerDocId.includes("-") ? invoice.customerDocId : null,
    //
    // dNomFanRec: invoice.customerName,
    // dDirRec: invoice.customerAddress,
    // dNumCasRec: 0,
    // cDepRec: 1,
    // dDesDepRec: "CAPITAL",
    // cDisRec: 1,
    // dDesDisRec: "ASUNCION (DISTRITO)",
    // cCiuRec: 1,
    // dDesCiuRec: "ASUNCION (DISTRITO)",
    // dTelRec: "0994 257372",
    // dEmailRec: "
    // dCodCliente: "0000614",
    iIndPres: 1,
    iCondOpe: invoice.condition === "CONTADO" ? 1 : 2,
    iTiPago: invoice.condition === "CONTADO" ? 1 : null, // TODO: implement when CREDITO has initial payment
    dMonTiPag: invoice.condition === "CONTADO" ? Number(invoice.total) : null,
    cMoneTiPag: invoice.condition === "CONTADO" ? invoice.currencyCode : null,
    dDMoneTiPag: invoice.condition === "CONTADO" ? (invoice.currencyCode === "PYG" ? "Guaraní" : "Dolar") : null,
    // dTiCamTIPag tipo de cambio para moneda extranjera
    iCondCred: invoice.condition === "CREDITO" ? 1 : null,
    dDCondCred: invoice.condition === "CREDITO" ? "Plazo" : null,
    dPlazoCre: invoice.condition === "CREDITO" ? "30 días" : null, //TODO: calculate from dueDate
    // dMonEnt: invoice.condition === "CREDITO"? 0 : null,
    dSubExe: invoice.exentaTotal > 0 ? Number(invoice.exentaTotal) : 0,
    dSubExo: 0,
    dSub5: invoice.gravada5Total > 0 ? Number(invoice.gravada5Total) : 0,
    dSub10: invoice.gravada10Total > 0 ? Number(invoice.gravada10Total) : 0,
    dTotOpe: Number(invoice.total),
    dTotDesc: 0,
    dTotDescGlotem: 0,
    dTotAntItem: 0,
    dTotAnt: 0,
    dPorcDescTotal: 0,
    dDescTotal: 0,
    dAnticipo: 0,
    dRedon: 0, //TODO: check this to EESS Surtidores
    dTotGralOpe: Number(invoice.total),
    dIVA5: invoice.iva5Total > 0 ? Number(invoice.iva5Total) : 0,
    dIVA10: invoice.iva10Total > 0 ? Number(invoice.iva10Total) : 0,
    dTotIVA: Number(invoice.iva5Total) + Number(invoice.iva10Total),
    dBaseGrav5: invoice.gravada5Total > 0 ? Number(invoice.gravada5Total) - Number(invoice.iva5Total) : 0,
    dBaseGrav10: invoice.gravada10Total > 0 ? Number(invoice.gravada10Total) - Number(invoice.iva10Total) : 0,
    dTBasGraIVA: Math.round((Number(invoice.gravada5Total) + Number(invoice.gravada10Total) - Number(invoice.iva5Total) - Number(invoice.iva10Total)) * 100) / 100,
    // dTotalGs: TODO: to check when USD is used
    itemsDet: invoiceItems.map((item, index) => ({
      dCodInt: String(index + 1), //TODO: item.articleCode,
      dDesProSer: item.articleName,
      cUniMed: 77,
      dCantProSer: Number(item.quantity),
      dPUniProSer: Number(item.unitPrice),
      // dTiCamIt: TODO: implement this when USD is used
      dTotBruOpeItem: Number(item.subTotal),
      dDescItem: 0,
      dTotOpeItem: Number(item.subTotal),
      // dTotOpeGs: TODO: implement this when USD is used
      iAfecIVA: item.iva > 0 ? 1 : 3,
      dDesAfecIVA: item.iva > 0 ? "Gravado IVA" : "Exento",
      // TODO: check this for the percentage of IVA
      dPropIVA: item.iva > 0 ? 100 : 0,
      dTasaIVA: item.iva,
      dBasGravIVA: item.iva > 0 ? Number(item.subTotal) - Number(item.iva5SubTotal) - Number(item.iva10SubTotal) : 0,
      dLiqIVAItem: item.iva > 0 ? Number(item.iva5SubTotal) + Number(item.iva10SubTotal) : 0,
    })),
  };
  // remove all null values
  const invoiceJSON = Object.entries(invoiceJSONWithNull)
    .filter(([_key, value]) => value !== null) // Filter out properties with null values
    .reduce((acc: { [key: string]: any }, [key, value]) => {
      acc[key] = value; // Rebuild the object without null values
      return acc;
    }, {} as { [key: string]: any });
  return invoiceJSON;
}

export async function updateInvoice(updatedFields: any, invoiceId: string) {
  try {
    const updatedInvoice = await Invoice.update(
      {
        ...updatedFields,
        updatedAt: new Date(),
      },
      {
        where: { id: invoiceId },
      }
    );
    return updatedInvoice;
  } catch (error) {
    console.log("Error updating invoice", error);
    return null;
  }
}

export async function getFirstPendingEmailInvoice() {
  try {
    const invoice = await Invoice.findOne({
      where: {
        annulled: false,
        emailStatus: "PENDIENTE",
      },
      logging: false,
    });
    return invoice;
  } catch (error) {
    console.log("Error getting first pending email invoice", error);
    return null;
  }
}

export async function getFirstRepairedInvoice() {
  try {
    const invoice = await Invoice.findOne({
      where: {
        annulled: false,
        sifenStatus: "REPARADO",
      },
      order: [["createdAt", "ASC"]],
      logging: false,
    });
    if (!invoice) {
      console.log("No pending zip invoices found");
      return null;
    }
    return invoice;
  } catch (error) {
    console.log("Error getting first no zipped invoice", error);
    return null;
  }
}
