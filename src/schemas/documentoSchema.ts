
import moment from "moment";
import { z } from "zod";
import {
  distritosList,
  ciudadesList,
  paisesList,
  departamentosList,
} from "../geographic";
import { dDesMoneOpeList, dDesDenTarjList, dDesUniMedList } from "../constants";

const documentoSchemaItems = z.object({
  dCodInt: z
    .string({
      invalid_type_error: "El campo dCodInt debe ser del tipo alfanumérico",
    })
    .trim()
    .min(1, {
      message: "El campo dCodInt debe de tener un mínimo de 1 carácter",
    })
    .max(20, {
      message: "El campo dCodInt puede tener hasta un máximo de 20 caracteres",
    }),

  dDesProSer: z
    .string({
      invalid_type_error: "El campo dDesProSer debe ser del tipo alfanumérico",
    })
    .trim()
    .min(1, {
      message: "El campo dDesProSer debe de tener un mínimo de 1 carácter",
    })
    .max(120, {
      message:
        "El campo dDesProSer puede tener hasta un máximo de 20 caracteres",
    }),

  cUniMed: z
    .number({
      invalid_type_error: "El campo cUniMed debe ser del tipo numérico",
    })
    .int({ message: "El campo cUniMed debe ser un número entero" })
    .refine((value) => value.toString().length >= 1, {
      message: "El campo cUniMed debe tener un mínimo de 1 dígito",
    })
    .refine((value) => value.toString().length <= 5, {
      message: "El campo cUniMed debe tener como máximo 5 dígitos",
    }),

  dCantProSer: z
    .number({
      invalid_type_error: "El campo dCantProSer debe ser numérico",
    })
    .positive({ message: "El campo dCantProSer debe ser un número positivo" })
    .refine(
      (value) => {
        const [integerPart, decimalPart] = value.toString().split(".");
        const isIntegerValid =
        integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 10;
        const isDecimalValid = !decimalPart || decimalPart.length <= 4;
        return isIntegerValid && isDecimalValid;
      },
      {
        message:
          "El campo dCantProSer debe tener hasta 10 dígitos en la parte entera y hasta 4 decimales",
      }
    ),

  dPUniProSer: z
    .number({
      invalid_type_error: "El campo dPUniProSer debe ser numérico",
    })
    .min(0,{ message: "El campo dPUniProSer debe ser un número positivo" })
    .refine(
      (value) => {
        const [integerPart, decimalPart] = value.toString().split(".");
        const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
        const isDecimalValid = !decimalPart || decimalPart.length <= 8;
        return isIntegerValid && isDecimalValid;
      },
      {
        message:
          "El campo dPUniProSer debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
      }
    )
    .optional(),

  dTiCamIt: z
    .number({
      invalid_type_error: "El campo dTiCamIt debe ser numérico",
    })
    .positive({ message: "El campo dTiCamIt debe ser un número positivo" })
    .refine((value) => value.toString().replace(".", "").length <= 5, {
      message:
        "El campo dTiCamIt debe tener entre 1 y 5 dígitos, incluyendo decimales",
    })
    .optional(),

  dTotBruOpeItem: z
    .number({
      invalid_type_error: "El campo dTotBruOpeItem debe ser numérico",
    })
    .min(0,{
      message: "El campo dTotBruOpeItem debe ser un número positivo",
    })
    .refine(
      (value) => {
        const [integerPart, decimalPart] = value.toString().split(".");
        const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
        const isDecimalValid = !decimalPart || decimalPart.length <= 8;
        return isIntegerValid && isDecimalValid;
      },
      {
        message:
          "El campo dTotBruOpeItem debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
      }
    )
    .optional(),

  dDescItem: z
    .number({
      invalid_type_error: "El campo dDescItem debe ser numérico",
    })
    .refine(
      (value) => {
        const [integerPart, decimalPart] = value.toString().split(".");
        const isIntegerValid =
        integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
        const isDecimalValid = !decimalPart || decimalPart.length <= 8;
        return isIntegerValid && isDecimalValid;
      },
      {
        message:
          "El campo dDescItem debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
      }
    )
    .optional(),

  dPorcDesIt: z
    .number({
      invalid_type_error: "El campo dPorcDesIt debe ser numérico",
    })
    .positive({
      message: "El campo dPorcDesIt debe ser un número positivo",
    })
    .refine(
      (value) => {
        const [integerPart, decimalPart] = value.toString().split(".");
        const isIntegerValid =
        integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 3;
        const isDecimalValid = !decimalPart || decimalPart.length <= 8;
        return isIntegerValid && isDecimalValid;
      },
      {
        message:
          "El campo dPorcDesIt debe tener hasta 3 dígitos en la parte entera y hasta 8 dígitos decimales",
      }
    )
    .optional(),

  dDescGloItem: z
    .number({
      invalid_type_error: "El campo dDescGloItem debe ser numérico",
    })
    .positive({
      message: "El campo dDescGloItem debe ser un número positivo",
    })
    .refine(
      (value) => {
        const [integerPart, decimalPart] = value.toString().split(".");
        const isIntegerValid =
        integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
        const isDecimalValid = !decimalPart || decimalPart.length <= 8;
        return isIntegerValid && isDecimalValid;
      },
      {
        message:
          "El campo dDescGloItem debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
      }
    )
    .optional(),

  dAntPreUniIt: z
    .number({
      invalid_type_error: "El campo dAntPreUniIt debe ser numérico",
    })
    .refine(
      (value) => {
        const [integerPart, decimalPart] = value.toString().split(".");
        const isIntegerValid =
        integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
        const isDecimalValid = !decimalPart || decimalPart.length <= 8;
        return isIntegerValid && isDecimalValid;
      },
      {
        message:
          "El campo dAntPreUniIt debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
      }
    )
    .optional(),

  dAntGloPreUniIt: z
    .number({
      invalid_type_error: "El campo dAntGloPreUniIt debe ser numérico",
    })
    .refine(
      (value) => {
        const [integerPart, decimalPart] = value.toString().split(".");
        const isIntegerValid =
        integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
        const isDecimalValid = !decimalPart || decimalPart.length <= 8;
        return isIntegerValid && isDecimalValid;
      },
      {
        message:
          "El campo dAntGloPreUniIt debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
      }
    )
    .optional(),

  dTotOpeItem: z
    .number({
      invalid_type_error: "El campo dTotOpeItem debe ser numérico",
    })
    .min(0,{
      message: "El campo dTotOpeItem debe ser un número positivo",
    })
    .refine(
      (value) => {
        const [integerPart, decimalPart] = value.toString().split(".");
        const isIntegerValid =
        integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
        const isDecimalValid = !decimalPart || decimalPart.length <= 8;
        return isIntegerValid && isDecimalValid;
      },
      {
        message:
          "El campo dTotOpeItem debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
      }
    )
    .optional(),

  dTotOpeGs: z
    .number({
      invalid_type_error: "El campo dTotOpeGs debe ser numérico",
    })
    .positive({
      message: "El campo dTotOpeGs debe ser un número positivo",
    })
    .refine(
      (value) => {
        const [integerPart, decimalPart] = value.toString().split(".");
        const isIntegerValid =
        integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
        const isDecimalValid = !decimalPart || decimalPart.length <= 8;
        return isIntegerValid && isDecimalValid;
      },
      {
        message:
          "El campo dTotOpeGs debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
      }
    )
    .optional(),

  iAfecIVA: z
    .number({
      invalid_type_error: "El campo iAfecIVA debe ser del tipo numérico",
    })
    .int({ message: "El campo iAfecIVA debe ser del tipo numérico" })
    .refine((value) => value >= 1 && value <= 4, {
      message:
        "El campo iAfecIVA debe ser 1 (Gravado IVA) o 2 (Exonerado - Art.83-Ley 125/91) o 3 (Exento) o 4 (Gravado parcial - Grav-Exento).",
    })
    .optional(),

  dPropIVA: z
    .number({
      invalid_type_error: "El campo dPropIVA debe ser numérico",
    })
    .refine((value) => value.toString().replace(".", "").length <= 3, {
      message:
        "El campo dPropIVA debe tener entre 1 y 3 dígitos, incluyendo decimales",
    })
    .optional(),

  dTasaIVA: z
    .number({
      invalid_type_error: "El campo dTasaIVA debe ser del tipo numérico",
    })
    .int({ message: "El campo dTasaIVA debe ser un número entero" })
    .refine((value) => value.toString().length >= 1, {
      message: "El campo dTasaIVA debe tener un mínimo de 1 dígito",
    })
    .refine((value) => value.toString().length <= 2, {
      message: "El campo dTasaIVA debe tener como máximo 2 dígitos",
    })
    .optional(),

  dBasGravIVA: z
    .number({
      invalid_type_error: "El campo dBasGravIVA debe ser numérico",
    })
    .refine(
      (value) => {
        console.log('value', value)
        const [integerPart, decimalPart] = value.toString().split(".");
        const isIntegerValid =
        integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
        const isDecimalValid = !decimalPart || decimalPart.length <= 8;
        return isIntegerValid && isDecimalValid;
      },
      {
        message:
          "El campo dBasGravIVA debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
      }
    )
    .optional(),

  dLiqIVAItem: z
    .number({
      invalid_type_error: "El campo dLiqIVAItem debe ser numérico",
    })
    .refine(
      (value) => {
        const [integerPart, decimalPart] = value.toString().split(".");
        const isIntegerValid =
        integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
        const isDecimalValid = !decimalPart || decimalPart.length <= 8;
        return isIntegerValid && isDecimalValid;
      },
      {
        message:
          "El campo dLiqIVAItem debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
      }
    )
    .optional(),
});

export const documentoSchema = z
  .object({
    iTipEmi: z
      .number({
        invalid_type_error: "El campo iTipEmi debe ser del tipo numérico",
      })
      .int({ message: "El campo iTipEmi debe ser del tipo numérico" })
      .refine((value: number) => value >= 1 && value <= 2, {
        message: "El campo iTipEmi debe ser 1 (Normal) o 2 (Contingencia)",
      }),

    // ToDo: Revisar si pedimos o generamos el codigo de seguridad.
    dCodSeg: z
      .number({
        invalid_type_error: "El campo dCodSeg debe ser del tipo string numerico",
      })
      .refine((value) => /^\d{9}$/.test(value.toString()), {
        message:
          "El campo dCodSeg debe contener exactamente 9 dígitos numéricos",
      }),

    dInfoEmi: z
      .string({
        invalid_type_error: "El campo dInfoEmi debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dInfoEmi debe tener un mínimo de 1 caracter",
      })
      .max(3000, {
        message: "El campo dInfoEmi debe tener un máximo de 3000 caracteres",
      })
      .optional(),

    dInfoFisc: z
      .string({
        invalid_type_error: "El campo dInfoFisc debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dInfoFisc debe tener un mínimo de 1 caracter",
      })
      .max(3000, {
        message: "El campo dInfoFisc debe tener un máximo de 3000 caracteres",
      })
      .optional(),

    iTiDE: z
      .number({
        invalid_type_error: "El campo iTiDE debe ser del tipo numérico",
      })
      .int({ message: "El campo iTiDE debe ser del tipo numérico" })
      .refine((value: number) => value >= 1 && value <= 8, {
        message: `El campo iTiDE debe ser 1 (Factura electrónica) o 2 (Factura electrónica de exportación) o 3 (Factura electrónica de importación) o 4 (Autofactura electrónica) o 5 (Nota de crédito electrónica) o 6 (Nota de débito electrónica) o 7 (Nota de remisión electrónica) o 8 (Comprobante de retención electrónico)`,
      }),

    dNumTim: z
      .string({
        invalid_type_error: "El campo dNumTim debe ser del tipo alfanumérico",
      }).length(8, {
        message: "El campo dNumTim debe tener exactamente 8 caracteres",
      }),

      // .number({
      //   invalid_type_error: "El campo dNumTim debe ser del tipo numérico",
      // })
      // .refine((value) => /^\d{7}$/.test(value.toString()), {
      //   message: "El campo dNumTim debe tener exactamente 8 dígitos",
      // }),

    dEst: z
      .string({
        invalid_type_error: "El campo dEst debe ser del tipo alfanumérico",
      })
      .trim()
      .length(3, {
        message: "El campo dEst debe tener exactamente 3 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dEst debe ser alfanumérico",
      }),

    dPunExp: z
      .string({
        invalid_type_error: "El campo dPunExp debe ser del tipo alfanumérico",
      })
      .trim()
      .length(3, {
        message: "El campo dPunExp debe tener exactamente 3 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dPunExp debe ser alfanumérico",
      }),

    dNumDoc: z
      .string({
        invalid_type_error: "El campo dNumDoc debe ser del tipo alfanumérico",
      })
      .trim()
      .length(7, {
        message: "El campo dNumDoc debe tener exactamente 7 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dNumDoc debe ser alfanumérico",
      }),

    dSerieNum: z
      .string({
        invalid_type_error: "El campo dSerieNum debe ser del tipo alfanumérico",
      })
      .trim()
      .length(2, {
        message: "El campo dSerieNum debe tener exactamente 2 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dSerieNum debe ser alfanumérico",
      })
      .optional(),

    dFeIniT: z
      .string({
        invalid_type_error:
          "El campo dFeIniT debe ser una fecha en formato AAAA-MM-DD",
      })
      .refine((value) => moment(value, "YYYY-MM-DD", true).isValid(), {
        message:
          "El campo dFeIniT debe ser una fecha válida en formato AAAA-MM-DD",
      })
      .refine((value) => moment(value).isBetween("1900-01-01", "2100-12-31"), {
        message:
          "El campo dFeIniT debe estar dentro del rango de fechas permitidas (1900-01-01 a 2100-12-31)",
      }),

    dFeEmiDE: z
      .string({
        invalid_type_error:
          "El campo dFeEmiDE debe ser una fecha y hora en formato AAAA-MM-DDThh:mm:ss",
      })
      .refine((value) => moment(value, "YYYY-MM-DDTHH:mm:ss", true).isValid(), {
        message:
          "El campo dFeEmiDE debe ser una fecha y hora válida en formato AAAA-MM-DDThh:mm:ss",
      })
      .refine((value) => moment(value).isBetween("1900-01-01", "2100-12-31"), {
        message:
          "El campo dFeEmiDE debe estar dentro del rango de fechas permitidas (1900-01-01 a 2100-12-31)",
      }),

    iTipTra: z
      .number({
        invalid_type_error: "El campo iTipTra debe ser del tipo numérico",
      })
      .int({ message: "El campo iTipTra debe ser un número entero" })
      .refine((value) => value >= 1 && value <= 13, {
        message:
          "El valor de iTipTra debe estar entre 1 y 13. Los valores válidos son: 1 (Venta de mercadería), 2 (Prestación de servicios), 3 (Mixto - Venta de mercadería y servicios), 4 (Venta de activo fijo), 5 (Venta de divisas), 6 (Compra de divisas), 7 (Promoción o entrega de muestras), 8 (Donación), 9 (Anticipo), 10 (Compra de productos), 11 (Compra de servicios), 12 (Venta de crédito fiscal), 13 (Muestras médicas).",
      })
      .optional(),

    iTImp: z
      .number({
        invalid_type_error: "El campo iTImp debe ser del tipo numérico",
      })
      .int()
      .refine((value: number) => value >= 1 && value <= 5, {
        message: `El campo iTImp debe ser 1 (IVA), 2 (ISC), 3 (Renta), 4 (Ninguno), 5 (IVA - Renta)`,
      })
      .optional(),

    cMoneOpe: z
      .string({
        invalid_type_error: "El campo cMoneOpe debe ser del tipo alfanumérico",
      })
      .length(3, {
        message: "El campo cMoneOpe debe tener exactamente 3 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo cMoneOpe debe ser alfanumérico",
      })
      .optional(),

    dCondTiCam: z
      .number({
        invalid_type_error: "El campo dCondTiCam debe ser del tipo numérico",
      })
      .int({ message: "El campo dCondTiCam debe ser un número entero" })
      .refine((value) => value.toString().length === 1, {
        message: "El campo dCondTiCam debe tener exactamente 1 dígito numérico",
      })
      .optional(),

    dTiCam: z
      .number({
        invalid_type_error: "El campo dTiCam debe ser numérico",
      })
      .positive({ message: "El campo dTiCam debe ser un número positivo" })
      .refine((value) => value.toString().replace(".", "").length <= 9, {
        message:
          "El campo dTiCam debe tener entre 1 y 9 dígitos, incluyendo decimales",
      })
      .optional(),

    iCondAnt: z
      .number({
        invalid_type_error: "El campo iCondAnt debe ser del tipo numérico",
      })
      .int()
      .refine((value) => value === undefined || (value >= 1 && value <= 2), {
        message:
          "El campo iCondAnt debe ser 1 (Anticipo Global) o 2 (Anticipo por Item)",
      })
      .optional(),

    dRucEm: z
      .string({
        invalid_type_error: "El campo dRucEm debe ser del tipo alfanumérico",
      })
      .trim()
      .min(3, {
        message: "El campo dRucEm debe tener un mínimo de 3 caracter",
      })
      .max(8, {
        message: "El campo dRucEm debe tener un máximo de 8 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dRucEm debe ser alfanumérico",
      }),

    dDVEmi: z
      .number({
        invalid_type_error: "El campo dDVEmi debe ser del tipo numérico",
      })
      .int({ message: "El campo dDVEmi debe ser un número entero" })
      .refine((value) => value.toString().length === 1, {
        message: "El campo dDVEmi debe tener exactamente 1 dígito numérico",
      }),

    iTipCont: z
      .number({
        invalid_type_error: "El campo iTipCont debe ser del tipo numérico",
      })
      .int({ message: "El campo iTipCont debe ser del tipo numérico" })
      .refine((value: number) => value >= 1 && value <= 2, {
        message:
          "El campo iTipCont debe ser 1 (Persona Física) o 2 (Persona Jurídica)",
      }),

    dNomEmi: z
      .string({
        invalid_type_error: "El campo dNomEmi debe ser del tipo alfanumérico",
      })
      .trim()
      .min(4, {
        message: "El campo dNomEmi debe tener un mínimo de 4 caracteres",
      })
      .max(255, {
        message: "El campo dNomEmi debe tener un máximo de 255 caracteres",
      }),

    dDirEmi: z
      .string({
        invalid_type_error: "El campo dDirEmi debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dDirEmi debe tener un mínimo de 1 caracteres",
      })
      .max(255, {
        message: "El campo dDirEmi debe tener un máximo de 255 caracteres",
      }),

    dNumCas: z
      .number({
        invalid_type_error: "El campo dNumCas debe ser del tipo numérico",
      })
      .int({ message: "El campo dNumCas debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo dNumCas debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 6, {
        message: "El campo dNumCas debe tener como máximo 6 dígitos",
      }),

    cDepEmi: z
      .number({
        invalid_type_error: "El campo cDepEmi debe ser del tipo numérico",
      })
      .int({ message: "El campo cDepEmi debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo cDepEmi debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 2, {
        message: "El campo cDepEmi debe tener como máximo 2 dígitos",
      }),

    cCiuEmi: z
      .number({
        invalid_type_error: "El campo cCiuEmi debe ser del tipo numérico",
      })
      .int({ message: "El campo cCiuEmi debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo cCiuEmi debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 5, {
        message: "El campo cCiuEmi debe tener como máximo 5 dígitos",
      }),

    dTelEmi: z
      .string({
        invalid_type_error: "El campo dTelEmi debe ser del tipo alfanumérico",
      })
      .trim()
      .min(6, {
        message: "El campo dTelEmi debe tener un mínimo de 6 caracteres",
      })
      .max(15, {
        message: "El campo dTelEmi debe tener un máximo de 15 caracteres",
      }),

    dEmailE: z
      .string({
        invalid_type_error: "El campo dEmailE debe ser del tipo alfanumérico",
      })
      .trim()
      .min(3, {
        message: "El campo dEmailE debe tener un mínimo de 3 caracteres",
      })
      .max(80, {
        message: "El campo dEmailE debe tener un máximo de 80 caracteres",
      }),

    iTipIDRespDE: z
      .number({
        invalid_type_error: "El campo iTipIDRespDE debe ser del tipo numérico",
      })
      .int({ message: "El campo iTipIDRespDE debe ser del tipo numérico" })
      .refine((value: number) => value >= 1 && value <= 5, {
        message:
          "El campo iTipIDRespDE debe ser 1 (Cédula paraguaya), 2 (Pasaporte), 3 (Cédula extranjera), 4 (Carnet de residencia) o 5 (Otro)",
      }),

    dNumIDRespDE: z
      .string({
        invalid_type_error:
          "El campo dNumIDRespDE debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dNumIDRespDE debe tener un mínimo de 1 caracter",
      })
      .max(20, {
        message: "El campo dNumIDRespDE debe tener un máximo de 20 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dNumIDRespDE debe ser alfanumérico",
      }),

    dNomRespDE: z
      .string({
        invalid_type_error:
          "El campo dNomRespDE debe ser del tipo alfanumérico",
      })
      .trim()
      .min(4, {
        message: "El campo dNomRespDE debe tener un mínimo de 4 caracteres",
      })
      .max(255, {
        message: "El campo dNomRespDE debe tener un máximo de 255 caracteres",
      }),

    dCarRespDE: z
      .string({
        invalid_type_error:
          "El campo dCarRespDE debe ser del tipo alfanumérico",
      })
      .trim()
      .min(4, {
        message: "El campo dCarRespDE debe tener un mínimo de 4 caracteres",
      })
      .max(100, {
        message: "El campo dCarRespDE debe tener un máximo de 100 caracteres",
      }),

    iNatRec: z
      .number({
        invalid_type_error: "El campo iNatRec debe ser del tipo numérico",
      })
      .int({ message: "El campo iNatRec debe ser un número entero" })
      .refine((value: number) => value >= 1 && value <= 2, {
        message:
          "El campo iNatRec debe ser 1 (Contribuyente) o 2 (No contribuyente)",
      }),

    iTiOpe: z
      .number({
        invalid_type_error: "El campo iTiOpe debe ser del tipo numérico",
      })
      .int({ message: "El campo iTiOpe debe ser un número entero" })
      .refine((value: number) => value >= 1 && value <= 4, {
        message:
          "El campo iTiOpe debe ser 1 (B2B) o 2 (B2C) o 3 (B2G) o 4 (B2F)",
      }),

    cPaisRec: z
      .string({
        invalid_type_error: "El campo cPaisRec debe ser del tipo alfanumérico",
      })
      .length(3, {
        message: "El campo cPaisRec debe tener exactamente 3 caracteres",
      })
      .refine((value) => /^[A-Z]+$/.test(value), {
        message: "El campo cPaisRec debe ser alfabético y en mayúsculas",
      }),

    iTiContRec: z
      .number({
        invalid_type_error: "El campo iTiContRec debe ser del tipo numérico",
      })
      .int({ message: "El campo iTiContRec debe ser un número entero" })
      .refine((value) => value >= 1 && value <= 2, {
        message:
          "El campo iTiContRec debe ser 1 (Persona Física) o 2 (Persona Jurídica)",
      })
      .optional(),

    dRucRec: z
      .string({
        invalid_type_error: "El campo dRucRec debe ser del tipo alfanumérico",
      })
      .trim()
      .min(3, {
        message: "El campo dRucRec debe tener un mínimo de 3 caracteres",
      })
      .max(8, {
        message: "El campo dRucRec debe tener un máximo de 8 caracteres",
      })
      .optional(),

    dDVRec: z
      .number({
        invalid_type_error: "El campo dDVRec debe ser del tipo numérico",
      })
      .refine((value) => /^\d{1}$/.test(value.toString()), {
        message: "El campo dDVRec debe contener exactamente 1 dígito numérico",
      })
      .optional(),

    iTipIDRec: z
      .number({
        invalid_type_error: "El campo iTipIDRec debe ser del tipo numérico",
      })
      .int({ message: "El campo iTipIDRec debe ser un número entero" })
      .refine((value) => (value >= 1 && value <= 6) || value === 9, {
        message:
          "El campo iTipIDRec debe ser 1 (Cédula paraguaya), 2 (Pasaporte), 3 (Cédula extranjera), 4 (Carnet de residencia), 5 (Innominado), 6 (Tarjeta Diplomática de exoneración fiscal) o 9 (Otro).",
      })
      .optional(),

    dNumIDRec: z
      .string({
        invalid_type_error: "El campo dNumIDRec debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dNumIDRec debe tener un mínimo de 1 carácter",
      })
      .max(20, {
        message: "El campo dNumIDRec debe tener como máximo 20 caracteres",
      })
      .optional(),

    dDTipIDRec: z
      .string({
        invalid_type_error:
          "El campo dDTipIDRec debe ser del tipo alfanumérico",
      })
      .trim()
      .min(9, {
        message: "El campo dDTipIDRec debe tener un mínimo de 9 caracteres",
      })
      .max(41, {
        message: "El campo dDTipIDRec debe tener como máximo 41 caracteres",
      })
      .optional(),

    dNomRec: z
      .string({
        invalid_type_error: "El campo dNomRec debe ser del tipo alfanumérico",
      })
      .trim()
      .min(4, {
        message: "El campo dNomRec debe tener un mínimo de 4 caracteres",
      })
      .max(255, {
        message: "El campo dNomRec debe tener como máximo 255 caracteres",
      }),

    dNomFanRec: z
      .string({
        invalid_type_error:
          "El campo dNomFanRec debe ser del tipo alfanumérico",
      })
      .trim()
      .min(4, {
        message: "El campo dNomFanRec debe tener un mínimo de 4 caracteres",
      })
      .max(255, {
        message: "El campo dNomFanRec debe tener como máximo 255 caracteres",
      })
      .optional(),

    dDirRec: z
      .string({
        invalid_type_error: "El campo dDirRec debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dDirRec debe tener un mínimo de 1 carácter",
      })
      .max(255, {
        message: "El campo dDirRec debe tener como máximo 255 caracteres",
      })
      .optional(),

    dNumCasRec: z
      .number({
        invalid_type_error: "El campo dNumCasRec debe ser del tipo numérico",
      })
      .int({ message: "El campo dNumCasRec debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo dNumCasRec debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 6, {
        message: "El campo dNumCasRec debe tener como máximo 6 dígitos",
      })
      .optional(),

    cDepRec: z
      .number({
        invalid_type_error: "El campo cDepRec debe ser del tipo numérico",
      })
      .int({ message: "El campo cDepRec debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo cDepRec debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 2, {
        message: "El campo cDepRec debe tener como máximo 2 dígitos",
      })
      .optional(),

    cDisRec: z
      .number({
        invalid_type_error: "El campo cDisRec debe ser del tipo numérico",
      })
      .int({ message: "El campo cDisRec debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo cDisRec debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 4, {
        message: "El campo cDisRec debe tener como máximo 4 dígitos",
      })
      .optional(),

    cCiuRec: z
      .number({
        invalid_type_error: "El campo cCiuRec debe ser del tipo numérico",
      })
      .int({ message: "El campo cCiuRec debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo cCiuRec debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 5, {
        message: "El campo cCiuRec debe tener como máximo 5 dígitos",
      })
      .optional(),

    dTelRec: z
      .string({
        invalid_type_error: "El campo dTelRec debe ser del tipo alfanumérico",
      })
      .trim()
      .min(6, {
        message: "El campo dTelRec debe tener un mínimo de 6 caracteres",
      })
      .max(15, {
        message: "El campo dTelRec debe tener como máximo 15 caracteres",
      })
      .optional(),

    dCelRec: z
      .string({
        invalid_type_error: "El campo dCelRec debe ser del tipo alfanumérico",
      })
      .min(10, {
        message: "El campo dCelRec debe tener un mínimo de 10 caracteres",
      })
      .max(20, {
        message: "El campo dCelRec debe tener como máximo 20 caracteres",
      })
      .optional(),

    dEmailRec: z
      .string({
        invalid_type_error: "El campo dEmailRec debe ser del tipo alfanumérico",
      })
      .trim()
      .min(3, {
        message: "El campo dEmailRec debe tener un mínimo de 3 caracteres",
      })
      .max(80, {
        message: "El campo dEmailRec debe tener como máximo 80 caracteres",
      })
      .optional(),

    dCodCliente: z
      .string({
        invalid_type_error:
          "El campo dCodCliente debe ser del tipo alfanumérico",
      })
      .trim()
      .min(3, {
        message: "El campo dCodCliente debe tener un mínimo de 3 caracteres",
      })
      .max(15, {
        message: "El campo dCodCliente debe tener como máximo 15 caracteres",
      })
      .optional(),

    iIndPres: z
      .number({
        invalid_type_error: "El campo iIndPres debe ser del tipo numérico",
      })
      .int({ message: "El campo iIndPres debe ser del tipo numérico" })
      .refine((value) => (value >= 1 && value <= 6) || value === 9, {
        message:
          "El campo iIndPres debe ser 1 (Operación presencial) o 2 (Operación electrónica) o 3 (Operación telemarketing) o 4 (Venta a domicilio) o 5 (Operación bancaria) o 6 (Operación cíclica) o 9 (Otro).",
      }),

    dFecEmNR: z
      .string({
        invalid_type_error:
          "El campo dFecEmNR debe ser una fecha en formato AAAA-MM-DD",
      })
      .refine((value) => moment(value, "YYYY-MM-DD", true).isValid(), {
        message:
          "El campo dFecEmNR debe ser una fecha válida en formato AAAA-MM-DD",
      })
      .refine((value) => moment(value).isBetween("1900-01-01", "2100-12-31"), {
        message:
          "El campo dFecEmNR debe estar dentro del rango de fechas permitidas (1900-01-01 a 2100-12-31)",
      })
      .optional(),

    iMotEmi: z
      .number({
        invalid_type_error: "El campo iMotEmi debe ser del tipo numérico",
      })
      .int({ message: "El campo iMotEmi debe ser del tipo numérico" })
      .refine((value) => value >= 1 && value <= 8, {
        message:
          "El campo iMotEmi debe ser 1 (Traslado por venta) o 2 (Devolución) o 3 (Descuento) o 4 (Bonificación) o 5 (Crédito incobrable) o 6 (Recupero de costo) o 7 (Recupero de gasto) o 8 (Ajuste de precio)",
      })
      .optional(),

    iMotEmiNR: z
      .number({
        invalid_type_error: "El campo iMotEmiNR debe ser del tipo numérico",
      })
      .int({ message: "El campo iMotEmiNR debe ser del tipo numérico" })
      .refine((value) => (value >= 1 && value <= 14) || value === 99, {
        message:
          "El campo iMotEmiNR debe ser 1 (Traslado por venta) o 2 (Traslado por consignación) o 3 (Exportación) o 4 (Traslado por compra) o 5 (Importación) o 6 (Traslado por devolución) o 7 (Traslado entre locales de la empresa) o 8 (Traslado de bienes por transformación) o 9 (Traslado de bienes por reparación) o 10 (Traslado por emisor móvil) o 11 (Exhibición o demostració) o 12 (Participación en ferias) o 13 (Traslado de encomienda) o 14 (Decomiso) o 99 (Otro)",
      })
      .optional(),

    iRespEmiNR: z
      .number({
        invalid_type_error: "El campo iRespEmiNR debe ser del tipo numérico",
      })
      .int({ message: "El campo iRespEmiNR debe ser del tipo numérico" })
      .refine((value) => value >= 1 && value <= 5, {
        message:
          "El campo iRespEmiNR debe ser 1 (Emisor de la factura) o 2 (Poseedor de la factura y bienes) o 3 (Empresa transportista) o 4 (Despachante de Aduanas) o 5 (Agente de transporte o intermediario)",
      })
      .optional(),

    dKmR: z
      .number({
        invalid_type_error: "El campo dKmR debe ser del tipo numérico",
      })
      .int({ message: "El campo dKmR debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo dKmR debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 5, {
        message: "El campo dKmR debe tener como máximo 5 dígitos",
      })
      .optional(),

    dFecEm: z
      .string({
        invalid_type_error:
          "El campo dFecEm debe ser una fecha en formato AAAA-MM-DD",
      })
      .refine((value) => moment(value, "YYYY-MM-DD", true).isValid(), {
        message:
          "El campo dFecEm debe ser una fecha válida en formato AAAA-MM-DD",
      })
      .refine((value) => moment(value).isBetween("1900-01-01", "2100-12-31"), {
        message:
          "El campo dFecEm debe estar dentro del rango de fechas permitidas (1900-01-01 a 2100-12-31)",
      })
      .optional(),

    iCondOpe: z
      .number({
        invalid_type_error: "El campo iCondOpe debe ser del tipo numérico",
      })
      .int({ message: "El campo iCondOpe debe ser del tipo numérico" })
      .refine((value) => value >= 1 && value <= 5, {
        message: "El campo iCondOpe debe ser 1 (Contado) o 2 (Crédito)",
      })
      .optional(),

    iTiPago: z
      .number({
        invalid_type_error: "El campo iTiPago debe ser del tipo numérico",
      })
      .int({ message: "El campo iTiPago debe ser del tipo numérico" })
      .refine((value) => (value >= 1 && value <= 21) || value === 99, {
        message:
          "El campo iTiPago debe ser 1 (Efectivo) o 2 (Cheque) o 3 (Tarjeta de crédito) o 4 (Tarjeta de débito) o 5 (Transferencia), 6 (Giro) o 7 (Billetera electrónica) o 8 (Tarjeta empresarial) o 9 (Vale) o 10 (Retención) o 11 (Pago por anticipo) o 12 (Valor fiscal) o 13 (Valor comercial) o 14 (Compensación) o 15 (Permuta) o 16 (Pago bancario) o 17 (Pago Móvil) o 18 (Donación) o 19 (Promoción) o 20 (Consumo Interno) o 21 (Pago Electrónico) o 99 (Otro)",
      }).optional(),

    dMonTiPag: z
      .number({
        invalid_type_error: "El campo dMonTiPag debe ser numérico",
      })
      .positive({ message: "El campo dMonTiPag debe ser un número positivo" })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 4;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dMonTiPag debe tener hasta 15 dígitos en la parte entera y hasta 4 dígitos decimales",
        }
      )
      .optional(),

    cMoneTiPag: z
      .string({
        invalid_type_error:
          "El campo cMoneTiPag debe ser del tipo alfanumérico",
      })
      .length(3, {
        message: "El campo cMoneTiPag debe tener exactamente 3 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo cMoneTiPag debe ser alfanumérico",
      })
      .optional(),

    dTiCamTiPag: z
      .number({
        invalid_type_error: "El campo dTiCamTiPag debe ser numérico",
      })
      .positive({ message: "El campo dTiCamTiPag debe ser un número positivo" })
      .refine((value) => value.toString().replace(".", "").length <= 5, {
        message:
          "El campo dTiCamTiPag debe tener entre 1 y 5 dígitos, incluyendo decimales",
      })
      .optional(),

    iDenTarj: z
      .number({
        invalid_type_error: "El campo iDenTarj debe ser numérico",
      })
      .int({ message: "El campo iDenTarj debe ser un número entero" })
      .refine(
        (value) => dDesDenTarjList.map((item) => item.id).includes(value),
        {
          message:
            "El campo iDenTarj debe ser 1 (Visa), 2 (Mastercard), 3 (American Express), 4 (Maestro), 5 (Panal), 6 (Cabal) o 99 (Otro)",
        }
      )
      .optional(),

    iForProPa: z
      .number({
        invalid_type_error: "El campo iForProPa debe ser del tipo numérico",
      })
      .int({ message: "El campo iForProPa debe ser del tipo numérico" })
      .refine((value) => (value >= 1 && value <= 2) || value === 9, {
        message:
          "El campo iForProPa debe ser 1 (POS) o 2 (Pago Electrónico) o 9 (Otro)",
      })
      .optional(),

    dNumCheq: z
      .string({
        invalid_type_error: "El campo dNumCheq debe ser del tipo alfanumérico",
      })
      .length(8, {
        message: "El campo dNumCheq debe tener exactamente 8 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dNumCheq debe ser alfanumérico",
      })
      .optional(),

    dBcoEmi: z
      .string({
        invalid_type_error: "El campo dBcoEmi debe ser del tipo alfanumérico",
      })
      .trim()
      .min(4, {
        message: "El campo dBcoEmi debe tener un mínimo de 4 caracteres",
      })
      .max(20, {
        message: "El campo dBcoEmi debe tener como máximo 20 caracteres",
      })
      .optional(),

    iCondCred: z
      .number({
        invalid_type_error: "El campo iCondCred debe ser del tipo numérico",
      })
      .int({ message: "El campo iCondCred debe ser del tipo numérico" })
      .refine((value) => value >= 1 && value <= 2, {
        message: "El campo iCondCred debe ser 1 (Plazo) o 2 (Cuota)",
      })
      .optional(),

    dPlazoCre: z
      .string({
        invalid_type_error: "El campo dPlazoCre debe ser del tipo alfanumérico",
      })
      .trim()
      .min(2, {
        message: "El campo dPlazoCre debe tener un mínimo de 2 caracteres",
      })
      .max(15, {
        message: "El campo dPlazoCre debe tener como máximo 15 caracteres",
      })
      .optional(),

    dCuotas: z
      .number({
        invalid_type_error: "El campo dCuotas debe ser del tipo numérico",
      })
      .int({ message: "El campo dCuotas debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo dCuotas debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 3, {
        message: "El campo dCuotas debe tener como máximo 3 dígitos",
      })
      .optional(),

    dMonEnt: z
      .number({
        invalid_type_error: "El campo dMonEnt debe ser numérico",
      })
      .positive({ message: "El campo dMonEnt debe ser un número positivo" })
      .refine((value) => value.toString().replace(".", "").length <= 15, {
        message:
          "El campo dMonEnt debe tener entre 1 y 15 dígitos, incluyendo decimales",
      })
      .optional(),

    cMoneCuo: z
      .string({
        invalid_type_error: "El campo cMoneCuo debe ser del tipo alfanumérico",
      })
      .length(3, {
        message: "El campo cMoneCuo debe tener exactamente 3 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo cMoneCuo debe ser alfanumérico",
      })
      .optional(),

    dMonCuota: z
      .number({
        invalid_type_error: "El campo dMonCuota debe ser numérico",
      })
      .positive({ message: "El campo dMonCuota debe ser un número positivo" })
      .refine((value) => value.toString().replace(".", "").length <= 15, {
        message:
          "El campo dMonCuota debe tener entre 1 y 15 dígitos, incluyendo decimales",
      })
      .optional(),

    dVencCuo: z
      .string({
        invalid_type_error:
          "El campo dVencCuo debe ser una fecha en formato AAAA-MM-DD",
      })
      .refine((value) => moment(value, "YYYY-MM-DD", true).isValid(), {
        message:
          "El campo dVencCuo debe ser una fecha válida en formato AAAA-MM-DD",
      })
      .refine((value) => moment(value).isBetween("1900-01-01", "2100-12-31"), {
        message:
          "El campo dVencCuo debe estar dentro del rango de fechas permitidas (1900-01-01 a 2100-12-31)",
      })
      .optional(),

    iTipTrans: z
      .number({
        invalid_type_error: "El campo iTipTrans debe ser del tipo numérico",
      })
      .int({ message: "El campo iTipTrans debe ser del tipo numérico" })
      .refine((value) => value >= 1 && value <= 2, {
        message: "El campo iTipTrans debe ser 1 (Propio) o 2 (Tercero)",
      })
      .optional(),

    iModTrans: z
      .number({
        invalid_type_error: "El campo iModTrans debe ser del tipo numérico",
      })
      .int({ message: "El campo iModTrans debe ser del tipo numérico" })
      .refine((value) => value >= 1 && value <= 4, {
        message:
          "El campo iModTrans debe ser 1 (Terrestre) o 2 (Fluvial) o 3 (Aéreo) o 4 (Multimodal)",
      })
      .optional(),

    iRespFlete: z
      .number({
        invalid_type_error: "El campo iRespFlete debe ser del tipo numérico",
      })
      .int({ message: "El campo iRespFlete debe ser del tipo numérico" })
      .refine((value) => value >= 1 && value <= 5, {
        message:
          "El campo iRespFlete debe ser 1 (Emisor de la Factura Electrónica) o 2 (Receptor de la Factura Electrónica) o 3 (Tercero) o 4 (Agente intermediario del transporte - cuando intervenga) o 5 (Transporte propio)",
      })
      .optional(),

    cCondNeg: z
      .string({
        invalid_type_error: "El campo cCondNeg debe ser del tipo alfanumérico",
      })
      .length(3, {
        message: "El campo cCondNeg debe tener exactamente 3 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo cCondNeg debe ser alfanumérico",
      })
      .optional(),

    dNuManif: z
      .string({
        invalid_type_error: "El campo dNuManif debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dNuManif debe tener un mínimo de 1 caracteres",
      })
      .max(15, {
        message: "El campo dNuManif debe tener como máximo 15 caracteres",
      })
      .optional(),

    dNuDespImp: z
      .string({
        invalid_type_error:
          "El campo dNuDespImp debe ser del tipo alfanumérico",
      })
      .length(16, {
        message: "El campo dNuDespImp debe tener exactamente 16 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dNuDespImp debe ser alfanumérico",
      })
      .optional(),

    dIniTras: z
      .string({
        invalid_type_error:
          "El campo dIniTras debe ser una fecha en formato AAAA-MM-DD",
      })
      .refine((value) => moment(value, "YYYY-MM-DD", true).isValid(), {
        message:
          "El campo dIniTras debe ser una fecha válida en formato AAAA-MM-DD",
      })
      .refine((value) => moment(value).isBetween("1900-01-01", "2100-12-31"), {
        message:
          "El campo dIniTras debe estar dentro del rango de fechas permitidas (1900-01-01 a 2100-12-31)",
      })
      .optional(),

    dFinTras: z
      .string({
        invalid_type_error:
          "El campo dFinTras debe ser una fecha en formato AAAA-MM-DD",
      })
      .refine((value) => moment(value, "YYYY-MM-DD", true).isValid(), {
        message:
          "El campo dFinTras debe ser una fecha válida en formato AAAA-MM-DD",
      })
      .refine((value) => moment(value).isBetween("1900-01-01", "2100-12-31"), {
        message:
          "El campo dFinTras debe estar dentro del rango de fechas permitidas (1900-01-01 a 2100-12-31)",
      })
      .optional(),

    cPaisDest: z
      .string({
        invalid_type_error: "El campo cPaisDest debe ser del tipo alfanumérico",
      })
      .length(3, {
        message: "El campo cPaisDest debe tener exactamente 3 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo cPaisDest debe ser alfanumérico",
      })
      .optional(),

    dDirLocSal: z
      .string({
        invalid_type_error:
          "El campo dDirLocSal debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dDirLocSal debe tener un mínimo de 1 carácter",
      })
      .max(255, {
        message: "El campo dDirLocSal debe tener como máximo 255 caracteres",
      })
      .optional(),

    dNumCasSal: z
      .number({
        invalid_type_error: "El campo dNumCasSal debe ser del tipo numérico",
      })
      .int({ message: "El campo dNumCasSal debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo dNumCasSal debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 6, {
        message: "El campo dNumCasSal debe tener como máximo 6 dígitos",
      })
      .optional(),

    dComp1Sal: z
      .string({
        invalid_type_error: "El campo dComp1Sal debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dComp1Sal debe tener un mínimo de 1 carácter",
      })
      .max(255, {
        message: "El campo dComp1Sal debe tener como máximo 255 caracteres",
      })
      .optional(),

    dComp2Sal: z
      .string({
        invalid_type_error: "El campo dComp2Sal debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dComp2Sal debe tener un mínimo de 1 carácter",
      })
      .max(255, {
        message: "El campo dComp2Sal debe tener como máximo 255 caracteres",
      })
      .optional(),

    cDepSal: z
      .number({
        invalid_type_error: "El campo cDepSal debe ser del tipo numérico",
      })
      .int({ message: "El campo cDepSal debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo cDepSal debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 2, {
        message: "El campo cDepSal debe tener como máximo 2 dígitos",
      })
      .optional(),

    cDisSal: z
      .number({
        invalid_type_error: "El campo cDisSal debe ser del tipo numérico",
      })
      .int({ message: "El campo cDisSal debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo cDisSal debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 4, {
        message: "El campo cDisSal debe tener como máximo 4 dígitos",
      })
      .optional(),

    cCiuSal: z
      .number({
        invalid_type_error: "El campo cCiuSal debe ser del tipo numérico",
      })
      .int({ message: "El campo cCiuSal debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo cCiuSal debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 5, {
        message: "El campo cCiuSal debe tener como máximo 5 dígitos",
      })
      .optional(),

    dTelSal: z
      .string({
        invalid_type_error: "El campo dTelSal debe ser del tipo alfanumérico",
      })
      .trim()
      .min(6, {
        message: "El campo dTelSal debe tener un mínimo de 6 caracteres",
      })
      .max(15, {
        message: "El campo dTelSal debe tener como máximo 15 caracteres",
      })
      .optional(),

    dDirLocEnt: z
      .string({
        invalid_type_error:
          "El campo dDirLocEnt debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dDirLocEnt debe tener un mínimo de 1 carácter",
      })
      .max(255, {
        message: "El campo dDirLocEnt debe tener como máximo 255 caracteres",
      })
      .optional(),

    dNumCasEnt: z
      .number({
        invalid_type_error: "El campo dNumCasEnt debe ser del tipo numérico",
      })
      .int({ message: "El campo dNumCasEnt debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo dNumCasEnt debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 6, {
        message: "El campo dNumCasEnt debe tener como máximo 6 dígitos",
      })
      .optional(),

    dComp1Ent: z
      .string({
        invalid_type_error: "El campo dComp1Ent debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dComp1Ent debe tener un mínimo de 1 carácter",
      })
      .max(255, {
        message: "El campo dComp1Ent debe tener como máximo 255 caracteres",
      })
      .optional(),

    dComp2Ent: z
      .string({
        invalid_type_error: "El campo dComp2Ent debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dComp2Ent debe tener un mínimo de 1 carácter",
      })
      .max(255, {
        message: "El campo dComp2Ent debe tener como máximo 255 caracteres",
      })
      .optional(),

    cDepEnt: z
      .number({
        invalid_type_error: "El campo cDepEnt debe ser del tipo numérico",
      })
      .int({ message: "El campo cDepEnt debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo cDepEnt debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 2, {
        message: "El campo cDepEnt debe tener como máximo 2 dígitos",
      })
      .optional(),

    cDisEnt: z
      .number({
        invalid_type_error: "El campo cDisEnt debe ser del tipo numérico",
      })
      .int({ message: "El campo cDisEnt debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo cDisEnt debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 4, {
        message: "El campo cDisEnt debe tener como máximo 4 dígitos",
      })
      .optional(),

    cCiuEnt: z
      .number({
        invalid_type_error: "El campo cCiuEnt debe ser del tipo numérico",
      })
      .int({ message: "El campo cCiuEnt debe ser un número entero" })
      .refine((value) => value.toString().length >= 1, {
        message: "El campo cCiuEnt debe tener un mínimo de 1 dígito",
      })
      .refine((value) => value.toString().length <= 5, {
        message: "El campo cCiuEnt debe tener como máximo 5 dígitos",
      })
      .optional(),

    dTelEnt: z
      .string({
        invalid_type_error: "El campo dTelEnt debe ser del tipo alfanumérico",
      })
      .trim()
      .min(6, {
        message: "El campo dTelEnt debe tener un mínimo de 6 caracteres",
      })
      .max(15, {
        message: "El campo dTelEnt debe tener como máximo 15 caracteres",
      })
      .optional(),

    dTiVehTras: z
      .string({
        invalid_type_error:
          "El campo dTiVehTras debe ser del tipo alfanumérico",
      })
      .trim()
      .min(4, {
        message: "El campo dTiVehTras debe tener un mínimo de 4 carácter",
      })
      .max(10, {
        message: "El campo dTiVehTras debe tener como máximo 10 caracteres",
      })
      .optional(),

    dMarVeh: z
      .string({
        invalid_type_error: "El campo dMarVeh debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dMarVeh debe tener un mínimo de 1 carácter",
      })
      .max(10, {
        message: "El campo dMarVeh debe tener como máximo 10 caracteres",
      })
      .optional(),

    dTipIdenVeh: z
      .number({
        invalid_type_error: "El campo dTipIdenVeh debe ser del tipo numérico",
      })
      .int({ message: "El campo dTipIdenVeh debe ser del tipo numérico" })
      .positive({ message: "El campo dTipIdenVeh debe ser un número positivo" })
      .refine((value) => value >= 1 && value <= 2, {
        message:
          "El campo dTipIdenVeh debe ser 1 (Número de identificación del vehículo) o 2 (Número de matrícula del vehículo)",
      })
      .optional(),

    dNroIDVeh: z
      .string({
        invalid_type_error: "El campo dNroIDVeh debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dNroIDVeh debe tener un mínimo de 1 carácter",
      })
      .max(20, {
        message: "El campo dNroIDVeh debe tener como máximo 20 caracteres",
      })
      .optional(),

    dAdicVeh: z
      .string({
        invalid_type_error: "El campo dAdicVeh debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dAdicVeh debe tener un mínimo de 1 carácter",
      })
      .max(20, {
        message: "El campo dAdicVeh debe tener como máximo 20 caracteres",
      })
      .optional(),

    dNroMatVeh: z
      .string({
        invalid_type_error:
          "El campo dNroMatVeh debe ser del tipo alfanumérico",
      })
      .length(6, {
        message: "El campo dNroMatVeh debe tener exactamente 6 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dNroMatVeh debe ser alfanumérico",
      })
      .optional(),

    dNroVuelo: z
      .string({
        invalid_type_error: "El campo dNroVuelo debe ser del tipo alfanumérico",
      })
      .length(6, {
        message: "El campo dNroVuelo debe tener exactamente 6 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dNroVuelo debe ser alfanumérico",
      })
      .optional(),

    iNatTrans: z
      .number({
        invalid_type_error: "El campo iNatTrans debe ser del tipo numérico",
      })
      .int({ message: "El campo iNatTrans debe ser del tipo numérico" })
      .refine((value) => value >= 1 && value <= 2, {
        message:
          "El campo iNatTrans debe ser 1 (Contribuyente) o 2 (No contribuyente)",
      })
      .optional(),

    dNomTrans: z
      .string({
        invalid_type_error: "El campo dNomTrans debe ser del tipo alfanumérico",
      })
      .trim()
      .min(4, {
        message: "El campo dNomTrans debe tener un mínimo de 4 carácteres",
      })
      .max(60, {
        message: "El campo dNomTrans debe tener como máximo 60 caracteres",
      })
      .optional(),

    dRucTrans: z
      .string({
        invalid_type_error: "El campo dRucTrans debe ser del tipo alfanumérico",
      })
      .trim()
      .min(3, {
        message: "El campo dRucTrans debe tener un mínimo de 3 carácteres",
      })
      .max(8, {
        message: "El campo dRucTrans debe tener como máximo 8 caracteres",
      })
      .optional(),

    dDVTrans: z
      .number({
        invalid_type_error: "El campo dDVTrans debe ser del tipo numérico",
      })
      .refine((value) => /^\d{1}$/.test(value.toString()), {
        message:
          "El campo dDVTrans debe contener exactamente 1 dígito numérico",
      })
      .optional(),

    iTipIDTrans: z
      .number({
        invalid_type_error: "El campo iTipIDTrans debe ser del tipo numérico",
      })
      .int({ message: "El campo iTipIDTrans debe ser del tipo numérico" })
      .refine((value) => value >= 1 && value <= 4, {
        message:
          "El campo iTipIDTrans debe ser 1 (Cédula paraguaya) o 2 (Pasaporte) o 3 (Cédula extranjera) o 4 (Carnet de residencia)",
      })
      .optional(),

    dNumIDTrans: z
      .string({
        invalid_type_error:
          "El campo dNumIDTrans debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dNumIDTrans debe tener un mínimo de 1 carácter",
      })
      .max(20, {
        message: "El campo dNumIDTrans debe tener como máximo 20 caracteres",
      })
      .optional(),

    cNacTrans: z
      .string({
        invalid_type_error: "El campo cNacTrans debe ser del tipo alfanumérico",
      })
      .length(3, {
        message: "El campo cNacTrans debe tener exactamente 3 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo cNacTrans debe ser alfanumérico",
      })
      .optional(),

    dNumIDChof: z
      .string({
        invalid_type_error:
          "El campo dNumIDChof debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dNumIDChof debe tener un mínimo de 1 carácter",
      })
      .max(20, {
        message: "El campo dNumIDChof debe tener como máximo 20 caracteres",
      })
      .optional(),

    dNomChof: z
      .string({
        invalid_type_error: "El campo dNomChof debe ser del tipo alfanumérico",
      })
      .trim()
      .min(4, {
        message: "El campo dNomChof debe tener un mínimo de 4 carácteres",
      })
      .max(60, {
        message: "El campo dNomChof debe tener como máximo 60 caracteres",
      })
      .optional(),

    dDomFisc: z
      .string({
        invalid_type_error: "El campo dDomFisc debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dDomFisc debe tener un mínimo de 1 carácter",
      })
      .max(150, {
        message: "El campo dDomFisc debe tener como máximo 150 caracteres",
      })
      .optional(),

    dDirChof: z
      .string({
        invalid_type_error: "El campo dDirChof debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dDirChof debe tener un mínimo de 1 carácter",
      })
      .max(255, {
        message: "El campo dDirChof debe tener como máximo 255 caracteres",
      })
      .optional(),

    dNombAg: z
      .string({
        invalid_type_error: "El campo dNombAg debe ser del tipo alfanumérico",
      })
      .trim()
      .min(4, {
        message: "El campo dNombAg debe tener un mínimo de 4 carácteres",
      })
      .max(60, {
        message: "El campo dNombAg debe tener como máximo 60 caracteres",
      })
      .optional(),

    dRucAg: z
      .string({
        invalid_type_error: "El campo dRucAg debe ser del tipo alfanumérico",
      })
      .trim()
      .min(3, {
        message: "El campo dRucAg debe tener un mínimo de 3 carácteres",
      })
      .max(8, {
        message: "El campo dRucAg debe tener como máximo 8 caracteres",
      })
      .optional(),

    dDVAg: z
      .number({
        invalid_type_error: "El campo dDVAg debe ser del tipo numérico",
      })
      .refine((value) => /^\d{1}$/.test(value.toString()), {
        message: "El campo dDVAg debe contener exactamente 1 dígito numérico",
      })
      .optional(),

    dDirAge: z
      .string({
        invalid_type_error: "El campo dDirAge debe ser del tipo alfanumérico",
      })
      .trim()
      .min(1, {
        message: "El campo dDirAge debe tener un mínimo de 1 carácter",
      })
      .max(255, {
        message: "El campo dDirAge debe tener como máximo 255 caracteres",
      })
      .optional(),

    dSubExe: z
      .number({
        invalid_type_error: "El campo dSubExe debe ser numérico",
      })
      .refine(
        (value) => {
          const valueString = value.toString();
          const [integerPart, decimalPart] = valueString.split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = decimalPart ? decimalPart.length <= 8 : true;

          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dSubExe debe tener hasta 15 dígitos en la parte entera y hasta 8 decimales",
        }
      )
      .optional(),

    dSubExo: z
      .number({
        invalid_type_error: "El campo dSubExo debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dSubExo debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dSub5: z
      .number({
        invalid_type_error: "El campo dSub5 debe ser numérico",
      })
      // .positive({ message: "El campo dSub5 debe ser un número positivo" })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dSub5 debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dSub10: z
      .number({
        invalid_type_error: "El campo dSub10 debe ser numérico",
      })
      // .positive({ message: "El campo dSub10 debe ser un número positivo" })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dSub10 debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dTotOpe: z
      .number({
        invalid_type_error: "El campo dTotOpe debe ser numérico",
      })
      .positive({ message: "El campo dTotOpe debe ser un número positivo" })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dTotOpe debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dTotDesc: z
      .number({
        invalid_type_error: "El campo dTotDesc debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dTotDesc debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dTotDescGlotem: z
      .number({
        invalid_type_error: "El campo dTotDescGlotem debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dTotDescGlotem debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dTotAntItem: z
      .number({
        invalid_type_error: "El campo dTotAntItem debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dTotAntItem debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dTotAnt: z
      .number({
        invalid_type_error: "El campo dTotAnt debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dTotAnt debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dPorcDescTotal: z
      .number({
        invalid_type_error: "El campo dPorcDescTotal debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 3;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dPorcDescTotal debe tener hasta 3 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dDescTotal: z
      .number({
        invalid_type_error: "El campo dDescTotal debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dDescTotal debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dAnticipo: z
      .number({
        invalid_type_error: "El campo dAnticipo debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dAnticipo debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dRedon: z
      .number({
        invalid_type_error: "El campo dRedon debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 3;
          const isDecimalValid = !decimalPart || decimalPart.length <= 4;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dRedon debe tener hasta 3 dígitos en la parte entera y hasta 4 dígitos decimales",
        }
      )
      .optional(),

    dComi: z
      .number({
        invalid_type_error: "El campo dComi debe ser numérico",
      })
      .positive({
        message: "El campo dComi debe ser un número positivo",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dComi debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dTotGralOpe: z
      .number({
        invalid_type_error: "El campo dTotGralOpe debe ser numérico",
      })
      .positive({
        message: "El campo dTotGralOpe debe ser un número positivo",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dTotGralOpe debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dIVA5: z
      .number({
        invalid_type_error: "El campo dIVA5 debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dIVA5 debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dIVA10: z
      .number({
        invalid_type_error: "El campo dIVA10 debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dIVA10 debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dLiqTotIVA5: z
      .number({
        invalid_type_error: "El campo dLiqTotIVA5 debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dLiqTotIVA5 debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dLiqTotIVA10: z
      .number({
        invalid_type_error: "El campo dLiqTotIVA10 debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dLiqTotIVA10 debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dIVAComi: z
      .number({
        invalid_type_error: "El campo dIVAComi debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dIVAComi debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dTotIVA: z
      .number({
        invalid_type_error: "El campo dTotIVA debe ser numérico",
      })
      // .positive({
      //   message: "El campo dTotIVA debe ser un número positivo",
      // })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dTotIVA debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dBaseGrav5: z
      .number({
        invalid_type_error: "El campo dBaseGrav5 debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dBaseGrav5 debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dBaseGrav10: z
      .number({
        invalid_type_error: "El campo dBaseGrav10 debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dBaseGrav10 debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dTBasGraIVA: z
      .number({
        invalid_type_error: "El campo dTBasGraIVA debe ser numérico",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dTBasGraIVA debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    dTotalGs: z
      .number({
        invalid_type_error: "El campo dTotalGs debe ser numérico",
      })
      .positive({
        message: "El campo dTotalGs debe ser un número positivo",
      })
      .refine(
        (value) => {
          const [integerPart, decimalPart] = value.toString().split(".");
          const isIntegerValid =
          integerPart !== undefined && integerPart.length >= 1 && integerPart.length <= 15;
          const isDecimalValid = !decimalPart || decimalPart.length <= 8;
          return isIntegerValid && isDecimalValid;
        },
        {
          message:
            "El campo dTotalGs debe tener hasta 15 dígitos en la parte entera y hasta 8 dígitos decimales",
        }
      )
      .optional(),

    iTipDocAso: z
      .number({
        invalid_type_error: "El campo iTipDocAso debe ser del tipo numérico",
      })
      .int({ message: "El campo iTipDocAso debe ser del tipo numérico" })
      .refine((value) => value >= 1 && value <= 3, {
        message:
          "El campo iTipDocAso debe ser 1 (Electrónico) o 2 (Impreso) o 3 (Constancia Electrónica)",
      })
      .optional(),

    dCdCDERef: z
      .string({
        invalid_type_error: "El campo dCdCDERef debe ser del tipo alfanumérico",
      })
      .length(44, {
        message: "El campo dCdCDERef debe tener exactamente 44 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dCdCDERef debe ser alfanumérico",
      })
      .optional(),

    dNTimDI: z
      .number({
        invalid_type_error: "El campo dNTimDI debe ser del tipo numérico",
      })
      .refine((value) => /^\d{8}$/.test(value.toString()), {
        message:
          "El campo dNTimDI debe contener exactamente 8 dígitos numéricos",
      })
      .optional(),

    dEstDocAso: z
      .string({
        invalid_type_error:
          "El campo dEstDocAso debe ser del tipo alfanumérico",
      })
      .length(3, {
        message: "El campo dEstDocAso debe tener exactamente 3 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dEstDocAso debe ser alfanumérico",
      })
      .optional(),

    dPExpDocAso: z
      .string({
        invalid_type_error:
          "El campo dPExpDocAso debe ser del tipo alfanumérico",
      })
      .length(3, {
        message: "El campo dPExpDocAso debe tener exactamente 3 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dPExpDocAso debe ser alfanumérico",
      })
      .optional(),

    dNumDocAso: z
      .string({
        invalid_type_error:
          "El campo dNumDocAso debe ser del tipo alfanumérico",
      })
      .length(7, {
        message: "El campo dNumDocAso debe tener exactamente 7 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dNumDocAso debe ser alfanumérico",
      })
      .optional(),

    iTipoDocAso: z
      .number({
        invalid_type_error: "El campo iTipoDocAso debe ser del tipo numérico",
      })
      .int({ message: "El campo iTipoDocAso debe ser del tipo numérico" })
      .refine((value) => value >= 1 && value <= 5, {
        message:
          "El campo iTipoDocAso debe ser 1 (Factura) o 2 (Nota de crédito) o 3 (Nota de débito) o 4 (Nota de remisión) o 5 (Comprobante de retención)",
      })
      .optional(),

    dFecEmiDI: z
      .string({
        invalid_type_error:
          "El campo dFecEmiDI debe ser una fecha en formato AAAA-MM-DD",
      })
      .refine((value) => moment(value, "YYYY-MM-DD", true).isValid(), {
        message:
          "El campo dFecEmiDI debe ser una fecha válida en formato AAAA-MM-DD",
      })
      .refine((value) => moment(value).isBetween("1900-01-01", "2100-12-31"), {
        message:
          "El campo dFecEmiDI debe estar dentro del rango de fechas permitidas (1900-01-01 a 2100-12-31)",
      })
      .optional(),

    dNumComRet: z
      .string({
        invalid_type_error:
          "El campo dNumComRet debe ser del tipo alfanumérico",
      })
      .length(15, {
        message: "El campo dNumComRet debe tener exactamente 15 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dNumComRet debe ser alfanumérico",
      })
      .optional(),

    dNumResCF: z
      .string({
        invalid_type_error: "El campo dNumResCF debe ser del tipo alfanumérico",
      })
      .length(15, {
        message: "El campo dNumResCF debe tener exactamente 15 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dNumResCF debe ser alfanumérico",
      })
      .optional(),

    iTipCons: z
      .number({
        invalid_type_error: "El campo iTipCons debe ser del tipo numérico",
      })
      .int({ message: "El campo iTipCons debe ser del tipo numérico" })
      .refine((value) => value >= 1 && value <= 2, {
        message:
          "El campo iTipCons debe ser 1 (Constancia de no ser contribuyente) o 2 (Constancia de microproductores) ",
      })
      .optional(),

    dNumCons: z
      .number({
        invalid_type_error: "El campo dNumCons debe ser del tipo numérico",
      })
      .refine((value) => /^\d{11}$/.test(value.toString()), {
        message:
          "El campo dNumCons debe contener exactamente 11 dígitos numéricos",
      })
      .optional(),

    dNumControl: z
      .string({
        invalid_type_error:
          "El campo dNumControl debe ser del tipo alfanumérico",
      })
      .length(8, {
        message: "El campo dNumControl debe tener exactamente 8 caracteres",
      })
      .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
        message: "El campo dNumControl debe ser alfanumérico",
      })
      .optional(),
    //poner items aca
    IdcSC: z
      .string({
        invalid_type_error: "El campo IdcSC debe ser del tipo alfanumérico",
      })
      .length(4, {
        message: "El campo IdcSC debe tener exactamente 4 caracteres",
      }),
    CSC: z
      .string({
        invalid_type_error: "El campo CSC debe ser del tipo alfanumérico",
      })
      .length(32, {
        message: "El campo CSC debe tener exactamente 32 caracteres",
      }),
    itemsDet: z.array(documentoSchemaItems),
  })
  .superRefine((data, ctx) => {
    const {
      iTiDE,
      dInfoFisc,
      iTImp,
      iTipTra,
      cMoneOpe,
      dCondTiCam,
      dTiCam,
      // iCondAnt,
      iTiContRec,
      iNatRec,
      dRucRec,
      dDVRec,
      iTiOpe,
      iTipIDRec,
      dNumIDRec,
      // dDTipIDRec,
      dDirRec,
      dNumCasRec,
      cDepRec,
      cPaisRec,
      cDisRec,
      cCiuRec,
      iIndPres,
      iMotEmi,
      iMotEmiNR,
      // dKmR,
      iCondOpe,
      iTiPago,
      dMonTiPag,
      cMoneTiPag,
      dNumCheq,
      dBcoEmi,
      iCondCred,
      dCuotas,
      cMoneCuo,
      dPlazoCre,
      dMonCuota,
      dVencCuo,
      itemsDet,
      iTipTrans,
      iModTrans,
      iRespFlete,
      dIniTras,
      dDirLocSal,
      cDepSal,
      cDisSal,
      cCiuSal,
      // dTelSal,
      dDirLocEnt,
      dNumCasEnt,
      // dComp1Ent,
      // dComp2Ent,
      cDepEnt,
      cDisEnt,
      cCiuEnt,
      // dTelEnt,
      dTiVehTras,
      dMarVeh,
      dTipIdenVeh,
      // dNroIDVeh,
      // dAdicVeh,
      // dNroMatVeh,
      // dNroVuelo,
      dPorcDescTotal,
      dRedon,
      dTotGralOpe,
      iTipDocAso,
      dCdCDERef,
      dNTimDI,
      dEstDocAso,
      dPExpDocAso,
      dNumDocAso,
      dFecEmiDI,
      dNumResCF,
      iTipCons,
      dNumCons,
      dNumControl,
      iNatTrans,
      dNomTrans,
      dNumIDChof,
      dNomChof,
      dMonEnt,
    } = data;

    if (iTiDE === 7) {
      if (!dInfoFisc || dInfoFisc.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dInfoFisc es requerido si iTiDE es 7 (Nota de remisión electrónica).",
          path: ["dInfoFisc"],
        });
      }
    }

    if (iTiDE !== 7) {
      if (iTImp === undefined || iTImp === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo iTImp es requerido si iTiDE no es 7 (Nota de remisión electrónica).",
          path: ["iTImp"],
        });
      }
    }

    if (iTiDE === 7) {
      if (iTipTra !== undefined && iTipTra !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo iTipTra no es requerido si iTiDE es 7 (Nota de remisión electrónica).",
          path: ["iTipTra"],
        });
      }
    } else if (iTiDE === 1 || iTiDE === 4) {
      if (iTipTra === undefined || iTipTra === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo iTipTra es requerido si iTiDE es 1 (Factura electrónica) o 4 (Autofactura electrónica).",
          path: ["iTipTra"],
        });
      }
    }

    if (iTiDE === 7) {
      if (cMoneOpe !== undefined && cMoneOpe !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo cMoneOpe no es requerido si iTiDE es 7 (Nota de remisión electrónica).",
          path: ["cMoneOpe"],
        });
      }
    } else {
      if (cMoneOpe === undefined || cMoneOpe === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo cMoneOpe es requerido si iTiDE es distinto de 7 (Nota de remisión electrónica).",
          path: ["cMoneOpe"],
        });
      }
    }

    if (iTiDE === 7) {
      if (dCondTiCam !== undefined && dCondTiCam !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El campo dCondTiCam no es requerido cuando iTiDE es 7.",
          path: ["dCondTiCam"],
        });
      }
    } else if (cMoneOpe !== "PYG") {
      if (dCondTiCam === undefined || dCondTiCam === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dCondTiCam es requerido cuando cMoneOpe es distinto de 'PYG'.",
          path: ["dCondTiCam"],
        });
      }
    }

    if (iTiDE === 7) {
      if (dTiCam !== undefined && dTiCam !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El campo dTiCam no es requerido cuando iTiDE es 7.",
          path: ["dTiCam"],
        });
      }
    } else {
      if (dCondTiCam === 1 && (dTiCam === undefined || dTiCam === null)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dTiCam es requerido cuando dCondTiCam es 1 (Global).",
          path: ["dTiCam"],
        });
      }

      if ((dCondTiCam === 2 || cMoneOpe === "PYG") && dTiCam !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dTiCam no es requerido cuando dCondTiCam es 2 o cMoneOpe es 'PYG'.",
          path: ["dTiCam"],
        });
      }
    }

    // if (iTiDE !== 7) {
    //   if (iCondAnt === undefined || iCondAnt === null) {
    //     ctx.addIssue({
    //       code: z.ZodIssueCode.custom,
    //       message: "El campo iCondAnt es requerido si iTiDE no es 7.",
    //       path: ["iCondAnt"],
    //     });
    //   }
    // }

    if (iNatRec === 1) {
      if (iTiContRec === undefined || iTiContRec === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo iTiContRec es requerido si iNatRec es 1 (Contribuyente).",
          path: ["iTiContRec"],
        });
      }
    }

    if (iNatRec === 1) {
      if (dRucRec === undefined || dRucRec === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dRucRec es requerido si iNatRec es 1 (Contribuyente).",
          path: ["dRucRec"],
        });
      }
    } else if (iNatRec === 2) {
      if (dRucRec !== undefined && dRucRec !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dRucRec no es requerido cuando iNatRec es 2 (No contribuyente).",
          path: ["dRucRec"],
        });
      }
    }

    if (dRucRec !== undefined && dRucRec !== null) {
      if (dDVRec === undefined || dDVRec === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El campo dDVRec es requerido si existe el campo dRucRec.",
          path: ["dDVRec"],
        });
      }
    }

    if (iNatRec === 2 && iTiOpe !== 4) {
      if (iTipIDRec === undefined || iTipIDRec === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo iTipIDRec es requerido si iNatRec es 2 (No contribuyente) y iTiOpe no es 4 (B2F).",
          path: ["iTipIDRec"],
        });
      }
    } else if (iNatRec === 1 || iTiOpe === 4) {
      if (iTipIDRec !== undefined && iTipIDRec !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo iTipIDRec no es requerido si iNatRec es 1 (Contribuyente) o iTiOpe es 4 (B2F).",
          path: ["iTipIDRec"],
        });
      }
    }

    if (iNatRec === 2 && iTiOpe !== 4) {
      if (dNumIDRec === undefined || dNumIDRec === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dNumIDRec es requerido si iNatRec es 2 (No contribuyente) y iTiOpe no es 4 (B2F).",
          path: ["dNumIDRec"],
        });
      }
    } else if (iNatRec === 1 || iTiOpe === 4) {
      if (dNumIDRec !== undefined && dNumIDRec !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dNumIDRec no es requerido si iNatRec es 1 (Contribuyente) o iTiOpe es 4 (B2F).",
          path: ["dNumIDRec"],
        });
      }
    }

    // TODO: check if we will remove this definitely

    // if (iTipIDRec !== undefined && iTipIDRec !== null) {
    //   if (dDTipIDRec === undefined || dDTipIDRec === null) {
    //     ctx.addIssue({
    //       code: z.ZodIssueCode.custom,
    //       message:
    //         "El campo dDTipIDRec es requerido si existe el campo iTipIDRec.",
    //       path: ["dDTipIDRec"],
    //     });
    //   }
    // }

    if (iTiDE === 7 || iTiOpe === 4) {
      if (dDirRec === undefined || dDirRec === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dDirRec es requerido cuando iTiDE es 7 o iTiOpe es 4.",
          path: ["dDirRec"],
        });
      }
    }

    if (dDirRec !== undefined && dDirRec !== null) {
      if (dNumCasRec === undefined || dNumCasRec === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dNumCasRec es requerido si existe el campo dDirRec.",
          path: ["dNumCasRec"],
        });
      }
    }

    if (dDirRec !== undefined && dDirRec !== null && iTiOpe !== 4) {
      if (cDepRec === undefined || cDepRec === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo cDepRec es requerido si existe el campo dDirRec y iTiOpe no es 4.",
          path: ["cDepRec"],
        });
      }
    }

    if (dDirRec !== undefined && dDirRec !== null && iTiOpe !== 4) {
      if (cCiuRec === undefined || cCiuRec === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo cCiuRec es requerido si existe el campo dDirRec y iTiOpe no es 4.",
          path: ["cCiuRec"],
        });
      }
    } else if (iTiOpe === 4 && (cCiuRec !== undefined || cCiuRec !== null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El campo cCiuRec no es requerido si iTiOpe es 4 (B2F).",
        path: ["cCiuRec"],
      });
    }

    if (!paisesList.find((pais) => pais.id === cPaisRec)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El campo cPaisRec no corresponde a un país válido.",
        path: ["cPaisRec"],
      });
    }

    if (
      cDisRec !== undefined &&
      !distritosList.find((distrito) => distrito.id === cDisRec)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El campo cDisRec no corresponde a un distrito válido.",
        path: ["cDisRec"],
      });
    }

    if (
      cCiuRec !== undefined &&
      !ciudadesList.find((ciudad) => ciudad.id === cCiuRec)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El campo cCiuRec no corresponde a una ciudad válida.",
        path: ["cCiuRec"],
      });
    }

    if (iTiDE === 1 && (iIndPres === undefined || iIndPres === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo iIndPres es requerido cuando iTiDE es 1 (Factura electrónica).",
        path: ["iIndPres"],
      });
    }

    if (
      (iTiDE === 5 || iTiDE === 6) &&
      (iMotEmi === undefined || iMotEmi === null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo iMotEmi es requerido cuando iTiDE es 5 (Nota de crédito electrónica) o 6 (Nota de débito electrónica).",
        path: ["iMotEmi"],
      });
    }

    if (iTiDE === 7 && (iMotEmiNR === undefined || iMotEmiNR === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo iMotEmiNR es requerido cuando iTiDE es 7 (Nota de remisión electrónica).",
        path: ["iMotEmiNR"],
      });
    }

    if (
      (iTiDE === 1 || iTiDE === 4) &&
      (iCondOpe === undefined || iCondOpe === null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo iCondOpe es requerido cuando iTiDE es 1 (Factura electrónica) o 4 (Autofactura electrónica).",
        path: ["iCondOpe"],
      });
    }

    if (iCondOpe === 1 && (iTiPago === undefined || iTiPago === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo iTiPago es requerido cuando iCondOpe es 1 (Contado).",
        path: ["iTiPago"],
      });
    }

    if (iCondOpe === 1 && (dMonTiPag === undefined || dMonTiPag === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo dMonTiPag es requerido cuando iCondOpe es 1 (Contado).",
        path: ["dMonTiPag"],
      });
    }

    if (iCondOpe === 1 && dMonEnt) {
      if (cMoneTiPag) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo cMoneTiPag es requerido cuando iCondOpe es 1 y existe dMonEnt.",
          path: ["cMoneTiPag"],
        });
      } else if (
        !dDesMoneOpeList.find((moneda) => moneda.id === data.cMoneTiPag)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo cMoneTiPag debe contener un código de moneda válido.",
          path: ["cMoneTiPag"],
        });
      }
    }

    if (iTiPago === 2 && (dNumCheq === undefined || dNumCheq === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El campo dNumCheq es requerido cuando iTiPago es 2 (Cheque).",
        path: ["dNumCheq"],
      });
    }

    if (iTiPago === 2 && (dBcoEmi === undefined || dBcoEmi === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El campo dBcoEmi es requerido cuando iTiPago es 2 (Cheque).",
        path: ["dBcoEmi"],
      });
    }

    if (iCondOpe === 2 && (iCondCred === undefined || iCondCred === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo iCondCred es requerido cuando iCondOpe es 2 (Crédito).",
        path: ["iCondCred"],
      });
    }

    if (iCondCred === 1) {
      if (dPlazoCre === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dPlazoCre es requerido cuando iCondCred es 1 (Plazo).",
          path: ["dPlazoCre"],
        });
      }
    }

    if (iCondCred === 2) {
      if (dCuotas === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dCuotas es requerido cuando iCondCred es 2 (Cuota).",
          path: ["dCuotas"],
        });
      }
    }

    const validCurrency = dDesMoneOpeList.find(
      (currency) => currency.id === cMoneCuo
    );
    if (iCondCred === 2) {
      if (cMoneCuo === undefined || validCurrency === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo cMoneCuo es requerido cuando iCondCred es 2 (Cuota) y debe ser una moneda válida.",
          path: ["cMoneCuo"],
        });
      }
    }

    if (iCondCred === 2 && dMonCuota === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo dMonCuota es requerido cuando iCondCred es 2 (Cuota).",
        path: ["dMonCuota"],
      });
    }

    if (iCondCred === 2 && !dVencCuo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo dVencCuo es requerido cuando iCondCred es 2 (Cuota).",
        path: ["dVencCuo"],
      });
    }

    if (
      !itemsDet.every((item) =>
        dDesUniMedList.find((unidad) => unidad.id === item.cUniMed)
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo cUniMed debe corresponder a una unidad de medida válida.",
        path: ["cUniMed"],
      });
    }

    itemsDet.map((item, index) => {
      if (
        iTiDE !== 7 &&
        (item.dPUniProSer === undefined || item.dPUniProSer === null)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dPUniProSer es requerido si iTiDE es distinto a 7 (Nota de remisión electrónica).",
          path: ["itemsDet", index, "dPUniProSer"],
        });
      }
    });

    if (iTiDE === 7 && (!dInfoFisc || dInfoFisc.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo dInfoFisc es requerido si iTiDE es 7 (Nota de remisión electrónica).",
        path: ["dInfoFisc"],
      });
    }

    if (iTiDE !== 7 && (iTImp === undefined || iTImp === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo iTImp es requerido si iTiDE no es 7 (Nota de remisión electrónica).",
        path: ["iTImp"],
      });
    }

    if ((data.iTiPago === 3 || data.iTiPago === 4) && data.iDenTarj == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo iDenTarj es requerido cuando iTiPago es 3 (Tarjeta de crédito) o 4 (Tarjeta de débito).",
        path: ["iDenTarj"],
      });
    }

    itemsDet.map((item, index) => {
      if (
        iTiDE !== 7 &&
        dCondTiCam === 2 &&
        (item.dTiCamIt === undefined || item.dTiCamIt === null)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dTiCamIt es requerido si iTiDE es distinto a 7 y dCondTiCam es 2 (Tipo de cambio distinto por ítem).",
          path: ["itemsDet", index, "dTiCamIt"],
        });
      }
    });

    itemsDet.map((item, index) => {
      const { dTotBruOpeItem, dPUniProSer, dCantProSer } = item;

      if (iTiDE !== 7) {
        if (dTotBruOpeItem === undefined || dTotBruOpeItem === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "El campo dTotBruOpeItem es requerido si iTiDE es distinto a 7.",
            path: ["itemsDet", index, "dTotBruOpeItem"],
          });
        } else {
          const resultadoEsperado = Math.round((dPUniProSer! * dCantProSer!*100)) / 100;
          // const resultadoEsperadoFixed = parseFloat(
          //   resultadoEsperado.toFixed(8)
          // );
          // const dTotBruOpeItemFixed = parseFloat(dTotBruOpeItem.toFixed(8));

          if (dTotBruOpeItem !== resultadoEsperado) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                `El campo dTotBruOpeItem 
                debe coincidir con la multiplicación de dPUniProSer y 
                dCantProSer. dTotBruOpeItem: ${dTotBruOpeItem}, resultado 
                esperado: ${resultadoEsperado}`,
              path: ["itemsDet", index, "dTotBruOpeItem"],
            });
          }
        }
      }
    });

    itemsDet.map((item, index) => {
      const { dDescItem, dPUniProSer, dPorcDesIt } = item;

      if (dDescItem && dDescItem > 0) {
        if (
          dPorcDesIt === undefined ||
          dPUniProSer === undefined ||
          dPUniProSer <= 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "El campo dPorcDesIt es requerido si dDescItem es mayor a 0.",
            path: ["itemsDet", index, "dPorcDesIt"],
          });
        } else {
          const calculatedPorcDesIt = parseFloat(
            ((dDescItem * 100) / dPUniProSer).toFixed(8)
          );
          if (dPorcDesIt !== calculatedPorcDesIt) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `El campo dPorcDesIt debe ser igual a (dDescItem * 100 / dPUniProSer). Valor esperado: ${calculatedPorcDesIt}.`,
              path: ["itemsDet", index, "dPorcDesIt"],
            });
          }
        }
      }
    });

    if (iTiDE === 7 && (iTipTrans === undefined || iTipTrans === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo iTipTrans es requerido si iTiDE es 7 (Nota de remisión electrónica).",
        path: ["iTipTrans"],
      });
    }

    if (iTiDE === 7 && (iModTrans === undefined || iModTrans === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo iModTrans es requerido si iTiDE es 7 (Nota de remisión electrónica).",
        path: ["iModTrans"],
      });
    }

    if (iTiDE === 7 && (iRespFlete === undefined || iRespFlete === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo iRespFlete es requerido si iTiDE es 7 (Nota de remisión electrónica).",
        path: ["iRespFlete"],
      });
    }

    if (iTiDE === 7 && (dIniTras === undefined || dIniTras === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo dIniTras es requerido si iTiDE es 7 (Nota de remisión electrónica).",
        path: ["dIniTras"],
      });
    }

    if (iCondCred === 1 && (dPlazoCre === undefined || dPlazoCre === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El campo dPlazoCre es requerido si iCondCred es 1 (Plazo).",
        path: ["dPlazoCre"],
      });
    }

    if (iTiDE === 7 && (dDirLocSal === undefined || dDirLocSal === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo dDirLocSal es requerido si iTiDE es 7 (Nota de remisión electrónica).",
        path: ["dDirLocSal"],
      });
    }

    if (
      iTiDE === 7 &&
      (!cDepSal || !departamentosList.find((dep) => dep.id === cDepSal))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo cDepSal es requerido y debe ser un departamento válido si iTiDE es 7.",
        path: ["cDepSal"],
      });
    }

    if (
      iTiDE === 7 &&
      (!cDisSal || !distritosList.find((dist) => dist.id === cDisSal))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo cDisSal es requerido y debe ser un distrito válido si iTiDE es 7.",
        path: ["cDisSal"],
      });
    }

    if (
      iTiDE === 7 &&
      (!cCiuSal || !ciudadesList.find((ciudad) => ciudad.id === cCiuSal))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo cCiuSal es requerido y debe ser una ciudad válida si iTiDE es 7.",
        path: ["cCiuSal"],
      });
    }

    if (iTiDE === 7 && (!dDirLocEnt || dDirLocEnt === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El campo dDirLocEnt es requerido si iTiDE es 7.",
        path: ["dDirLocEnt"],
      });
    }

    if (iTiDE === 7 && (dNumCasEnt === undefined || dNumCasEnt === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El campo dNumCasEnt es requerido cuando iTiDE es 7.",
        path: ["dNumCasEnt"],
      });
    }

    const isValidDepEnt = departamentosList.find((dep) => dep.id === cDepEnt);

    if (iTiDE === 7 && (!cDepEnt || !isValidDepEnt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo cDepEnt es requerido cuando iTiDE es 7 y debe ser un departamento válido.",
        path: ["cDepEnt"],
      });
    }

    const isValidDisEnt = distritosList.find((dist) => dist.id === cDisEnt);
    if (iTiDE === 7 && (!cDisEnt || !isValidDisEnt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo cDisEnt es requerido cuando iTiDE es 7 y debe ser un distrito válido.",
        path: ["cDisEnt"],
      });
    }

    const isValidCiuEnt = ciudadesList.find((ciudad) => ciudad.id === cCiuEnt);
    if (iTiDE === 7 && (!cCiuEnt || !isValidCiuEnt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo cCiuEnt es requerido cuando iTiDE es 7 y debe ser una ciudad válida.",
        path: ["cCiuEnt"],
      });
    }

    if (
      data.iTiDE !== 7 &&
      (data.iTImp === 1 ||
        data.iTImp === 3 ||
        data.iTImp === 4 ||
        data.iTImp === 5)
    ) {
      const sumatoriaTotOpe =
        ((data.dSub10 || 0)*100 +
        (data.dSub5 || 0)*100 +
        (data.dSubExe || 0)*100 +
        (data.dSubExo || 0)*100)/100 ;
      if (data.dTotOpe !== sumatoriaTotOpe) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El campo dTotOpe debe ser igual a la suma de los subtotales (dSub10, dSub5, dSubExe, dSubExo). Valor esperado: ${sumatoriaTotOpe}.`,
          path: ["dTotOpe"],
        });
      }
    }

    const validTImp =
      data.iTImp === 1 ||
      data.iTImp === 3 ||
      data.iTImp === 4 ||
      data.iTImp === 5;

    if (validTImp && data.iTiDE !== 4 && data.iTiDE !== 7) {
      itemsDet.map((item, index) => {
        if (item.dPropIVA == null || item.dPropIVA === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El campo dPropIVA es requerido cuando iTImp es 1, 3, 4 o 5 y iTiDE no es 4 ni 7.`,
            path: ["itemsDet", index, "dPropIVA"],
          });
        }

        if (item.iAfecIVA == null || item.iAfecIVA === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El campo iAfecIVA es requerido cuando iTImp es 1, 3, 4 o 5 y iTiDE no es 4 ni 7.`,
            path: ["itemsDet", index, "iAfecIVA"],
          });
        }

        if (item.dTasaIVA == null || item.dTasaIVA === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El campo dTasaIVA es requerido cuando iTImp es 1, 3, 4 o 5 y iTiDE no es 4 ni 7.`,
            path: ["itemsDet", index, "dTasaIVA"],
          });
        }

        if (item.dBasGravIVA == null || item.dBasGravIVA === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El campo dBasGravIVA es requerido cuando iTImp es 1, 3, 4 o 5 y iTiDE no es 4 ni 7.`,
            path: ["itemsDet", index, "dBasGravIVA"],
          });
        }

        if (item.dLiqIVAItem == null || item.dLiqIVAItem === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El campo dLiqIVAItem es requerido cuando iTImp es 1, 3, 4 o 5 y iTiDE no es 4 ni 7.`,
            path: ["itemsDet", index, "dLiqIVAItem"],
          });
        }
      });
    }

    if (data.iTiDE !== 7) {
      const totalExento = data.itemsDet
        .filter((item) => item.iAfecIVA === 3)
        .reduce((sum, item) => sum + (item.dTotOpeItem || 0), 0);

      if (totalExento > 0 && data.dSubExe === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dSubExe es requerido cuando iTiDE no es 7 y existen operaciones exentas.",
          path: ["dSubExe"],
        });
      }

      const totalExonerado = data.itemsDet
        .filter((item) => item.iAfecIVA === 2)
        .reduce((sum, item) => sum + (item.dTotOpeItem || 0), 0);

      if (totalExonerado > 0 && data.dSubExo === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dSubExo es requerido cuando iTiDE no es 7 y existen operaciones exoneradas.",
          path: ["dSubExo"],
        });
      }

      const totalIVA5 = data.itemsDet
        .filter(
          (item) =>
            item.dTasaIVA === 5 && (item.iAfecIVA === 1 || item.iAfecIVA === 4)
        )
        .reduce((sum, item) => sum + (item.dTotOpeItem || 0), 0);

      if (totalIVA5 > 0) {
        if (data.dSub5 === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "El campo dSub5 es requerido cuando iTiDE no es 7 y existen operaciones gravadas a la tasa del 5%.",
            path: ["dSub5"],
          });
        } else if (data.dSub5 !== totalIVA5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El valor de dSub5 debe ser igual a la suma de dTotOpeItem de los ítems con dTasaIVA = 5. Valor esperado: ${totalIVA5}.`,
            path: ["dSub5"],
          });
        }
      }

      if (data.iTImp !== 1 && data.dSub5 !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El campo dSub5 no debe existir si iTImp no es 1.",
          path: ["dSub5"],
        });
      }

      const totalSub10 = data.itemsDet.reduce((sum, item) => {
        if (
          (item.iAfecIVA === 1 || item.iAfecIVA === 4) &&
          item.dTasaIVA === 10
        ) {
          return sum + (item.dTotOpeItem || 0);
        }
        return sum;
      }, 0);

      if (totalSub10 > 0 && data.dSub10 === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dSub10 es requerido cuando iTiDE no es 7 y existen operaciones a la tasa del 10%.",
          path: ["dSub10"],
        });
      }

      if (data.iTImp !== 1 && data.dSub10 !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El campo dSub10 no debe existir si iTImp no es 1.",
          path: ["dSub10"],
        });
      }

      const totalDescuentos = data.itemsDet.reduce(
        (sum, item) => sum + (item.dDescItem || 0) * item.dCantProSer,
        0
      );

      if (data.dTotDesc !== totalDescuentos) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El valor de dTotDesc (${
            data.dTotDesc
          }) no coincide con la suma de los descuentos por ítem (${totalDescuentos.toFixed(
            8
          )}).`,
          path: ["dTotDesc"],
        });
      }

      const totalDescGloItem = data.itemsDet.reduce(
        (sum, item) => sum + (item.dDescGloItem || 0),
        0
      );

      if (data.dTotDescGlotem !== totalDescGloItem) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El campo dTotDescGlotem debe ser igual a la sumatoria de todos los valores de dDescGloItem. Valor esperado: ${totalDescGloItem}`,
          path: ["dTotDescGlotem"],
        });
      }

      const totalAnticipos = data.itemsDet.reduce(
        (sum, item) => sum + (item.dAntPreUniIt || 0),
        0
      );
      if (data.dTotAntItem !== totalAnticipos) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El campo dTotAntItem debe ser igual a la suma de dAntPreUniIt (${totalAnticipos}).`,
          path: ["dTotAntItem"],
        });
      }

      const totalAnticiposGlobal = data.itemsDet.reduce((sum, item) => {
        return sum + (item.dAntGloPreUniIt || 0);
      }, 0);

      if (data.dTotAnt !== totalAnticiposGlobal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El campo dTotAnt (${data.dTotAnt}) no coincide con la suma de dAntGloPreUniIt (${totalAnticiposGlobal}) en itemsDet.`,
          path: ["dTotAnt"],
        });
      }

      if (dPorcDescTotal === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El campo dPorcDescTotal es requerido cuando iTiDE no es 7.",
          path: ["dPorcDescTotal"],
        });
      }

      const sumatoriaDescTotal = data.itemsDet.reduce((total, item) => {
        const { dCantProSer, dDescItem = 0, dDescGloItem = 0 } = item;
        return total + (dDescItem + dDescGloItem) * dCantProSer;
      }, 0);

      if (data.dDescTotal !== sumatoriaDescTotal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El valor de dDescTotal (${data.dDescTotal}) no coincide con la sumatoria de descuentos calculada (${sumatoriaDescTotal}).`,
          path: ["dDescTotal"],
        });
      }

      const totalAnticiposGlobalParticular = data.itemsDet.reduce(
        (sum, item) => {
          const anticipoGlobal = item.dAntGloPreUniIt || 0;
          const anticipoParticular = item.dAntPreUniIt || 0;
          return sum + anticipoGlobal + anticipoParticular;
        },
        0
      );

      if (data.dAnticipo !== totalAnticiposGlobalParticular) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El campo dAnticipo debe ser igual a la sumatoria de los anticipos globales y particulares. Valor esperado: ${totalAnticiposGlobalParticular}`,
          path: ["dAnticipo"],
        });
      }

      if (dRedon === undefined || dRedon === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El campo dRedon es requerido cuando iTiDE no es 7.",
          path: ["dRedon"],
        });
      }

      if (dTotGralOpe === undefined || dTotGralOpe === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El campo dTotGralOpe es requerido cuando iTiDE no es 7.",
          path: ["dTotGralOpe"],
        });
      }
    }

    if (iTipDocAso === 1) {
      if (!dCdCDERef) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dCdCDERef es requerido si iTipDocAso es 1 (Electrónico)",
          path: ["dCdCDERef"],
        });
      }
    }

    if (iTipDocAso === 2) {
      if (!dNTimDI) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El campo dNTimDI es requerido si iTipDocAso es 2 (Impreso)",
          path: ["dNTimDI"],
        });
      }

      if (!dEstDocAso) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dEstDocAso es requerido si iTipDocAso es 2 (Impreso)",
          path: ["dEstDocAso"],
        });
      }

      if (!dPExpDocAso) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dPExpDocAso es requerido si iTipDocAso es 2 (Impreso)",
          path: ["dPExpDocAso"],
        });
      }

      if (!dNumDocAso) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dNumDocAso es requerido si iTipDocAso es 2 (Impreso)",
          path: ["dNumDocAso"],
        });
      }
    }

    if (dNTimDI && !dFecEmiDI) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El campo dFecEmiDI es requerido si existe dNTimDI.",
        path: ["dFecEmiDI"],
      });
    }

    if (iTipTra === 12 && !dNumResCF) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El campo dNumResCF es requerido si iTipTra es 12.",
        path: ["dNumResCF"],
      });
    }

    if (iTipDocAso === 3 && (iTipCons === undefined || iTipCons === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El campo iTipCons es requerido si iTipDocAso es 3.",
        path: ["iTipCons"],
      });
    }

    if (data.iTiDE === 7 && data.dTipIdenVeh === 2 && !data.dNroMatVeh) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "El campo dNroMatVeh es requerido si iTiDE es 7 y dTipIdenVeh es 2 (Número de matrícula del vehículo)",
        path: ["dNroMatVeh"],
      });
    }

    if (iTipDocAso === 3 && iTipCons === 2) {
      if (dNumCons === undefined || dNumCons === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dNumCons es requerido si iTipDocAso es 3 y iTipCons es 2.",
          path: ["dNumCons"],
        });
      }

      if (dNumControl === undefined || dNumControl === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dNumControl es requerido si iTipDocAso es 3 y iTipCons es 2.",
          path: ["dNumControl"],
        });
      }
    }

    if (iTiDE === 7) {
      if (iNatTrans === undefined || iNatTrans === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo iNatTrans es requerido si iTiDE es 7 (Nota de remisión electrónica).",
          path: ["iNatTrans"],
        });
      }

      if (dNomTrans === undefined || dNomTrans === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dNomTrans es requerido si iTiDE es 7 (Nota de remisión electrónica).",
          path: ["dNomTrans"],
        });
      }

      if (dNumIDChof === undefined || dNumIDChof === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dNumIDChof es requerido si iTiDE es 7 (Nota de remisión electrónica).",
          path: ["dNumIDChof"],
        });
      }

      if (dNomChof === undefined || dNomChof === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El campo dNomChof es requerido si iTiDE es 7 (Nota de remisión electrónica).",
          path: ["dNomChof"],
        });
      }
    }

    if (
      iTImp !== undefined &&
      (iTImp === 1 || iTImp === 3 || iTImp === 4 || iTImp === 5)
    ) {
      data.itemsDet.map((item, index) => {
        const {
          dPUniProSer,
          dDescItem,
          dDescGloItem,
          dAntPreUniIt,
          dAntGloPreUniIt,
          dCantProSer,
          dTotOpeItem,
        } = item;

        const calculatedTotOpeItem =
          ((dPUniProSer || 0) -
            (dDescItem || 0) -
            (dDescGloItem || 0) -
            (dAntPreUniIt || 0) -
            (dAntGloPreUniIt || 0)) *
          dCantProSer;

        if (dTotOpeItem !== Math.round(calculatedTotOpeItem *100)/100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El valor de dTotOpeItem no es correcto. Debe ser el resultado de (dPUniProSer - dDescItem - dDescGloItem - dAntPreUniIt - dAntGloPreUniIt) * dCantProSer. Valor esperado: ${calculatedTotOpeItem}. Valor obtenido: ${dTotOpeItem}`,
            path: ["itemsDet", index, "dTotOpeItem"],
          });
        }
      });
    }

    if (iTiDE === 7 && !dTiVehTras) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El campo dTiVehTras es requerido si iTiDE es 7",
        path: ["dTiVehTras"],
      });
    }

    if (iTiDE === 7 && !dMarVeh) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El campo dMarVeh es requerido si iTiDE es 7",
        path: ["dMarVeh"],
      });
    }

    if (iTiDE === 7 && !dTipIdenVeh) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El campo dTipIdenVeh es requerido si iTiDE es 7",
        path: ["dTipIdenVeh"],
      });
    }
  });
