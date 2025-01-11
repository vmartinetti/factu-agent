import xml2js from "xml2js";
// const parser = new xml2js.Parser();
const builder = new xml2js.Builder();
import { dDCondCredList, dDCondOpeList, dDesAfecIVAList, dDesDenTarjList, dDesIndPresList, dDesMoneOpeList, dDesMotEmiList, dDesTImpList, dDesTiPagList, dDesTipDocAsoList, dDesTipTraList, dDesUniMedList, dDTipIDRespDEList } from "../constants";
import { paisesList } from "../geographic";

interface CDCData {
  dEst: string;
  dPunExp: string;
  dNumDoc: string;
  dFeEmiDE: string;
  dCodSeg: string;
  iTipCont: string;
  dRucEm: string;
  dDVEmi: string;
  iTipEmi: string;
}

export const formarCdcSinDv = (CDCData: CDCData) => {
  const requiredFields = [
    "dEst",
    "dPunExp",
    "dNumDoc",
    "dFeEmiDE",
    "dCodSeg",
    "iTipCont",
    "dRucEm",
    "dDVEmi",
    "iTipEmi"
  ];
  for (const field of requiredFields) {
    if (!CDCData[field as keyof CDCData]) {
      console.error(`El campo ${field} no está presente en el JSON.`);
      return null;
    }
  }

  // Construcción del CDC
  const facturaElectronica = "01"; // Tipo de documento
  const ruc = CDCData.dRucEm.padStart(8, "0"); // RUC con padding de 8 caracteres
  const digitoVerificador = CDCData.dDVEmi; // Dígito verificador
  const establecimiento = CDCData.dEst.padStart(3, "0"); // Establecimiento (3 caracteres)
  const puntoExpedicion = CDCData.dPunExp.padStart(3, "0"); // Punto de expedición (3 caracteres)
  const numeroDocumento = CDCData.dNumDoc.padStart(7, "0"); // Número de documento (7 caracteres)
  const tipoContribuyente = CDCData.iTipCont; // Tipo de contribuyente (Fijo)
  const fechaEmision = CDCData.dFeEmiDE.slice(0, 10).replace(/-/g, ""); // Fecha de emisión en formato YYYYMMDD
  const tipoEmision = CDCData.iTipEmi.toString(); // Tipo de emisión
  const codigoDeSeguridad = CDCData.dCodSeg.toString().padStart(8, "0"); // Código de seguridad (8 caracteres)

  // Construir el CDC
  const CDC = `${facturaElectronica}${ruc}${digitoVerificador}${establecimiento}${puntoExpedicion}${numeroDocumento}${tipoContribuyente}${fechaEmision}${tipoEmision}${codigoDeSeguridad}`;

  return CDC;
};

export const calcularDV = (p_numero: string):number => {
  const p_basemax = 11;
  p_numero = String(p_numero);
  let v_total = 0;
  let v_resto = 0;
  let k = 0;
  let v_numero_aux = 0;
  let v_digit = 0;
  let v_numero_al = "";

  for (let i = 0; i < p_numero.length; i++) {
    const c = Number(p_numero.charAt(i));
    v_numero_al += c.toString();
  }

  k = 2;
  v_total = 0;

  for (let i = v_numero_al.length - 1; i >= 0; i--) {
    if (k > p_basemax) {
      k = 2;
    }
    v_numero_aux = Number(v_numero_al.charAt(i));
    v_total += v_numero_aux * k;
    k = k + 1;
  }

  v_resto = v_total % 11;
  v_digit = v_resto > 1 ? 11 - v_resto : 0;

  return v_digit;
};

export  const getDescription = (
  id: string | number,
  lista: { id: number | string; descripcion: string | number }[]
) => {
  const found = lista.find((item) => String(item.id) === String(id)); 
  if (!found) { 
    console.log(
      `Datos faltantes en GetDescription:   ID: ${id}, Lista: ${lista}`)
  
    return null;
  }
  return String(found.descripcion); // Convertir a string
};

export const getgOpeCom = (body: any) => {
  if (body.iTiDE !== 7) {
    const gOpeCom: any = {
      iTipTra: body.iTiDE === 1 || body.iTiDE === 4 ? body.iTipTra : "null",
      dDesTipTra: body.iTiDE === 1 || body.iTiDE === 4 ? getDescription(body.iTipTra, dDesTipTraList) : "null",
      iTImp: body.iTImp,
      dDesTImp: getDescription(body.iTImp, dDesTImpList),
      cMoneOpe: body.cMoneOpe,
      dDesMoneOpe: getDescription(body.cMoneOpe, dDesMoneOpeList),
    };
    return gOpeCom;
  }
  return "null";
};

export const getgCamFE = (body: any) => {
  if (body.iTiDE === 1) {
    return {
      iIndPres: body.iIndPres,
      dDesIndPres: getDescription(body.iIndPres, dDesIndPresList),
    };
  }
  return "null";
};

// para cuando tengamos credito


const getgPagTarCD = (body: any) => {
  if (body.iTiPago === 3 || body.iTiPago === 4) {
    return {
      iDenTarj: body.iDenTarj,
      dDesDenTarj: getDescription(body.iDenTarj, dDesDenTarjList),
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
      dDCondCred: getDescription(body.iCondCred, dDCondCredList),
      dPlazoCre: body.iCondCred === 1 ? body.dPlazoCre : "null",
    };

    if (body.iCondCred === 2) {
      gPagCred.gCuotas = {
        cMoneCuo: body.cMoneCuo,
        dDMoneCuo: getDescription(body.cMoneCuo, dDesMoneOpeList),
        dMonCuota: body.dMonCuota,
      };
    }
    return gPagCred;
  }
  return "null";
};

export const getgPaConEIni = (body: any) => {
  if (body.iCondOpe === 1 ) {
    return {
      iTiPago: body.iTiPago,
      dDesTiPag: getDescription(body.iTiPago, dDesTiPagList),
      dMonTiPag: body.dMonTiPag,
      cMoneTiPag: body.cMoneTiPag,
      dDMoneTiPag: getDescription(body.cMoneTiPag, dDesMoneOpeList),
      gPagTarCD: getgPagTarCD(body),
      gPagCheq: getgPagCheq(body),
    };
  }
  return "null";
};

export const getgCamNCDE = (body: any) => {
  if (body.iTiDE === 5 || body.iTiDE === 6) {
    return {
      iMotEmi: body.iMotEmi,
      dDesMotEmi: getDescription(body.iMotEmi, dDesMotEmiList),
    };
  }
  return "null";
};

export const getgCamCond = (body: any) => {
  if (body.iTiDE === 1 || body.iTiDE === 4) {
    return {
      iCondOpe: body.iCondOpe,
      dDCondOpe: getDescription(body.iCondOpe, dDCondOpeList),
      gPaConEIni: getgPaConEIni(body),
      gPagCred: getgPagCred(body),
    };
  }
  return "null";
};

export const getgTotSub = (body: any) => {
  if (body.iTiDE !== 7) {
    return {
      dSubExe:0,
      dSubExo:0,
      dSub5:0,
      dSub10:body.dSub10,
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
      dIVA5:body.dIVA5,//nuevo
      dIVA10:body.dIVA10,//nuevo
      dLiqTotIVA5: body.dLiqTotIVA5 ? body.dLiqTotIVA5 : 0,
      dLiqTotIVA10: body.dLiqTotIVA10 ? body.dLiqTotIVA10 : 0,
      dIVAComi: body.dIVAComi ? body.dIVAComi : 0,
      dTotIVA: body.iTImp === 1 || body.iTImp === 5 ? body.dTotIVA : "null", 
      dBaseGrav5:body.dBaseGrav5, //nuevo
      dBaseGrav10:body.dBaseGrav10, //nuevo
      dTBasGraIVA:body.dTBasGraIVA //nuevo

    };
  }
  return "null";
};

export const getgCamDEAsoc = (body: any) => {
  if (body.iTiDE === 4 || body.iTiDE === 5 || body.iTiDE === 6) {
    return {
      iTipDocAso: body.iTipDocAso,
      dDesTipDocAso: getDescription(body.iTipDocAso, dDesTipDocAsoList),
    };
  }
  return "null";
};

export 
const getgDatRec = (body: any) => {
  return {
    iNatRec: body.iNatRec,
    iTiOpe: body.iTiOpe,
    cPaisRec: body.cPaisRec,
    dDesPaisRe: getDescription(body.cPaisRec, paisesList),
    iTiContRec: body.iNatRec === 1 ? body.iTiContRec : "null",
    dRucRec: body.iNatRec === 1 ? body.dRucRec : "null",
    dDVRec: body.iNatRec === 1 ? body.dDVRec : "null",
    iTipIDRec: body.iNatRec !== 1 ? body.iTipIDRec : "null",
    dDTipIDRec: body.iNatRec !== 1 ? getDescription(body.iTipIDRec, dDTipIDRespDEList) : "null",
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
  if (
    (iTImp === 1 || iTImp === 3 || iTImp === 4 || iTImp === 5) &&
    iTiDE !== 4 &&
    iTiDE !== 7
  ) {
    return {
      iAfecIVA: item.iAfecIVA,
      dDesAfecIVA: getDescription(item.iAfecIVA, dDesAfecIVAList),
      dPropIVA: item.dPropIVA,
      dTasaIVA: item.dTasaIVA,
      dBasGravIVA: item.dBasGravIVA,
      dLiqIVAItem: item.dLiqIVAItem,
      dBasExe:0
    };
  }
  return "null";
};

export const getdDenSuc = (body: any) => {
  if (body.dDenSuc) {
    return body.dDenSuc;
  }
  return "null";
}

export const buildItemsDet = (itemsDet: any, body: any) => {
  const itemDet: {}[] = [];
  itemsDet.map(
    (item: {
      dLiqIVAItem: number;
      dBasGravIVA: number;
      dTasaIVA: number;
      dPropIVA: number;
      dDesAfecIVA: string;
      iAfecIVA: number;
      dCodInt: string;
      dDesProSer: string;
      cUniMed: number;
      dCantProSer: string;
      dPUniProSer: number;
      dTotBruOpeItem: number;
      dTotOpeItem: number;
    }) => {
      itemDet.push({
        dCodInt: item.dCodInt,
        dDesProSer: item.dDesProSer,
        cUniMed: item.cUniMed,
        dDesUniMed: getDescription(item.cUniMed, dDesUniMedList),
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
    }
  );
  return itemDet;
};
export const eliminarValoresNulos = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj
      .map(eliminarValoresNulos)
      .filter((item) => item !== null && item !== undefined);
  }

  if (obj !== null && typeof obj === "object") {
    const cleanedObj: any = {};
    Object.entries(obj).forEach(([key, value]) => {
      const cleanedValue = eliminarValoresNulos(value);
      if (cleanedValue !== null && cleanedValue !== "null") {
        cleanedObj[key] = cleanedValue;
      }
    });
    return cleanedObj;
  }
  return obj;
};

export const generateXml = async(invoiceData:any) => { 
  invoiceData.rDE["$"] = {"xmlns": "http://ekuatia.set.gov.py/sifen/xsd","xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance", "xsi:schemaLocation": "http://ekuatia.set.gov.py/sifen/xsd siRecepDE_v150.xsd"}
  const obj = {
      "soap:Envelope": {
          $: { 'xmlns:soap': "http://www.w3.org/2003/05/soap-envelope" },
          "soap:Header": {},
          "soap:Body": {
              "rEnviDe": {
                  $: { 'xmlns': "http://ekuatia.set.gov.py/sifen/xsd" },
                  "dId": 1636,
                  "xDE": {
                    ...invoiceData
                  }
                  
              }
          }
      }
  }
  return builder.buildObject(obj);
}