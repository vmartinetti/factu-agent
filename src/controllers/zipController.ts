import { Zip } from "../models/zip";

export async function createEmptyZip(emisorRuc: string, documentType: number) {
  try {
    const zip = await Zip.create({
      base64: null,
      status: "PENDIENTE",
      emisorRuc: emisorRuc,
      documentType
    });
    return zip;
  } catch (error) {
    console.log("Error creating empty zip", error);
    return null;
  }
  
}

export async function getFirstPendingZip() {
  try {
    const zip = await Zip.findOne({
      where: { status: "PENDIENTE" },
      logging: false,
    });
    return zip;
  } catch (error) {
    console.error("Error getting first pending zip", error);
    return null;
  }
}

export async function getFirstSentZip() {
  try {
    const zip = await Zip.findOne({
      where: { status: "ENVIADO" },
      order: [["createdAt", "ASC"]],
      logging: false,
    });
    return zip;
  } catch (error) {
    console.error("Error getting first pending zip", error);
    return null;
  }
}