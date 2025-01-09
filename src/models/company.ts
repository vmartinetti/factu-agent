import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database';

export class Company extends Model {
  declare id: string;
  declare ruc: string;
  declare razonSocial: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare nombreFantasia: string;
  declare adminPhoneNumber: string;
  declare addressLine1: string;
  declare addressLine2: string;
  declare logoImage: string;
  declare phoneNumber: string;
  declare activity: string;
  declare testMode: boolean;
  declare facturaElectronica: boolean;
  declare inputCantidad: boolean;
  declare cantidadDecimal: boolean;
  declare itemAclaracion: boolean;
  declare type: number;
  declare stateCode: number;
  declare stateName: string;
  declare cityCode: number;
  declare cityName: string;
  declare districtCode: number;
  declare districtName: string;
  declare email: string;
  declare feResponsibleDocId: string;
  declare feResponsibleName: string;
}

Company.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  ruc: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  razonSocial: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
  nombreFantasia: DataTypes.STRING,
  adminPhoneNumber: DataTypes.STRING,
  addressLine1: DataTypes.STRING,
  addressLine2: DataTypes.STRING,
  logoImage: DataTypes.STRING,
  phoneNumber: DataTypes.STRING,
  activity: DataTypes.STRING,
  testMode: DataTypes.BOOLEAN,
  facturaElectronica: DataTypes.BOOLEAN,
  inputCantidad: DataTypes.BOOLEAN,
  cantidadDecimal: DataTypes.BOOLEAN,
  itemAclaracion: DataTypes.BOOLEAN,
  type: DataTypes.INTEGER,
  stateCode: DataTypes.INTEGER,
  stateName: DataTypes.STRING,
  cityCode: DataTypes.INTEGER,
  cityName: DataTypes.STRING,
  districtCode: DataTypes.INTEGER,
  districtName: DataTypes.STRING,
  email: DataTypes.STRING,
  feResponsibleDocId: DataTypes.STRING,
  feResponsibleName: DataTypes.STRING
}, {
  sequelize,
  modelName: 'company',
  freezeTableName: true,
  timestamps: false
});