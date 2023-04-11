"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FinancialTable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Invoices, Earnings }) {
      // define association here
      this.belongsTo(User, { foreignKey: "financialTableId" });
      this.hasMany(Invoices);
      this.hasMany(Earnings);
    }
  }

  FinancialTable.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
    },
    {
      sequelize,
      tableName: "financialTable",
      modelName: "FinancialTable",
    }
  );
  return FinancialTable;
};
