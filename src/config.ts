import dotenv from "dotenv";

dotenv.config();
// extract from .env from here:
export const DATABASE_URL = process.env.DATABASE_URL || "";
export const NODE_ENV = process.env.NODE_ENV || "DEVELOPMENT";