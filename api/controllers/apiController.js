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
      logMessage,
      logLevel,
    });

    return res.status(200).send({
      message: "Log saved!",
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
      where: { uuid: userId },
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

exports.getFinancialTableDataById = async function (req, res) {
  const { FinancialTable, Invoices, Earnings } = require("../models");
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    utils.writeToLogFile(`IP: ${ip} -- (API token not valid!)`, "warning");
    return res.status(403).send({ message: "API token not valid!" });
  }

  const { tableId } = req.body;

  try {
    const financialTable = await FinancialTable.findAll({
      where: { uuid: tableId },
      include: [Invoices, Earnings],
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
