import { Sequelize } from "sequelize";
import { DATABASE_URL } from "./config";

// TODO: uncomment this line to enable SSL depending on the environment
// export const sequelize = new Sequelize(DATABASE_URL, { ssl: true, dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } });
export const sequelize = new Sequelize(DATABASE_URL);
