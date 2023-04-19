"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserFinancialTableInvitation extends Model {
    static associate({ User, FinancialTable }) {
      // Define association here
      this.belongsTo(User, { foreignKey: "userId" });
      this.belongsTo(User, { foreignKey: "invitedBy", as: "inviter" });
      this.belongsTo(FinancialTable, { foreignKey: "financialTableId" });
    }
  }

  UserFinancialTableInvitation.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      invitationStatus: {
        type: DataTypes.ENUM("pending", "accepted", "declined"),
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      tableName: "userFinancialTableInvitation",
      modelName: "UserFinancialTableInvitation",
    }
  );
  return UserFinancialTableInvitation;
};
