import fs from "fs";
import path from "path";
import { SignedXml } from "xml-crypto";
import xml2js from "xml2js";
import crypto from "crypto";
import { dDCondCredList, dDCondOpeList, dDesAfecIVAList, dDesDenTarjList, dDesIndPresList, dDesMoneOpeList, dDesMotEmiList, dDesTImpList, dDesTiPagList, dDesTipDocAsoList, dDesTipTraList, dDesUniMedList, dDTipIDRespDEList } from "../constants";
import { paisesList } from "../geographic";
import { NODE_ENV } from "../config";

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

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

export const obtenerDigestValue = async (xml: string): Promise<string> => {
  const result = await parser.parseStringPromise(xml); 
  return result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0][
    "Signature"
    ][0]["SignedInfo"][0]["Reference"][0]["DigestValue"][0];
};

const crearStringQr = (
  qrData: any,
  id: string,
  IdcSC: string,
  CSC: string
): string => {
  // console.log('CSC', CSC)
  return `nVersion=${qrData.nVersion}&Id=${id}&dFeEmiDE=${qrData.dFeEmiDEHex}&${qrData.docType}=${qrData.docNumber}&dTotGralOpe=${qrData.dTotGralOpe}&dTotIVA=${qrData.dTotIVA}&cItems=${qrData.cItems}&DigestValue=${qrData.DigestValueHex}&IdCSC=${IdcSC}${CSC}`;
};

const obtenerCDC = async (xml: string): Promise<string> => {
  const result = await parser.parseStringPromise(xml);
  return result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0]["DE"][0]["$"]["Id"];
};

const generarQRUrl = async (
  xml: string,
  url: string
): Promise<string> => {
  const result = await parser.parseStringPromise(xml);
  result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0]["gCamFuFD"][0]["dCarQR"] = url;
  const builder = new xml2js.Builder({
    renderOpts: { pretty: false },
    headless: true,
  });
  return builder.buildObject(result);
};

// saneado
const obtenerDatosQr = async (xml: string, digestValue: string) => {
  let docType = "";
  const result = await parser.parseStringPromise(xml);
  let docNumber = "";
  let dTotGralOpe = 0;
  let dTotIVA = 0;

  const nVersion = result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0]["dVerFor"][0];
  const DE = result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0]["DE"][0];
  const dFeEmiDE = DE["gDatGralOpe"][0]["dFeEmiDE"][0];
  const dFeEmiDEHex = Buffer.from(dFeEmiDE).toString("hex");

  if (DE["gDatGralOpe"][0]["gDatRec"][0]["iNatRec"][0] == 1) {
    docNumber = DE["gDatGralOpe"][0]["gDatRec"][0]["dRucRec"][0];
    docType = "dRucRec";
  } else {
    docNumber = DE["gDatGralOpe"][0]["gDatRec"][0]["dNumIDRec"][0];
    docType = "dNumIDRec";
  }

  const iTiDE = DE["gTimb"][0]["iTiDE"][0];

  if (iTiDE === "1") {
    dTotGralOpe = DE["gTotSub"][0]["dTotGralOpe"][0];
    dTotIVA = DE["gTotSub"][0]["dTotIVA"][0];
  }

  const cItems = DE["gDtipDE"][0]["gCamItem"].length;
  const DigestValueHex = Buffer.from(digestValue).toString("hex");

  return {
    nVersion,
    dFeEmiDEHex,
    docNumber,
    docType,
    dTotGralOpe,
    dTotIVA,
    cItems,
    DigestValueHex,
    iTiDE,
  };
};

const generarHash = (input: string): string => {
  const hash = crypto.createHash("sha256");
  hash.update(input, "binary");
  return hash.digest("hex");
};

const crearQrUrl = (
  qrData: any,
  id: string,
  hashHex: string,
  IdcSC: string
): string => {
  const baseUrl =
    NODE_ENV === "production"
      ? "https://ekuatia.set.gov.py/consultas/qr?"
      : "https://ekuatia.set.gov.py/consultas-test/qr?";
  return `${baseUrl}nVersion=${qrData.nVersion}&Id=${id}&dFeEmiDE=${qrData.dFeEmiDEHex}&${qrData.docType}=${qrData.docNumber}&dTotGralOpe=${qrData.dTotGralOpe}&dTotIVA=${qrData.dTotIVA}&cItems=${qrData.cItems}&DigestValue=${qrData.DigestValueHex}&IdCSC=${IdcSC}&cHashQR=${hashHex}`;
};

const firmar = async (
  xmlBuffer: string,
  pemContent: string,
  pubContent: string
): Promise<string> => {
  const sig = new SignedXml();
  sig.signatureAlgorithm = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
  sig.canonicalizationAlgorithm = "http://www.w3.org/2001/10/xml-exc-c14n#";
  sig.addReference({
    xpath: "//*[local-name(.)='DE']",
    transforms: [
      "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
      "http://www.w3.org/2001/10/xml-exc-c14n#",
    ],
    digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
  });
  sig.privateKey = Buffer.from(pemContent);
  sig.publicCert = Buffer.from(pubContent);
  sig.getKeyInfoContent = function () {
    return `<X509Data><X509Certificate>${Buffer.from(
      pubContent
    )}</X509Certificate></X509Data>`;
  };
  sig.computeSignature(xmlBuffer, {
    location: { reference: "//*[local-name(.)='DE']", action: "after" },
  }); 
  const signedXml = sig.getSignedXml(); 

  return signedXml;
};

export const firmarDocumento = async (
  dRucEm: string, IdcSC: string, CSC: string,
  data: any
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const xmlBuffer = Buffer.from(data).toString("utf8");
    // console.log('xmlBuffer', xmlBuffer)
    const pemPath = path.join(__dirname, "../../certificates", `${dRucEm}.pem`);
    const pubPath = path.join(__dirname, "../../certificates", `${dRucEm}.pub`);
    // console.log('pemPath', pemPath)
    if (!fs.existsSync(pemPath) || !fs.existsSync(pubPath)) {
      return {
        success: false,
        error: "Certificates not found for RUC: " + dRucEm,
      };
    }

    const pemContent = await fs.promises.readFile(pemPath, "utf8");
    const pubContent = await fs.promises.readFile(pubPath, "utf8");
    
    const xmlSigned = await firmar(xmlBuffer, pemContent, pubContent);

    const digestValue = await obtenerDigestValue(xmlSigned);
    const qrData = await obtenerDatosQr(xmlBuffer, digestValue);

    const cdc = await obtenerCDC(xmlBuffer);
    const concatenated = crearStringQr(qrData, cdc, IdcSC, CSC);
    // console.log('concatenated', concatenated)
    const hashHex = generarHash(concatenated);

    const url = crearQrUrl(qrData, cdc, hashHex, IdcSC);

    const result = await generarQRUrl(xmlSigned, url);

    return { success: true, data: result };
  } catch (error) {
    console.error("Error signing factura XML:", error);
    return { success: false, error: "Internal server error" };
  }
};