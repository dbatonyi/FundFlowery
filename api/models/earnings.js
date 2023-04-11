"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Earnings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ FinancialTable }) {
      // define association here
      this.belongsTo(FinancialTable);
    }
  }

  Earnings.init(
    {
      earningID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      earningDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      earningAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      earningCategory: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "earnings",
      modelName: "Earnings",
    }
  );
  return Earnings;
};
