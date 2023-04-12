"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Outgoings extends Model {
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

  Outgoings.init(
    {
      outgoingID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      outgoingDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      outgoingCategory: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      outgoingOrigin: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "outgoings",
      modelName: "Outgoings",
    }
  );
  return Outgoings;
};
