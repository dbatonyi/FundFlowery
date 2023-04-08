const config = require("../config")["api"];

let utils = require("../helpers/utils");

var exports = (module.exports = {});

exports.apiLog = async function (req, res) {
  const { Log } = require("../models");
  const { logMessage, logLevel } = req.body;

  const authenticateToken = req.headers["authenticate"];

  if (!authenticateToken || config.apiToken !== authenticateToken.slice(7)) {
    return res.send({ message: "API token not valid!" });
  }

  try {
    const log = await Log.create({
      logMessage,
      logLevel,
    });

    return res.send({
      message: "Log saved!",
    });
  } catch (error) {
    utils.writeToLogFile(error, "error");
    return res.send({ message: "Something went wrong!" });
  }
};
