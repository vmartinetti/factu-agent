import { Company } from "../models/company";
import { Invoice } from "../models/invoice";
import { NODE_ENV } from "../config";
import { InvoiceItem } from "../models/invoiceItem";
import moment from "moment";

export async function getFirstPendingInvoice() {
  const invoice = Invoice.findOne({
    where: {
      annulled: false,
      sifenStatus: "PENDIENTE"
      // sifen status is pending
    },
  });
  if (!invoice) {
    return null;
  }
  return invoice;
}

export async function getAllPendingInvoicesByCustomer(customerDocId: string) {
  const invoices = Invoice.findAll({
    where: {
      annulled: false,
      customerDocId,
      // sifen status is pending
    },
  });
  if (!invoices) {
    return [];
  }
  return invoices;
}

export async function getInvoiceJSON(invoice: Invoice, company: Company, invoiceItems: InvoiceItem[]) {
  const dDVEmiString = company.ruc.split("-")[1];
  if(!dDVEmiString) return null;
  const dRucEm = company.ruc.split("-")[0];
  const dRucRec = invoice.customerDocId.split("-")[0];
  const dDVRecString = invoice.customerDocId.split("-")[1];
  if(!dDVRecString) return null;
  const dDVRec = parseInt(dDVRecString);
  const invoiceJSONWithNull = {
    iTipEmi: 1,
    dCodSeg: invoice.securityCode,
    iTiDE: 1, //Factura
    dNumTim: invoice.timbrado,
    dEst: invoice.salespointSucursal.toString().padStart(3, "0"),
    dPunExp: invoice.salespointPunto.toString().padStart(3, "0"),
    dNumDoc: invoice.number.toString().padStart(7, "0"),
    dFeIniT: invoice.salespointValidSince,
    dFeEmiDE: moment(invoice.dateTimeIssued, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DDTHH:mm:ss'),
    iTImp: 1, // IVA
    iTipTra: 3, // 1-Venta de merc, 2-Prestación serv, 3- mixto
    cMoneOpe: invoice.currencyCode,
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
    iTipIDRespDE: 1,
    dNumIDRespDE: company.feResponsibleDocId,
    dNomRespDE: company.feResponsibleName,
    dDTipIDRespDE: "Cédula paraguaya",
    dCarRespDE: "Facturador",
    iNatRec: invoice.customerDocId.includes("-") ? 1 : 2,
    iTiOpe: invoice.customerDocId.includes("-") && invoice.customerDocId.startsWith("800") ? 1 : 2,
    cPaisRec: "PRY",
    iTiContRec: invoice.customerDocId.includes("-") ? invoice.customerDocId.startsWith("800") ? 1 : 2 : null,
    dDVRec: dDVRec,
    dRucRec: dRucRec,
    dNomRec: invoice.customerName,
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
    iCondOpe: invoice.condition === "Contado" ? 1 : 2,
    iTiPago: invoice.condition === "Contado" ? 1 : null,
    dMonTiPag: invoice.condition === "Contado" ? invoice.total : null,
    cMoneTiPag: invoice.condition === "Contado" ? invoice.currencyCode : null,
    dDMoneTiPag: invoice.condition === "Contado" ? invoice.currencyCode === "PYG" ? "Guaraní" : "Dolar" : null,
    // dTiCamTIPag tipo de cambio para moneda extranjera
    iCondCred: invoice.condition === "Crédito" ? 1 : null,
    dDCondCred: invoice.condition === "Crédito" ? "Plazo" : null,
    dPlazoCre: invoice.condition === "Crédito" ? "30 días" : null, //TODO: calculate from dueDate
    dMonEnt: 0,
    dSubExe: invoice.exentaTotal > 0 ? invoice.exentaTotal : 0,
    dSubExo: 0,
    dSub5: invoice.gravada5Total > 0 ? invoice.gravada5Total : 0,
    dSub10: invoice.gravada10Total > 0 ? invoice.gravada10Total : 0,
    dTotOpe: invoice.total,
    dTotDesc: 0,
    dTotDescGlotem: 0,
    dTotAntItem: 0,
    dTotAnt: 0,
    dPorcDescTotal: 0,
    dDescTotal: 0,
    dAnticipo: 0,
    dRedon: 0, //TODO: check this to EESS Surtidores
    dTotGralOpe: invoice.total,    
    dIVA5: invoice.iva5Total > 0 ? invoice.iva5Total : 0,
    dIVA10: invoice.iva10Total > 0 ? invoice.iva10Total : 0,
    dTotIVA: invoice.iva5Total + invoice.iva10Total,
    dBaseGrav5: invoice.gravada5Total > 0 ? Number(invoice.gravada5Total) - Number(invoice.iva5Total)  : 0,
    dBaseGrav10: invoice.gravada10Total > 0 ? Number(invoice.gravada10Total) - Number(invoice.iva10Total) : 0,
    dTBasGraIVA: Number(invoice.gravada5Total) + Number(invoice.gravada10Total) - Number(invoice.iva5Total) - Number(invoice.iva10Total),
    // dTotalGs: TODO: to check when USD is used
    itemsDet: invoiceItems.map((item, index) => ({
      dCodInt: index + 1, //TODO: item.articleCode,
      dDesProSer: item.articleName,
      cUniMed: 77,
      dCantProSer: item.quantity,
      dPUniProSer: item.unitPrice,
      // dTiCamIt: TODO: implement this when USD is used
      dTotBruOpeItem: item.subTotal,
      dDescItem: 0,
      dTotOpeItem: item.subTotal,
      // dTotOpeGs: TODO: implement this when USD is used
      iAfecIVA: item.iva > 0 ? 1 : 3,
      dDesAfecIVA: item.iva > 0 ? "Gravado IVA" : "Exento",
      dPropIVA: 100,
      dTasaIVA: item.iva,
      dBasGravIVA: Number(item.subTotal) - Number(item.iva5SubTotal) - Number(item.iva10SubTotal),
      dLiqIVAItem: Number(item.iva5SubTotal) + Number(item.iva10SubTotal)
    }))
  };
  // remove all null values
  const invoiceJSON = Object.entries(invoiceJSONWithNull)
  .filter(([_key, value]) => value !== null)  // Filter out properties with null values
  .reduce((acc: { [key: string]: any }, [key, value]) => {
    acc[key] = value;  // Rebuild the object without null values
    return acc;
  }, {} as { [key: string]: any });
  return invoiceJSON;
}

