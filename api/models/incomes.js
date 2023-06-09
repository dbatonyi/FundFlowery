"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Incomes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ FinancialTable }) {
      // define association here
      this.belongsTo(FinancialTable, { foreignKey: "financialTableId" });
    }
  }

  Incomes.init(
    {
      incomeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      incomeDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      incomeTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      incomeAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      incomeCurrency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      incomeCategory: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      incomeOrigin: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "incomes",
      modelName: "Incomes",
    }
  );
  return Incomes;
};
