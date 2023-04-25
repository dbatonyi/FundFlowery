"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CurrencyExchangeRates extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /* static associate({  }) {
      // define association here
    } */
  }

  CurrencyExchangeRates.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      currencyExchangeBase: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      currencyExchangeTarget: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      currencyExchangeRate: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "currencyExchangeRates",
      modelName: "CurrencyExchangeRates",
    }
  );
  return CurrencyExchangeRates;
};
