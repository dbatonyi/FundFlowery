"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FinancialTable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      User,
      Outgoings,
      Incomes,
      UserFinancialTableInvitation,
    }) {
      // define association here
      this.belongsTo(User, { foreignKey: "userId" });
      this.hasMany(Outgoings, {
        as: "outgoings",
        foreignKey: "financialTableId",
      });
      this.hasMany(Incomes, { as: "incomes", foreignKey: "financialTableId" });
      this.hasMany(UserFinancialTableInvitation, {
        foreignKey: "financialTableId",
      });
    }
  }

  FinancialTable.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tableName: {
        type: DataTypes.STRING,
        allowNull: false,
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