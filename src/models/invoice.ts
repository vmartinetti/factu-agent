import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database';

export class Invoice extends Model {
  declare id: string;
  declare companyId: string;
  declare userId: string;
  declare dateIssued: string;
  declare salespointId: string;
  declare salespointSucursal: number;
  declare salespointPunto: number;
  declare number: number;
  declare timbrado: number;
  declare salespointValidSince: string;
  declare salespointValidUntil: string;
  declare customerDocId: string;
  declare customerName: string;
  declare customerAddress: string;
  declare condition: string;
  declare dueDate: string;
  declare total: number;
  declare exentaTotal: number;
  declare gravada5Total: number;
  declare gravada10Total: number;
  declare iva5Total: number;
  declare iva10Total: number;
  declare annulled: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare securityCode: string;
  declare dateTimeIssued: string;
  declare currencyCode: string;
  declare sifenStatus: string;
  declare xml: string;
  declare CDC: string;
  declare zipId: number;
}

Invoice.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  companyId: DataTypes.STRING,
  userId: DataTypes.STRING,
  dateIssued: DataTypes.STRING,
  salespointId: DataTypes.STRING,
  salespointSucursal: DataTypes.INTEGER,
  salespointPunto: DataTypes.INTEGER,
  number: DataTypes.INTEGER,
  timbrado: DataTypes.INTEGER,
  salespointValidSince: DataTypes.STRING,
  salespointValidUntil: DataTypes.STRING,
  customerDocId: DataTypes.STRING,
  customerName: DataTypes.STRING,
  customerAddress: DataTypes.STRING,
  condition: DataTypes.STRING,
  dueDate: DataTypes.STRING,
  total: DataTypes.DECIMAL,
  exentaTotal: DataTypes.DECIMAL,
  gravada5Total: DataTypes.DECIMAL,
  gravada10Total: DataTypes.DECIMAL,
  iva5Total: DataTypes.DECIMAL,
  iva10Total: DataTypes.DECIMAL,
  annulled: DataTypes.BOOLEAN,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
  securityCode: DataTypes.STRING,
  dateTimeIssued: DataTypes.STRING,
  currencyCode: DataTypes.STRING,
  sifenStatus: DataTypes.STRING,
  xml: DataTypes.STRING,
  CDC: DataTypes.STRING,
  zipId: DataTypes.NUMBER
}, {
  sequelize,
  tableName: 'invoice',
  freezeTableName: true,
  timestamps: false
});