import { Sequelize } from "sequelize";
import { DATABASE_URL } from "./config";

let sequelize: Sequelize;

if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(DATABASE_URL, {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize(DATABASE_URL);
}

export { sequelize };
