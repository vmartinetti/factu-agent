import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database";

export class CreditNoteItem extends Model {
  declare id: string;
  declare creditNoteId: string;
  declare articleName: string;
  declare quantity: number;
  declare unitPrice: number;
  declare iva: number;
  declare subTotal: number | null;
  declare exentaSubTotal: number | null;
  declare gravada5SubTotal: number | null;
  declare gravada10SubTotal: number | null;
  declare iva5SubTotal: number | null;
  declare iva10SubTotal: number | null;
  declare redondeoSubTotal: number | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

CreditNoteItem.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  creditNoteId: DataTypes.STRING,
  articleName: DataTypes.STRING,
  quantity: DataTypes.DECIMAL,
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
  updatedAt: DataTypes.DATE,
}, {
  sequelize,
  modelName: "creditNoteItem",
  freezeTableName: true,
  timestamps: false,
});