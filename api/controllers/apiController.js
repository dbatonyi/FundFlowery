const config = require("../config")["api"];

let utils = require("../helpers/utils");

var exports = (module.exports = {});

exports.apiLog = async function (req, res) {
  const { Log } = require("../models");
  const { logMessage, logLevel } = req.body;
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  try {
    const log = await Log.create({
      logMessage: logMessage ? logMessage : "Unknown error",
      logLevel: logLevel ? logLevel : "error",
    });

    return res.status(200).send({
      message: "Log saved!",
    });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.createFinancialTable = async function (req, res) {
  const { FinancialTable } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const { userId, tableName } = req.body;

  try {
    const financialTable = await FinancialTable.create({ userId, tableName });

    return res.status(200).send({
      message: "Financial table successfully created!",
    });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.getFinancialTablesByUser = async function (req, res) {
  const { FinancialTable } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const { userId } = req.body;

  try {
    const financialTables = await FinancialTable.findAll({
      where: { userId },
    });
    return res.status(200).send({
      data: financialTables,
      message: "Financial data retrieved successfully!",
    });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.getFinancialTableDataByUuid = async function (req, res) {
  let Sequelize = require("sequelize");
  const {
    FinancialTable,
    Incomes,
    Outgoings,
    OutgoingsGroup,
  } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const { tableUuid } = req.body;

  try {
    const financialTable = await FinancialTable.findAll({
      where: { uuid: tableUuid },
      include: [
        { model: Incomes, as: "incomes" },
        {
          model: OutgoingsGroup,
          as: "outgoingsGroup",
          include: [
            {
              model: Outgoings,
              as: "outgoings",
              where: {
                outgoingKey: Sequelize.col("outgoingsGroup.uuid"),
              },
            },
          ],
        },
      ],
    });

    return res.status(200).send({
      data: financialTable,
      message: "Financial table data retrieved successfully!",
    });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.deleteFinancialTableByUuid = async function (req, res) {
  const { FinancialTable, Incomes, Outgoings } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const { tableUuid } = req.body;

  try {
    const financialTable = await FinancialTable.findOne({
      where: { uuid: tableUuid },
      include: [
        { model: Incomes, as: "incomes" },
        {
          model: OutgoingsGroup,
          as: "outgoingsGroup",
          include: [{ model: Outgoings, as: "outgoings" }],
        },
      ],
    });

    if (financialTable) {
      await Promise.all([
        Incomes.destroy({ where: { financialTableId: financialTable.uuid } }),
        Outgoings.destroy({
          where: {
            outgoingKey: financialTable.outgoingsGroup
              .map((group) =>
                group.outgoings.map((outgoing) => outgoing.outgoingId)
              )
              .flat(),
          },
        }),
        OutgoingsGroup.destroy({
          where: {
            uuid: financialTable.outgoingsGroup.map((group) => group.uuid),
          },
        }),
      ]);

      await financialTable.destroy();

      return res.status(200).send({
        message:
          "Financial table and its associated data successfully deleted!",
      });
    }

    return res.status(404).send({ message: "No table find in the database!" });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.createIncomeItem = async function (req, res) {
  const { Incomes } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const {
    incomeDate,
    incomeTitle,
    incomeAmount,
    incomeCurrency,
    incomeCategory,
    incomeOrigin,
    description,
    tableUuid,
  } = req.body;

  try {
    const incomeItem = await Incomes.create({
      incomeDate,
      incomeTitle,
      incomeAmount,
      incomeCurrency,
      incomeCategory,
      incomeOrigin,
      description,
      financialTableId: tableUuid,
    });

    return res.status(200).send({
      message: "Income item successfully created!",
    });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.createNewOutgoingGroupItem = async function (req, res) {
  const { OutgoingsGroup } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const { outgoingsGroupTitle, outgoingsGroupDate, outgoingGroupId } = req.body;

  try {
    const outgoingGroup = await OutgoingsGroup.create({
      outgoingsGroupTitle,
      outgoingsGroupDate,
      outgoingGroupId,
    });

    return res.status(200).send({
      message: "Outgoing group successfully created!",
    });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.createOutgoingItem = async function (req, res) {
  const { Outgoings } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const {
    outgoingDate,
    outgoingTitle,
    outgoingAmount,
    outgoingCurrency,
    outgoingCategory,
    outgoingOrigin,
    outgoingLocation,
    outgoingOnSale,
    description,
    outgoingGroupUuid,
  } = req.body;

  try {
    const outgoingItem = await Outgoings.create({
      outgoingDate,
      outgoingTitle,
      outgoingAmount,
      outgoingCurrency,
      outgoingCategory,
      outgoingOrigin,
      outgoingLocation,
      outgoingOnSale,
      description,
      outgoingKey: outgoingGroupUuid,
    });

    return res.status(200).send({
      message: "Outgoing item successfully created!",
    });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.deleteIncomeItem = async function (req, res) {
  const { Incomes } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const { incomeId } = req.body;

  try {
    const incomeItem = await Incomes.findOne({
      where: { incomeId },
    });

    if (incomeItem) {
      await incomeItem.destroy();

      return res.status(200).send({
        message: "Income item successfully deleted!",
      });
    }

    return res.status(404).send({ message: "No table find in the database!" });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.deleteOutgoingItem = async function (req, res) {
  const { Outgoings } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const { outgoingId } = req.body;

  try {
    const outgoingItem = await Outgoings.findOne({
      where: { outgoingId },
    });

    if (outgoingItem) {
      await outgoingItem.destroy();

      return res.status(200).send({
        message: "Outgoing item successfully deleted!",
      });
    }

    return res.status(404).send({ message: "No table find in the database!" });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.editFinancialTableTitle = async function (req, res) {
  const { FinancialTable } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const { uuid, tableName } = req.body;

  try {
    const financialTable = await FinancialTable.update(
      { tableName },
      {
        where: { uuid },
      }
    );

    return res.status(200).send({
      message: "Financial table title successfully edited!",
    });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.editOutgoingCard = async function (req, res) {
  const { Outgoings } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const {
    outgoingId,
    outgoingTitle,
    outgoingDate,
    outgoingAmount,
    outgoingCurrency,
    outgoingCategory,
    outgoingOrigin,
    outgoingLocation,
    outgoingOnSale,
    description,
  } = req.body;

  try {
    const outgoingCard = await Outgoings.update(
      {
        outgoingTitle,
        outgoingDate,
        outgoingAmount,
        outgoingCurrency,
        outgoingCategory,
        outgoingOrigin,
        outgoingLocation,
        outgoingOnSale,
        description,
      },
      {
        where: { outgoingId },
      }
    );

    return res.status(200).send({
      message: "Outgoing card successfully edited!",
    });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.editIncomeCard = async function (req, res) {
  const { Incomes } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const {
    incomeId,
    incomeTitle,
    incomeDate,
    incomeAmount,
    incomeCurrency,
    incomeCategory,
    incomeOrigin,
    description,
  } = req.body;

  try {
    const incomeCard = await Incomes.update(
      {
        incomeTitle,
        incomeDate,
        incomeAmount,
        incomeCurrency,
        incomeCategory,
        incomeOrigin,
        description,
      },
      {
        where: { incomeId },
      }
    );

    return res.status(200).send({
      message: "Income card successfully edited!",
    });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.shareFinancialTable = async function (req, res) {
  const { User, UserFinancialTableInvitation } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const { tableUuid, inviterUserUuid, invitedUserEmail } = req.body;

  async function findUser(email) {
    try {
      const user = await User.findOne({
        where: { email },
        attributes: ["uuid"],
        raw: true,
      });

      if (!user) {
        return res.status(200).send({
          message: "User not found!",
        });
      }

      return user.uuid;
    } catch (error) {
      utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
      return res.status(500).send({ message: "Something went wrong!" });
    }
  }

  async function shareTable(tableUuid, inviterUserUuid, invitedUserUuid) {
    try {
      const existingInvitation = await UserFinancialTableInvitation.findOne({
        where: {
          financialTableId: tableUuid,
          userId: invitedUserUuid,
          invitedBy: inviterUserUuid,
        },
      });

      if (existingInvitation) {
        return res.status(400).send({ message: "Invitation already exists!" });
      }

      const userFinancialTableInvitation =
        await UserFinancialTableInvitation.create({
          financialTableId: tableUuid,
          userId: invitedUserUuid,
          invitedBy: inviterUserUuid,
          invitationStatus: "pending",
        });

      return res.status(200).send({
        message: "Your invitation request has been sent!",
      });
    } catch (error) {
      utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
      return res.status(500).send({ message: "Something went wrong!" });
    }
  }

  const invitedUserUuid = await findUser(invitedUserEmail);
  await shareTable(tableUuid, inviterUserUuid, invitedUserUuid);
};

exports.getInvitesList = async function (req, res) {
  const {
    UserFinancialTableInvitation,
    User,
    FinancialTable,
  } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const getDataByInvitationArray = async (invitationArray) => {
    try {
      const financialTableIds = invitationArray.map(
        (data) => data.financialTableId
      );
      const financialTables = await FinancialTable.findAll({
        where: {
          uuid: financialTableIds,
        },
        attributes: ["uuid", "userId", "tableName"],
        raw: true,
      });

      const userIds = financialTables.map((financialTable) => {
        const user = User.findOne({
          where: {
            uuid: invitationArray.find(
              (item) => item.financialTableId === financialTable.uuid
            ).invitedBy,
          },
          attributes: ["uuid", "firstname", "lastname"],
          raw: true,
        });

        return user.then((user) => {
          return {
            name: user.firstname + " " + user.lastname,
            tableName: financialTable ? financialTable.tableName : null,
            invitationTableUuid: invitationArray.find(
              (item) => item.financialTableId === financialTable.uuid
            ).uuid,
          };
        });
      });

      return Promise.all(userIds);
    } catch (error) {
      utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
      return res.status(500).send({ message: "Something went wrong!" });
    }
  };

  const { userUuid } = req.body;

  try {
    const userFinancialTableInvitations =
      await UserFinancialTableInvitation.findAll({
        where: {
          userId: userUuid,
          invitationStatus: "pending",
        },
        raw: true,
      });

    const inviterData = await getDataByInvitationArray(
      userFinancialTableInvitations
    );

    return res.status(200).send({
      data: [...inviterData],
    });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.acceptInvitation = async function (req, res) {
  const { UserFinancialTableInvitation } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const { invitationUuid } = req.body;

  try {
    const invitationData = await UserFinancialTableInvitation.update(
      {
        invitationStatus: "accepted",
      },
      {
        where: { uuid: invitationUuid },
      }
    );

    return res.status(200).send({
      message: "Invitation accepted!",
    });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.deleteInvitation = async function (req, res) {
  const { UserFinancialTableInvitation } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const { invitationUuid } = req.body;

  try {
    const invitationData = await UserFinancialTableInvitation.findOne({
      where: { uuid: invitationUuid },
    });

    await invitationData.destroy();

    return res.status(200).send({
      message: "Invitation declined!",
    });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.financialTablePermission = async function (req, res) {
  const { FinancialTable, UserFinancialTableInvitation } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const { userUuid, tableUuid } = req.body;

  async function checkOwnership(userUuid, tableUuid) {
    try {
      const financialTable = await FinancialTable.findOne({
        where: { uuid: tableUuid, userId: userUuid },
      });

      if (financialTable) {
        return res.status(200).send({
          data: { permission: true, permissionLevel: "Owner" },
        });
      }

      const invitationFinancialTable =
        await UserFinancialTableInvitation.findOne({
          where: {
            invitationStatus: "accepted",
            financialTableId: tableUuid,
            userId: userUuid,
          },
        });

      if (invitationFinancialTable) {
        return res.status(200).send({
          data: { permission: true, permissionLevel: "Member" },
        });
      }

      return res.status(403).send({
        data: { permission: false, permissionLevel: null },
        message: "User has no rights!",
      });
    } catch (error) {
      utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
      return res.status(500).send({ message: "Something went wrong!" });
    }
  }

  await checkOwnership(userUuid, tableUuid);
};

exports.getSharedFinancialTables = async function (req, res) {
  const { UserFinancialTableInvitation, FinancialTable } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const { userId } = req.body;

  try {
    const sharedFinancialTables = await UserFinancialTableInvitation.findAll({
      where: { userId, invitationStatus: "accepted" },
      raw: true,
    });

    const financialTableIds = sharedFinancialTables.map(
      (item) => item.financialTableId
    );

    const financialTables = await FinancialTable.findAll({
      where: { uuid: financialTableIds },
      raw: true,
    });

    return res.status(200).send({
      data: financialTables,
      message: "Financial data retrieved successfully!",
    });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.leaveSharedFinancialTable = async function (req, res) {
  const { UserFinancialTableInvitation } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const { userId, tableUuid } = req.body;

  try {
    const invitationData = await UserFinancialTableInvitation.findOne({
      where: { userId, financialTableId: tableUuid },
    });

    await invitationData.destroy();

    return res.status(200).send({
      message: "Successfully left the board!",
    });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.getCurrencyExchangeRates = async function (req, res) {
  const { CurrencyExchangeRates } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  try {
    const currencyExchangeRates = await CurrencyExchangeRates.findAll();

    return res.status(200).send({
      data: currencyExchangeRates,
      message: "Successfully left the board!",
    });
  } catch (error) {
    utils.writeToLogFile(`IP: ${ip} -- ${error}`, "error");
    return res.status(500).send({ message: "Something went wrong!" });
  }
};
