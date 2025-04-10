import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database';

export class Cancelation extends Model {
  declare id: number;
  declare CDC: string;
  declare sifenStatus : string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Cancelation.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  CDC: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sifenStatus: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  sequelize,
  tableName: 'cancelation',
  freezeTableName: true,
  timestamps: true,
});