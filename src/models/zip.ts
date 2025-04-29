import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database';

export class Zip extends Model {
  declare id: number;
  declare status: string;
  declare emisorRuc: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare consultaXML: string;
  declare envioXML: string;
  declare loteNro: string;
  declare documentType: number;
}

Zip.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: DataTypes.STRING,
  emisorRuc: DataTypes.STRING,
  consultaXML: DataTypes.STRING,
  envioXML: DataTypes.STRING,
  loteNro: DataTypes.STRING,
  documentType: DataTypes.INTEGER,
}, {
  sequelize,
  modelName: 'zip',
  freezeTableName: true,
  timestamps: true,
});
