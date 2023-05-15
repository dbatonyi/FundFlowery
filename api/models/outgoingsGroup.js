"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OutgoingsGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ FinancialTable, Outgoings }) {
      // Define association here
      this.belongsTo(FinancialTable, { foreignKey: "outgoingsGroupId" });
      this.hasMany(Outgoings, {
        as: "outgoings",
        foreignKey: "outgoingKey",
      });
    }
  }

  OutgoingsGroup.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      outgoingsGroupTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      outgoingsGroupDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "outgoingsGroups",
      modelName: "OutgoingsGroup",
    }
  );
  return OutgoingsGroup;
};
