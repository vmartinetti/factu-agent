import fs from "fs";
import forge from "node-forge";
import path from "path";
// import { getCompanyByRuc } from "./companyController";
// import { calcularDV } from "./documentController";

// Example usage
// const p12Path = "./2509803.p12";
// const password = "#CmHV08q";

// .pem complete extraction
// openssl pkcs12 -in 2509803.p12 -nodes -out 2509803_complete.pem
// .pub certificate extraction
// sed -n '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/p' 2509803.pem | sed '1d;$d' > 2509803.pub


const projectRoot = path.resolve(__dirname, "../../certificates/");

// TODO: USE this function
export function extractPemFromP12(p12Path: string, ruc: string, password: string): boolean {
  const p12Buffer = fs.readFileSync(p12Path);
  const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString("binary"));
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag }) ?? {};
  if (!forge.pki.oids.certBag || !forge.pki.oids.pkcs8ShroudedKeyBag) {
    console.error("OIDs are undefined");
    return false;
  }
  const certBagArray = certBags[forge.pki.oids.certBag];
  const certBag = certBagArray ? (certBagArray[0] as forge.pkcs12.Bag) : undefined;
  if (!certBag) {
    console.error("Certificate bag is empty or undefined");
    return false;
  }
  const cert = certBag.cert;
  if (!cert) {
    console.error("Certificate is undefined");
    return false;
  }
  const keyBagArray = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag] || [];
  const keyBag = keyBagArray ? (keyBagArray[0] as forge.pkcs12.Bag) : undefined;
  if (!keyBag) {
    console.error("Key bag is empty or undefined");
    return false;
  }
  const key = keyBag.key;
  if (!key) {
    console.error("Private key is undefined");
    return false;
  }

  const pemCert = forge.pki.certificateToPem(cert);
  let pemKey = forge.pki.privateKeyToPem(key);

  // Remove the initial and final RSA key markers
  pemKey = pemKey.replace("-----BEGIN RSA PRIVATE KEY-----", "").replace("-----END RSA PRIVATE KEY-----", "").trim();
  try {
    fs.writeFileSync(path.join(projectRoot, `${ruc}.pem`), pemCert);
    fs.writeFileSync(path.join(projectRoot, `${ruc}.pub`), pemKey);
  } catch (error) {
    console.error("Error writing PEM/PUB files", error);
    return false;
  }

  console.log("PEM files have been created: certificate.pem and privateKey.pem");
  return true;
}

// extractPemFromP12(p12Path, password);

export async function getCertificatePaths(ruc: string): Promise<{ certificadoPemPath: string; certificadoPubPath: string } | null> {
  const certificadoPemPath = path.join(projectRoot, `${ruc}.pem`);
  const certificadoPubPath = path.join(projectRoot, `${ruc}.pub`);
  // check if the files exist
  if (!fs.existsSync(certificadoPemPath) || !fs.existsSync(certificadoPubPath)) {
    return null;
    // TODO: implement all of this
    // const certificadoP12Path = path.join(projectRoot, `${ruc}.p12`);
    // if (!fs.existsSync(certificadoP12Path)) {
    //   console.error(`Certificate P12 file not found: ${certificadoP12Path}`);
    //   return null;
    // }
    // const dv = calcularDV(ruc);
    // if (!dv) {
    //   console.error("Error calculating DV");
    //   return null;
    // }
    // const rucWithDV = `${ruc}-${dv}`;
    // const company = await getCompanyByRuc(rucWithDV);
    // if (!company) {
    //   console.error("Company not found");
    //   return null;
    // }
    // if (!company.certificatePassword) {
    //   console.error("Certificate password not found");
    //   return null;
    // }
    // const password = company.certificatePassword;
    // const success = extractPemFromP12(certificadoP12Path, ruc, password);
    // if (!success) {
    //   console.error("Error extracting PEM/PUB files");
    //   return null;
    // }
  }
  return {
    certificadoPemPath,
    certificadoPubPath,
  };
}
