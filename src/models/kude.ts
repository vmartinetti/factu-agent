import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database';

export class Kude extends Model {
  declare CDC: string;
  declare base64: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Kude.init({
  CDC: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  base64: DataTypes.TEXT,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'kude',
  freezeTableName: true,
  timestamps: true,
});