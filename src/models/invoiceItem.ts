import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database';

export class InvoiceItem extends Model {
  declare id: string;
  declare invoiceId: string;
  declare articleName: string;
  declare quantity: number;
  declare quantityIntToBeDeleted: number;
  declare unitPrice: number;
  declare iva: number;
  declare subTotal: number;
  declare exentaSubTotal: number;
  declare gravada5SubTotal: number;
  declare gravada10SubTotal: number;
  declare iva5SubTotal: number;
  declare iva10SubTotal: number;
  declare redondeoSubTotal: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

InvoiceItem.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  invoiceId: DataTypes.STRING,
  articleName: DataTypes.STRING,
  quantity: DataTypes.DECIMAL,
  quantityIntToBeDeleted: DataTypes.INTEGER,
  unitPrice: DataTypes.DECIMAL,
  iva: DataTypes.INTEGER,
  subTotal: DataTypes.DECIMAL,
  exentaSubTotal: DataTypes.DECIMAL,
  gravada5SubTotal: DataTypes.DECIMAL,
  gravada10SubTotal: DataTypes.DECIMAL,
  iva5SubTotal: DataTypes.DECIMAL,
  iva10SubTotal: DataTypes.DECIMAL,
  redondeoSubTotal: DataTypes.DECIMAL,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
}, {
  sequelize,
  modelName: 'invoiceItem',
  freezeTableName: true,
  timestamps: false
});