"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LogLevel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Log }) {
      // define association here
      this.hasMany(Log, { foreignKey: "logLevelId" });
    }
  }

  LogLevel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "logLevel",
      modelName: "LogLevel",
    }
  );
  return LogLevel;
};
