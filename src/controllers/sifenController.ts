import axios, { isAxiosError } from "axios";
import xml2js from "xml2js";
import { NODE_ENV } from "../config";
import { getHttpAgent } from "./helpers";
// import util from "util";

const parser = new xml2js.Parser(
  {explicitArray: false,  // Prevent wrapping values in arrays
    ignoreAttrs: false,    // Keep attributes if needed
    mergeAttrs: true,      // Merge attributes directly into the object
    tagNameProcessors: [(name) => name.replace(/^.+:/, '')]}
);

export async function sendZip(zipId: number, emisorRuc: string, base64zip: string) {
  const url = NODE_ENV === "production" ? "https://sifen.set.gov.py/de/ws/async/recibe-lote.wsdl" : "https://sifen-test.set.gov.py/de/ws/async/recibe-lote.wsdl";

  const soapEnvelope = `
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsd="http://ekuatia.set.gov.py/sifen/xsd">
      <soap:Header/>
      <soap:Body>
        <xsd:rEnvioLote>
          <xsd:dId>${zipId}</xsd:dId>
          <xsd:xDE>${base64zip}</xsd:xDE>
        </xsd:rEnvioLote>
      </soap:Body>
    </soap:Envelope>
  `;

  try {
    const response = await axios.post(url, soapEnvelope, {
      headers: {
        "Content-Type": "application/soap+xml; charset=utf-8",
      },
      httpsAgent: getHttpAgent(emisorRuc),
    });
    return { success: true, data: response.data };
  } catch (error) {
    if (isAxiosError(error)) {
      console.error("Error:", error.response?.data);
      if (error.response?.status === 500) {
        console.log("Error sending zip to SIFEN");
        return { success: false, error: error.response?.data };
      }
      return { success: false, error: error.response?.data };
    }
    return { success: false, error };
  }
}

export async function getLoteStatus(loteNro: number, zipId: number, emisorRuc: string) {
  const url = NODE_ENV === "production" ? "https://sifen.set.gov.py/de/ws/consultas/consulta-lote.wsdl" : "https://sifen-test.set.gov.py/de/ws/consultas/consulta-lote.wsdl";
  const soapEnvelope = `
  <soap:Envelope
	xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsd="http://ekuatia.set.gov.py/sifen/xsd">
	<soap:Header/>
	<soap:Body>
    <xsd:rEnviConsLoteDe>
        <xsd:dId>${zipId}</xsd:dId>
        <xsd:dProtConsLote>${loteNro}
        </xsd:dProtConsLote>
    </xsd:rEnviConsLoteDe>
    </soap:Body>
    </soap:Envelope>
  `;
  try {
    const response = await axios.post(url, soapEnvelope, {
      headers: {
        "Content-Type": "application/soap+xml; charset=utf-8",
      },
      httpsAgent: getHttpAgent(emisorRuc),
    });
    try {
      const result = await parser.parseStringPromise(response.data);
      const loteResult = result.Envelope?.Body?.rResEnviConsLoteDe?.dCodResLot;
      switch (loteResult) {
        case "0360":
          console.log("Zip status INEXISTENTE");
          return { success: true, data: [], status: "INEXISTENTE", xml: response.data };
        case "0361":
          console.log("Zip is still in process");
          return { success: false, error: "Zip is still pending" };
        case "0362":
          console.log("Zip process finished!");
          const invoices = result.Envelope?.Body?.rResEnviConsLoteDe?.gResProcLote
          const invoicesArray = Array.isArray(invoices) ? invoices : invoices ? [invoices] : [];
          return { success: true, data: invoicesArray, status: "PROCESADO", xml: response.data };
          
        case "0364":
          console.log("Zip was rejected by SIFEN");
          return { success: true, data: [], status: "EXTEMPORANEO", xml: response.data };
        default:
          console.log("Unknown status");
          return { success: false, error: "ERROR_UNKNOWN", xml: response.data };
      }
    } catch (error) {
      console.log('error', error)
      return { success: false, error: "Error parsing" };
    }
  } catch (error) {
    if (isAxiosError(error)) {
      console.error("Error:", error.response?.data);
      if (error.response?.status === 500) {
        console.log("Error sending zip to SIFEN");
        return { success: false, error: error.response?.data };
      }
      return { success: false, error: error.response?.data };
    }
    return { success: false, error };
  }
}
