import { ZodError } from "zod";
import { documentoSchema } from "../schemas/documentoSchema";
import xml2js from "xml2js";
import { xmlToJsonUtil } from "xml-to-json-util";
import { SignedXml } from "xml-crypto";
import fs from "fs";
import crypto from "crypto";
import { NODE_ENV } from "../config";
import { Invoice } from "../models/invoice";
import { Company } from "../models/company";
import { getCertificatePaths } from "./certificateController";

const parser = new xml2js.Parser();
const builder = new xml2js.Builder({ renderOpts: { pretty: false }, headless: true });

export async function validateJSON(invoiceJSON: any) {
  try {
    documentoSchema.parse(invoiceJSON);
    return { success: true, errors: null };
  } catch (err) {
    if (err instanceof ZodError) {
      const simplifiedErrors = err.errors.map((error) => ({
        field: error.path.length > 0 ? error.path.join(".") : undefined,
        message: error.message,
      }));
      return { success: false, errors: simplifiedErrors };
    } else {
      return { success: false, errors: "Error desconocido" };
    }
  }
}

export function getCDCSinDv(invoiceJSON: any) {
  const CDCData: CDCData = {
    dEst: invoiceJSON.dEst,
    dPunExp: invoiceJSON.dPunExp,
    dNumDoc: invoiceJSON.dNumDoc,
    dFeEmiDE: invoiceJSON.dFeEmiDE,
    dCodSeg: invoiceJSON.dCodSeg,
    iTipCont: invoiceJSON.iTipCont,
    dRucEm: invoiceJSON.dRucEm,
    dDVEmi: invoiceJSON.dDVEmi.toString(),
    iTipEmi: invoiceJSON.iTipEmi.toString(),
  };
  const requiredFields = ["dEst", "dPunExp", "dNumDoc", "dFeEmiDE", "dCodSeg", "iTipCont", "dRucEm", "dDVEmi", "iTipEmi"];
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
  return `${facturaElectronica}${ruc}${digitoVerificador}${establecimiento}${puntoExpedicion}${numeroDocumento}${tipoContribuyente}${fechaEmision}${tipoEmision}${codigoDeSeguridad}`;
}

export function calcularDV(p_numero: string): number {
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
}

export function eliminarValoresNulos(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(eliminarValoresNulos).filter((item) => item !== null && item !== undefined);
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
}

export function getXMLFromDocumento(doc: any): string | null {
  try {
    return builder.buildObject(doc);
  } catch (error) {
    console.error(error);
    return null;
  }
}
// digipar-xml-remision-signer
export function getFullXML(xml: string, cdcSinDv: string, dv: number, _securityCode: string): string {
  try {
    const parsedXml = xmlToJsonUtil(xml);
    const xmlResult = {
      DE: {
        $: {
          Id: `${cdcSinDv}${dv}`,
        },
        ...parsedXml.DE,
        dDVId: dv,
      },
    };
    // Construye el objeto XML completo
    // const obj = {
    //   "soap:Envelope": {
    //     $: { "xmlns:soap": "http://www.w3.org/2003/05/soap-envelope" },
    //     "soap:Header": {},
    //     "soap:Body": {
    //       rEnviDe: {
    //         $: { xmlns: "http://ekuatia.set.gov.py/sifen/xsd" },
    //         dId: securityCode,
    //         xDE: {
    //           rDE: {
    //             $: {
    //               xmlns: "http://ekuatia.set.gov.py/sifen/xsd",
    //               "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    //               "xsi:schemaLocation": "http://ekuatia.set.gov.py/sifen/xsd siRecepDE_v150.xsd",
    //             },
    //             dVerFor: 150,
    //             ...xmlResult,
    //             gCamFuFD: {
    //               dCarQR: {},
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // };
    // construye el objeto XML solo del rDE
    const obj = {
      rDE: {
        $: {
          xmlns: "http://ekuatia.set.gov.py/sifen/xsd",
          "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "xsi:schemaLocation": "http://ekuatia.set.gov.py/sifen/xsd siRecepDE_v150.xsd",
        },
        dVerFor: 150,
        ...xmlResult,
        gCamFuFD: {
          dCarQR: {},
        },
      },
    };
    return builder.buildObject(obj);
  } catch (err) {
    console.error(err);
    return "";
  }
}

export const keyProvider = {
  getKey: (filePath: string) => {
    return fs.readFileSync(filePath, "utf8");
  },

  getKeyInfo: (filePath: string) => {
    const keyContent = keyProvider.getKey(filePath).replace(/\n|\r/g, "");
    return `<X509Data><X509Certificate>${keyContent}</X509Certificate></X509Data>`;
  },
};

async function getDigestValue(xml: string): Promise<string> {
  const result = await parser.parseStringPromise(xml);
  // const digestValue = result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0]["Signature"][0]["SignedInfo"][0]["Reference"][0]["DigestValue"][0];
  const digestValue = result["rDE"]["Signature"][0]["SignedInfo"][0]["Reference"][0]["DigestValue"][0];
  return digestValue;
}

async function getSHA256Hash(inputString: string): Promise<string> {
  const encoder = new TextEncoder(); // Uses UTF-8 encoding by default
  const data = encoder.encode(inputString);

  // Apply SHA-256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert hash to hex
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // Create byte array
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");

  return hashHex;
}

async function getQRData(xml: string, digestValue: string) {
  let docType = "";
  const result = await parser.parseStringPromise(xml);
  let docNumber = "";
  let dTotGralOpe = 0;
  let dTotIVA = 0;

  // const nVersion = result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0]["dVerFor"][0];
  // const DE = result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0]["DE"][0];
  const nVersion = result["rDE"]["dVerFor"][0];
  const DE = result["rDE"]["DE"][0];
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

  if (iTiDE === "1" || iTiDE === "5") {
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
}

const writeQRUrl = (xml: string, url: string) => {
  let xmlWithUrl = "";
  parser.parseString(xml, function (err, result) {
    if (err) {
      console.error("Error parsing XML in writeQRUrl:", err);
      return;
    }
    // result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0]["gCamFuFD"][0]["dCarQR"] = url;
    result["rDE"]["gCamFuFD"][0]["dCarQR"] = url;
    const builder = new xml2js.Builder({
      renderOpts: { pretty: false },
      headless: true,
    });
    xmlWithUrl = builder.buildObject(result);
  });
  return xmlWithUrl;
};

export async function signXML(xml: string, ruc: string, cdc: string, IdcSC: string, CSC: string): Promise<string | null> {
  try {
    // const projectRoot = path.resolve(__dirname, "../../certificates/");
    // const certificadoPemPath = path.join(projectRoot, `${ruc}.pem`);
    // const certificadoPubPath = path.join(projectRoot, `${ruc}.pub`);

    
    // const certificadoPem = fs.readFileSync(certificadoPemPath, "utf8");
    const paths = await getCertificatePaths(ruc);
    if (!paths) {
      console.error("Error getting certificate paths");
      return null;
    }
    const { certificadoPemPath, certificadoPubPath } = paths;
    
    if (!fs.existsSync(certificadoPemPath)) {
      console.log(`No se encontró el archivo PEM en la ruta: ${certificadoPemPath}`);
      return null;
    }
    if (!fs.existsSync(certificadoPubPath)) {
      console.log(`No se encontró el archivo PUB en la ruta: ${certificadoPubPath}`);
      return null;
    }
    
    const certificadoPem = fs.readFileSync(certificadoPemPath, "utf8");

    const sig = new SignedXml();
    sig.signatureAlgorithm = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
    sig.canonicalizationAlgorithm = "http://www.w3.org/2001/10/xml-exc-c14n#";
    if (!IdcSC && !CSC) {
      sig.addReference("//*[local-name(.)='rEve']", ["http://www.w3.org/2000/09/xmldsig#enveloped-signature", "http://www.w3.org/2001/10/xml-exc-c14n#"], "http://www.w3.org/2001/04/xmlenc#sha256");
    }else {
      sig.addReference("//*[local-name(.)='DE']", ["http://www.w3.org/2000/09/xmldsig#enveloped-signature", "http://www.w3.org/2001/10/xml-exc-c14n#"], "http://www.w3.org/2001/04/xmlenc#sha256");
    }

    sig.signingKey = Buffer.from(certificadoPem);
    sig.keyInfoProvider = {
      file: certificadoPubPath,
      getKey: () => Buffer.from(keyProvider.getKey(certificadoPubPath)),
      getKeyInfo: () => keyProvider.getKeyInfo(certificadoPubPath),
    };

    if (!IdcSC && !CSC) {
      sig.computeSignature(xml, {
        location: { reference: "//*[local-name(.)='rEve']", action: "after" },
      });
    }else {
      sig.computeSignature(xml, {
        location: { reference: "//*[local-name(.)='DE']", action: "after" },
      });
    }

    const xmlSigned = sig.getSignedXml();

    if (!IdcSC && !CSC) {
      // Para firmar eventos
      return xmlSigned;
    }

    const digestValue = await getDigestValue(xmlSigned);
    const QRData = await getQRData(xml, digestValue);

    if (!QRData) {
      console.error("Error getting QR data");
      return null;
    }

    const {
      nVersion,
      dFeEmiDEHex,
      docNumber,
      docType,
      dTotGralOpe,
      dTotIVA,
      cItems,
      DigestValueHex,
      // iTiDE
    } = QRData;

    let concatenated = `nVersion=${nVersion}&Id=${cdc}&dFeEmiDE=${dFeEmiDEHex}&${docType}=${docNumber}&dTotGralOpe=${dTotGralOpe}&dTotIVA=${dTotIVA}&cItems=${cItems}&DigestValue=${DigestValueHex}&IdCSC=${IdcSC}${CSC}`;
    const hashHex = await getSHA256Hash(concatenated);
    const baseUrl = NODE_ENV === "production" ? "https://ekuatia.set.gov.py/consultas/qr?" : "https://ekuatia.set.gov.py/consultas-test/qr?";
    let url = `${baseUrl}nVersion=${nVersion}&Id=${cdc}&dFeEmiDE=${dFeEmiDEHex}&${docType}=${docNumber}&dTotGralOpe=${dTotGralOpe}&dTotIVA=${dTotIVA}&cItems=${cItems}&DigestValue=${DigestValueHex}&IdCSC=${IdcSC}&cHashQR=${hashHex}`;
    const signedXmlWithQR = writeQRUrl(xmlSigned, url);
    return signedXmlWithQR;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function getNewCDC(invoice: Invoice, company: Company, securityCode: number): string {
  // Construcción del CDC
  const CDCData = {
    documentoTipo: "01", // Tipo de documento TODO: make this dynamic
    ruc: company.ruc.split("-")[0]!.padStart(8, "0"), // RUC con padding de 8 caracteres
    digitoVerificador: company.ruc.split("-")[1]!, // Dígito verificador
    establecimiento: invoice.salespointSucursal.toString().padStart(3, "0"), // Establecimiento (3 caracteres)
    puntoExpedicion: invoice.salespointPunto.toString().padStart(3, "0"), // Punto de expedición (3 caracteres)
    numeroDocumento: invoice.number.toString().padStart(7, "0"), // Número de documento (7 caracteres)
    tipoContribuyente: company.type, // Tipo de contribuyente (Fijo)
    fechaEmision: invoice.dateIssued.replace(/-/g, ""), // Fecha de emisión en formato YYYYMMDD
    tipoEmision: "1", // Tipo de emisión
    codigoDeSeguridad: securityCode.toString().padStart(9, "0"), // Código de seguridad (9 caracteres)
  };
  const CDC = `${CDCData.documentoTipo}${CDCData.ruc}${CDCData.digitoVerificador}${CDCData.establecimiento}${CDCData.puntoExpedicion}${CDCData.numeroDocumento}${CDCData.tipoContribuyente}${CDCData.fechaEmision}${CDCData.tipoEmision}${CDCData.codigoDeSeguridad}`;
  const DV = calcularDV(CDC);
  // Construir el CDC
  return `${CDC}${DV}`;
}
