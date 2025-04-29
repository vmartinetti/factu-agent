import xml2js from "xml2js";
import { dDCondCredList, dDCondOpeList, dDesAfecIVAList, dDesDenTarjList, dDesIndPresList, dDesMoneOpeList, dDesMotEmiList, dDesTImpList, dDesTiPagList, dDesTipDocAsoList, dDesTipTraList, dDesUniMedList, dDTipIDRecList } from "../constants";
import { paisesList } from "../geographic";
import https from "https";
import fs from "fs";
import path from "path";
import { calcularDV } from "./documentController";
import { getCompanyByRuc } from "./companyController";

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

export const getDescription = (id: string | number, lista: { id: number | string; descripcion: string | number }[], listaNombre: string) => {
  const found = lista.find((item) => String(item.id) === String(id));
  if (!found) {
    console.error(`Datos faltantes en GetDescription: ID: ${id}, Lista: ${listaNombre}`);

    return null;
  }
  return String(found.descripcion); // Convertir a string
};

export const getgOpeCom = (body: any) => {
  if (body.iTiDE !== 7) {
    const gOpeCom: any = {
      iTipTra: body.iTiDE === 1 || body.iTiDE === 4 ? body.iTipTra : "null",
      dDesTipTra: body.iTiDE === 1 || body.iTiDE === 4 ? getDescription(body.iTipTra, dDesTipTraList, "dDesTipTraList") : "null",
      iTImp: body.iTImp,
      dDesTImp: getDescription(body.iTImp, dDesTImpList, "dDesTImpList"),
      cMoneOpe: body.cMoneOpe,
      dDesMoneOpe: getDescription(body.cMoneOpe, dDesMoneOpeList, "dDesMoneOpeList"),
      dCondTiCam: body.cMoneOpe === "PYG" ? "null" : 1,
      dTiCam: body.cMoneOpe === "PYG" ? "null" : body.dTiCam,
    };
    return gOpeCom;
  }
  return "null";
};

export const getgCamFE = (body: any) => {
  if (body.iTiDE === 1) {
    return {
      iIndPres: body.iIndPres,
      dDesIndPres: getDescription(body.iIndPres, dDesIndPresList, "dDesIndPresList"),
    };
  }
  return "null";
};

// para cuando tengamos credito

const getgPagTarCD = (body: any) => {
  if (body.iTiPago === 3 || body.iTiPago === 4) {
    return {
      iDenTarj: body.iDenTarj,
      dDesDenTarj: getDescription(body.iDenTarj, dDesDenTarjList, "dDesDenTarjList"),
      iForProPa: body.iForProPa,
    };
  }
  return "null";
};

const getgPagCheq = (body: any) => {
  if (body.iTiPago === 2) {
    return {
      dNumCheq: body.dNumCheq,
      dBcoEmi: body.dBcoEmi,
    };
  }
  return "null";
};
const getgPagCred = (body: any) => {
  if (body.iCondOpe === 2) {
    const gPagCred: any = {
      iCondCred: body.iCondCred,
      dDCondCred: getDescription(body.iCondCred, dDCondCredList, "dDCondCredList"),
      dPlazoCre: body.iCondCred === 1 ? body.dPlazoCre : "null",
    };

    if (body.iCondCred === 2) {
      gPagCred.gCuotas = {
        cMoneCuo: body.cMoneCuo,
        dDMoneCuo: getDescription(body.cMoneCuo, dDesMoneOpeList, "dDesMoneOpeList"),
        dMonCuota: body.dMonCuota,
      };
    }
    return gPagCred;
  }
  return "null";
};

export const getgPaConEIni = (body: any) => {
  if (body.iCondOpe === 1) {
    return {
      iTiPago: body.iTiPago,
      dDesTiPag: getDescription(body.iTiPago, dDesTiPagList, "dDesTiPagList"),
      dMonTiPag: body.dMonTiPag,
      cMoneTiPag: body.cMoneTiPag,
      dDMoneTiPag: getDescription(body.cMoneTiPag, dDesMoneOpeList, "dDesMoneOpeList"),
      gPagTarCD: getgPagTarCD(body),
      gPagCheq: getgPagCheq(body),
      dTiCamTiPag: body.cMoneTiPag === "PYG" ? "null" : body.dTiCam,
    };
  }
  return "null";
};

export const getgCamNCDE = (body: any) => {
  if (body.iTiDE === 5 || body.iTiDE === 6) {
    return {
      iMotEmi: body.iMotEmi,
      dDesMotEmi: getDescription(body.iMotEmi, dDesMotEmiList, "dDesMotEmiList"),
    };
  }
  return "null";
};

export const getgCamCond = (body: any) => {
  if (body.iTiDE === 1 || body.iTiDE === 4) {
    return {
      iCondOpe: body.iCondOpe,
      dDCondOpe: getDescription(body.iCondOpe, dDCondOpeList, "dDCondOpeList"),
      gPaConEIni: getgPaConEIni(body),
      gPagCred: getgPagCred(body),
    };
  }
  return "null";
};

export const getgTotSub = (body: any) => {
  if (body.iTiDE !== 7) {
    return {
      dSubExe: body.dSubExe,
      dSubExo: 0,
      dSub5: body.dSub5,
      dSub10: body.dSub10,
      dTotOpe: body.dTotOpe,
      dTotDesc: body.dTotDesc,
      dTotDescGlotem: body.dTotDescGlotem,
      dTotAntItem: body.dTotAntItem,
      dTotAnt: body.dTotAnt,
      dPorcDescTotal: body.dPorcDescTotal,
      dDescTotal: body.dDescTotal,
      dAnticipo: body.dAnticipo,
      dRedon: body.dRedon,
      dComi: body.dComi ? body.dComi : 0,
      dTotGralOpe: body.dTotGralOpe,
      dIVA5: body.dIVA5, //nuevo
      dIVA10: body.dIVA10, //nuevo
      dLiqTotIVA5: body.dLiqTotIVA5 ? body.dLiqTotIVA5 : 0,
      dLiqTotIVA10: body.dLiqTotIVA10 ? body.dLiqTotIVA10 : 0,
      dIVAComi: body.dIVAComi ? body.dIVAComi : 0,
      dTotIVA: body.iTImp === 1 || body.iTImp === 5 ? body.dTotIVA : "null",
      dBaseGrav5: body.dBaseGrav5, //nuevo
      dBaseGrav10: body.dBaseGrav10, //nuevo
      dTBasGraIVA: body.dTBasGraIVA, //nuevo
      dTotalGs: body.cMoneOpe === "PYG" ? "null" : Math.round(Number(body.dTotOpe * body.dTiCam)),
    };
  }
  return "null";
};

export const getgCamDEAsoc = (body: any) => {
  if (body.iTiDE === 4 || body.iTiDE === 5 || body.iTiDE === 6) {
    return {
      iTipDocAso: body.iTipDocAso,
      dDesTipDocAso: getDescription(body.iTipDocAso, dDesTipDocAsoList, "dDesTipDocAsoList"),
      dCdCDERef: body.dCdCDERef
    };
  }
  return "null";
};

export const getgDatRec = (body: any) => {
  return {
    iNatRec: body.iNatRec,
    iTiOpe: body.iTiOpe,
    cPaisRec: body.cPaisRec,
    dDesPaisRe: getDescription(body.cPaisRec, paisesList, "paisesList"),
    iTiContRec: body.iNatRec === 1 ? body.iTiContRec : "null",
    dRucRec: body.iNatRec === 1 ? body.dRucRec : "null",
    dDVRec: body.iNatRec === 1 ? body.dDVRec : "null",
    iTipIDRec: body.iNatRec !== 1 ? body.iTipIDRec : "null",
    dDTipIDRec: body.iNatRec !== 1 ? getDescription(body.iTipIDRec, dDTipIDRecList, "dDTipIDRecList") : "null",
    dNumIDRec: body.iNatRec !== 1 ? body.dNumIDRec : "null",
    dNomRec: body.dNomRec,
    // dDirRec: body.dDirRec,
    // dNumCasRec: body.dNumCasRec ? body.dNumCasRec : 0,
    // cDepRec: body.cDepRec,
    // dDesDepRec: getDescription(body.cDepRec, departamentosList),
    // cDisRec: body.cDisRec,
    // dDesDisRec: getDescription(body.cDisRec, distritosList),
    // cCiuRec: body.cCiuRec,
    // dDesCiuRec: getDescription(body.cCiuRec, ciudadesList),
    // dTelRec: body.dTelRec,
    // dEmailRec: body.dEmailRec,
    // dCodCliente: body.dCodCliente
  };
};

const getgCamIVA = (iTImp: number, iTiDE: number, item: any) => {
  if ((iTImp === 1 || iTImp === 3 || iTImp === 4 || iTImp === 5) && iTiDE !== 4 && iTiDE !== 7) {
    return {
      iAfecIVA: item.iAfecIVA,
      dDesAfecIVA: getDescription(item.iAfecIVA, dDesAfecIVAList,'dDesAfecIVAList'),
      dPropIVA: item.dPropIVA,
      dTasaIVA: item.dTasaIVA,
      dBasGravIVA: item.dBasGravIVA,
      dLiqIVAItem: item.dLiqIVAItem,
      dBasExe: 0,
    };
  }
  return "null";
};

export const getdDenSuc = (body: any) => {
  if (body.dDenSuc) {
    return body.dDenSuc;
  }
  return "null";
};

export const buildItemsDet = (itemsDet: any, body: any) => {
  const itemDet: {}[] = [];
  itemsDet.map((item: { dLiqIVAItem: number; dBasGravIVA: number; dTasaIVA: number; dPropIVA: number; dDesAfecIVA: string; iAfecIVA: number; dCodInt: string; dDesProSer: string; cUniMed: number; dCantProSer: string; dPUniProSer: number; dTotBruOpeItem: number; dTotOpeItem: number }) => {
    itemDet.push({
      dCodInt: item.dCodInt,
      dDesProSer: item.dDesProSer,
      cUniMed: item.cUniMed,
      dDesUniMed: getDescription(item.cUniMed, dDesUniMedList, "dDesUniMedList"),
      dCantProSer: item.dCantProSer,
      gValorItem: {
        dPUniProSer: item.dPUniProSer,
        dTotBruOpeItem: item.dTotBruOpeItem,
        gValorRestaItem: {
          dTotOpeItem: item.dTotOpeItem,
        },
      },
      gCamIVA: getgCamIVA(body.iTImp, body.iTiDE, item),
    });
  });
  return itemDet;
};

export const generateXml = async (invoiceData: any) => {
  invoiceData.rDE["$"] = { xmlns: "http://ekuatia.set.gov.py/sifen/xsd", "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance", "xsi:schemaLocation": "http://ekuatia.set.gov.py/sifen/xsd siRecepDE_v150.xsd" };
  const obj = {
    "soap:Envelope": {
      $: { "xmlns:soap": "http://www.w3.org/2003/05/soap-envelope" },
      "soap:Header": {},
      "soap:Body": {
        rEnviDe: {
          $: { xmlns: "http://ekuatia.set.gov.py/sifen/xsd" },
          dId: 1636,
          xDE: {
            ...invoiceData,
          },
        },
      },
    },
  };
  return builder.buildObject(obj);
};

export const obtenerDigestValue = async (xml: string): Promise<string> => {
  const result = await parser.parseStringPromise(xml);
  return result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0]["Signature"][0]["SignedInfo"][0]["Reference"][0]["DigestValue"][0];
};

export async function getHttpAgent(emisorRuc: string) {
  const dv = calcularDV(emisorRuc);
  if (!dv) {
    console.error("Error calculating DV");
    return null;
  }
  const rucWithDV = `${emisorRuc}-${dv}`;
  const company = await getCompanyByRuc(rucWithDV);
  if (!company) {
    console.error("Company not found");
    return null;
  }
  if (!company.certificatePassword) {
    console.error("Certificate password not found");
    return null;
  }
  const p12Password = company.certificatePassword;

  const p12Path = path.resolve(__dirname, `../../certificates/${emisorRuc}.p12`);
  const httpsAgent = new https.Agent({
    pfx: fs.readFileSync(p12Path),
    passphrase: p12Password,
  });
  return httpsAgent;
}

export function parseEuropeanNumber(input: string): number | null {
  if (typeof input !== 'string') return null;

  // Remove non-breaking spaces and trim
  const normalized = input.trim().replace(/\s/g, '');

  // Replace thousands separator and decimal comma
  const standard = normalized.replace(/\./g, '').replace(',', '.');

  const result = Number(standard);

  return isNaN(result) ? null : result;
}
