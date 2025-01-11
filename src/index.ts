
import { ZodError } from 'zod';
import { getFirstPendingInvoice, getInvoiceJSON } from './controllers/invoiceController';
import { sequelize } from './database';
import { Company } from './models/company';
import { InvoiceItem } from './models/invoiceItem';
import { documentoSchema } from './schemas/documentoSchema';
import { buildItemsDet, calcularDV, eliminarValoresNulos, formarCdcSinDv, generateXml, getDescription, getgCamCond, getgCamDEAsoc, getgCamFE, getgCamNCDE, getgDatRec, getgOpeCom, getgTotSub } from './controllers/helpers';
import { dDesTiDEList, dDesTipEmiList } from './constants';
import { ciudadesList, departamentosList, distritosList } from './geographic';

// test database connection with sequelize
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
    main();
}).catch((error) => {
    console.error('Unable to connect to the database:', error);
})

async function main() {
  const invoice = await getFirstPendingInvoice();
  if (!invoice) {
      console.log("No pending invoices found");
      return;
  }
  const company = await Company.findOne({where: {id: invoice.companyId}});
  if (!company) {
      console.log("Company not found");
      return;
  }
  const invoiceItems = await InvoiceItem.findAll({where: {invoiceId: invoice.id}});
  if (!invoiceItems) {
      console.log("No invoice items found");
      return;
  }
  const invoiceJSON = await getInvoiceJSON(invoice, company, invoiceItems);
  if(!invoiceJSON){
    console.log("Error generating invoice JSON");
    return;
  }
  // test with zod
  try{
    documentoSchema.parse(invoiceJSON);
  }catch(err){
    if (err instanceof ZodError) {
      const simplifiedErrors = err.errors.map((error) => ({
        field: error.path.length > 0 ? error.path.join(".") : undefined,
        message: error.message,
      }));
      return console.log(simplifiedErrors)
    } else {
      return console.log("Error desconocido:", err );
    }
  }

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
  const CDCData: CDCData = {
    dEst: invoiceJSON.dEst,
    dPunExp: invoiceJSON.dPunExp,
    dNumDoc: invoiceJSON.dNumDoc,
    dFeEmiDE: invoiceJSON.dFeEmiDE,
    dCodSeg: invoiceJSON.dCodSeg,
    iTipCont: invoiceJSON.iTipCont,
    dRucEm: invoiceJSON.dRucEm,
    dDVEmi: invoiceJSON.dDVEmi.toString(),
    iTipEmi: invoiceJSON.iTipEmi.toString()
  }
  const cdcSinDv: string | null = formarCdcSinDv(CDCData);

  if (!cdcSinDv) {
    return console.log("Fallo en la formación del CDC sin DV")
    // Marcar en base de datos como error
  }
  const dv = calcularDV(cdcSinDv);
  let cdc = `${cdcSinDv}${dv}`; 

  // 
  const documentoConNulos = {
    rDE: {
      $:{
        "xmlns":"http://ekuatia.set.gov.py/sifen/xsd",
        "xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance",
        "xsi:schemaLocation":"http://ekuatia.set.gov.py/sifen/xsd siRecepDE_v150.xsd"
      },
      dVerFor: 150,
      DE: {
        $:{
          "Id": cdc,
        },
        dDVId: dv,
        dFecFirma: "2024-12-04T12:12:07",
        dSisFact: 1,
        gOpeDE: {
          iTipEmi: invoiceJSON.iTipEmi,
          dDesTipEmi: getDescription(invoiceJSON.iTipEmi, dDesTipEmiList),
          dCodSeg: invoiceJSON.dCodSeg,
        },
        gTimb: {
          iTiDE: invoiceJSON.iTiDE,
          dDesTiDE: getDescription(invoiceJSON.iTiDE, dDesTiDEList),
          dNumTim: invoiceJSON.dNumTim,
          dEst: invoiceJSON.dEst,
          dPunExp: invoiceJSON.dPunExp,
          dNumDoc: invoiceJSON.dNumDoc,
          dFeIniT: invoiceJSON.dFeIniT,
        },
        gDatGralOpe: {
          dFeEmiDE: invoiceJSON.dFeEmiDE,
          gOpeCom: getgOpeCom(invoiceJSON),
          gEmis:{
            dRucEm: invoiceJSON.dRucEm,
            dDVEmi: invoiceJSON.dDVEmi,
            iTipCont: invoiceJSON.iTipCont, 
            dNomEmi: invoiceJSON.dNomEmi,
            dDirEmi: invoiceJSON.dDirEmi,
            dNumCas: invoiceJSON.dNumCas,
            cDepEmi: invoiceJSON.cDepEmi,
            dDesDepEmi: getDescription(invoiceJSON.cDepEmi, departamentosList),
            cDisEmi:invoiceJSON.cDisEmi,
            dDesDisEmi: getDescription(invoiceJSON.cDisEmi, distritosList),
            cCiuEmi: invoiceJSON.cCiuEmi,
            dDesCiuEmi: getDescription(invoiceJSON.cCiuEmi, ciudadesList),
            dTelEmi: invoiceJSON.dTelEmi,
            dEmailE: invoiceJSON.dEmailE,
            dDenSuc: invoiceJSON.dDenSuc,
            gActEco:{
              cActEco: invoiceJSON.cActEco,
              dDesActEco: invoiceJSON.dDesActEco
            }
          },
          gDatRec: getgDatRec(invoiceJSON)
        },
        gDtipDE:{
          gCamFE: getgCamFE(invoiceJSON),
          gCamNCDE: getgCamNCDE(invoiceJSON),
          // gCamNRE: getgCamNRE(),
          gCamCond: getgCamCond(invoiceJSON),
          // gTransp: getgTransp(),
          gCamItem: buildItemsDet(invoiceJSON.itemsDet, invoiceJSON), 
        },
        gTotSub: getgTotSub(invoiceJSON),
        gCamDEAsoc: getgCamDEAsoc(invoiceJSON),
      },
      gCamFuFD:{
        dCarQR:''
      }
    },
  }; 

  const documento = eliminarValoresNulos(documentoConNulos);
  // console.log('documento', documento)
  const xmlPrefirma = await generateXml(documento);
  console.log('xmlPrefirma', xmlPrefirma)
}
