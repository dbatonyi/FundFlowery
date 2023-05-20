"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EmailValidation extends Model {
    static associate({ User }) {
      // Define association here
      this.belongsTo(User, { foreignKey: "userId" });
    }
  }

  EmailValidation.init(
    {
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "emailValidations",
      modelName: "EmailValidation",
    }
  );

  return EmailValidation;
};
