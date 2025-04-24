import { Op } from "sequelize";
import { CreditNote } from "../models/creditNote";
import { Company } from "../models/company";
import { CreditNoteItem } from "../models/creditNoteItem";
import { NODE_ENV } from "../config";
import moment from "moment";

export async function getFirstPendingCreditNoteData() {
  let creditNote;
  try {
    creditNote = await CreditNote.findOne({
      where: {
        annulled: false,
        sifenStatus: "PENDIENTE",
        CDC: { [Op.ne]: null },
        xml: null,
      },
      logging: false,
    });
    if (!creditNote) {
      return { creditNote: null, company: null, creditNoteItems: null };
    }
  } catch (error) {
    console.log("Error getting first pending creditNote", error);
    return { creditNote: null, company: null, creditNoteItems: null };
  }
  let company;
  try {
    company = await Company.findOne({ where: { id: creditNote.companyId }, logging: false });
    if (!company) {
      console.log("Company not found");
      return { creditNote: null, company: null, creditNoteItems: null };
    }
  } catch (error) {
    console.log("Error getting company", error);
    return { creditNote: null, company: null, creditNoteItems: null };
  }
  let creditNoteItems;
  try {
    creditNoteItems = await CreditNoteItem.findAll({ where: { creditNoteId: creditNote.id }, logging: false, raw: true });
    if (!creditNoteItems) {
      console.log("No creditNote items found");
      return { creditNote: null, company: null, creditNoteItems: null };
    }
  } catch (error) {
    console.log("Error getting creditNote items", error);
    return { creditNote: null, company: null, creditNoteItems: null };
  }
  if (!creditNoteItems.length) {
    return { creditNote: null, company: null, creditNoteItems: null };
  }
  return { creditNote, company, creditNoteItems };
}

export async function getCreditNoteJSON(creditNote: CreditNote, company: Company, creditNoteItems: CreditNoteItem[]) {
  const dDVEmiString = company.ruc.split("-")[1];
  if (!dDVEmiString) return null;
  const dRucEm = company.ruc.split("-")[0];
  const dRucRec = creditNote.customerDocId.split("-")[0];
  const dDVRecString = creditNote.customerDocId.split("-")[1];
  const esInnominada = creditNote.customerDocId === "44444401-7";
  if (!dDVRecString) return null;
  const dDVRec = parseInt(dDVRecString);
  const creditNoteJSONWithNull = {
    IdcSC: NODE_ENV === "development" ? "0001" : String(company.idCSC).padStart(4, "0"),
    CSC: NODE_ENV === "development" ? "ABCD0000000000000000000000000000" : company.CSC,
    dFecFirma: moment(creditNote.dateTimeIssued).format("YYYY-MM-DDTHH:mm:ss"),
    iTipEmi: 1,
    iMotEmi: 2, //1 - Devolucion y ajuste de precio, 2 devolucion, 3 descuento
    dCodSeg: creditNote.securityCode,
    iTiDE: 5, //Nota de credito
    iTipDocAso: 1,
    dCdCDERef: creditNote.invoiceCDC,
    dNumTim: creditNote.timbrado.toString().padStart(8, "0"),
    dEst: creditNote.salespointSucursal.toString().padStart(3, "0"),
    dPunExp: creditNote.salespointPunto.toString().padStart(3, "0"),
    dNumDoc: creditNote.number.toString().padStart(7, "0"),
    dFeIniT: creditNote.salespointValidSince,
    dFeEmiDE: moment(creditNote.dateTimeIssued, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DDTHH:mm:ss"),
    iTImp: 1, // IVA
    iTipTra: 3, // 1-Venta de merc, 2-Prestación serv, 3- mixto
    cMoneOpe: creditNote.currencyCode,
    dTiCam: creditNote?.exchangeRate ? Number(creditNote.exchangeRate) : null,
    dCondTiCam: creditNote.currencyCode === "PYG" ? null : 1,
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
    iNatRec: esInnominada ? 2 : creditNote.customerDocId.includes("-") ? 1 : 2,
    iTiOpe: creditNote.customerDocId.includes("-") && creditNote.customerDocId.startsWith("800") ? 1 : 2,
    cPaisRec: "PRY",
    iTiContRec: creditNote.customerDocId.includes("-") ? (creditNote.customerDocId.startsWith("800") ? 1 : 2) : null,
    dRucRec: !esInnominada && creditNote.customerDocId.includes("-") ? dRucRec : null,
    dDVRec: !esInnominada && creditNote.customerDocId.includes("-") ? dDVRec : null,
    dNomRec: creditNote.customerName,
    //
    iTipIDRec: esInnominada ? 5 : !creditNote.customerDocId.includes("-") ? 1 : null,
    // dDTipIDRec: esInnominada ? "Innominado" : !creditNote.customerDocId.includes("-") ? "Cédula paraguaya" : null,
    dNumIDRec: esInnominada ? "0" : !creditNote.customerDocId.includes("-") ? creditNote.customerDocId : null,
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
    // dMonEnt: invoice.condition === "CREDITO"? 0 : null,
    dSubExe: creditNote.exentaTotal > 0 ? Number(creditNote.exentaTotal) : 0,
    dSubExo: 0,
    dSub5: creditNote.gravada5Total > 0 ? Number(creditNote.gravada5Total) : 0,
    dSub10: creditNote.gravada10Total > 0 ? Number(creditNote.gravada10Total) : 0,
    dTotOpe: Number(creditNote.total),
    dTotDesc: 0,
    dTotDescGlotem: 0,
    dTotAntItem: 0,
    dTotAnt: 0,
    dPorcDescTotal: 0,
    dDescTotal: 0,
    dAnticipo: 0,
    dRedon: 0, //TODO: check this to EESS Surtidores
    dTotGralOpe: Number(creditNote.total),
    dIVA5: creditNote.iva5Total > 0 ? Number(creditNote.iva5Total) : 0,
    dIVA10: creditNote.iva10Total > 0 ? Number(creditNote.iva10Total) : 0,
    dTotIVA: Number(creditNote.iva5Total) + Number(creditNote.iva10Total),
    dBaseGrav5: creditNote.gravada5Total > 0 ? Number(creditNote.gravada5Total) - Number(creditNote.iva5Total) : 0,
    dBaseGrav10: creditNote.gravada10Total > 0 ? Number(creditNote.gravada10Total) - Number(creditNote.iva10Total) : 0,
    dTBasGraIVA: Math.round((Number(creditNote.gravada5Total) + Number(creditNote.gravada10Total) - Number(creditNote.iva5Total) - Number(creditNote.iva10Total)) * 100) / 100,
    // dTotalGs: TODO: to check when USD is used
    itemsDet: creditNoteItems.map((item, index) => ({
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
  const creditNoteJSON = Object.entries(creditNoteJSONWithNull)
    .filter(([_key, value]) => value !== null) // Filter out properties with null values
    .reduce((acc: { [key: string]: any }, [key, value]) => {
      acc[key] = value; // Rebuild the object without null values
      return acc;
    }, {} as { [key: string]: any });
  return creditNoteJSON;
}

export async function updateCreditNote(updatedFields: any, creditNoteId: string) {
  try {
    const updatedCreditNote = await CreditNote.update(
      {
        ...updatedFields,
        updatedAt: new Date(),
      },
      {
        where: { id: creditNoteId },
      }
    );
    return updatedCreditNote;
  } catch (error) {
    console.log("Error updating creditNote", error);
    return null;
  }
}