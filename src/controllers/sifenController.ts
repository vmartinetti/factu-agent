import axios, { isAxiosError } from 'axios';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { NODE_ENV } from '../config';


export async function sendZip(zipId: number, emisorRuc: string,base64zip: string) {
  const url = NODE_ENV === "production" ? "https://sifen.set.gov.py/de/ws/async/recibe-lote.wsdl" : "https://sifen-test.set.gov.py/de/ws/async/recibe-lote.wsdl";
  const p12Path = path.resolve(__dirname, `../../certificates/${emisorRuc}.p12`);
  const p12Password = 'Fp3!yE4y';

  const httpsAgent = new https.Agent({
    pfx: fs.readFileSync(p12Path),
    passphrase: p12Password,
  });

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
        'Content-Type': 'application/soap+xml; charset=utf-8',
      },
      httpsAgent,
    });
    console.log("Zip sent to SIFEN!");
    return { success: true, data: response.data };
  } catch (error) {
    if(isAxiosError(error)) {
      console.error('Error sending zip to sifen:', error.response?.data);
      return { success: false, error: error.response?.data };
    }
    return { success: false, error };
  }
};
