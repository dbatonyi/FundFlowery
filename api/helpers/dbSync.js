const bcrypt = require("bcryptjs");

const config = require("../config");

let utils = require("./utils");

var dbSync = (module.exports = {});

async function createDefaultLogLevels() {
  const { LogLevel } = require("../models");

  const defaultLogLevels = ["info", "warning", "error"];

  for (const levelName of defaultLogLevels) {
    const [level, created] = await LogLevel.findOrCreate({
      where: { name: levelName },
    });
    if (created) {
      utils.writeToLogFile(
        `Created log level "${levelName}" with id ${level.id}`,
        "info"
      );
      console.log(`Created log level "${levelName}" with id ${level.id}`);
    }
  }
}

async function createAdminUser() {
  const { User } = require("../models");

  const generateHash = function (password) {
    const salt = bcrypt.genSaltSync(8);
    return bcrypt.hashSync(password, salt);
  };

  const userPassword = generateHash(config.adminCredentials.adminPassword);
  const regHashRow = generateHash(
    config.adminCredentials.adminEmail + config.adminCredentials.adminPassword
  );

  const [admin, created] = await User.findOrCreate({
    where: { email: config.adminCredentials.adminEmail },
    defaults: {
      email: config.adminCredentials.adminEmail,
      username: config.adminCredentials.adminEmail,
      password: userPassword,
      firstname: config.adminCredentials.adminFirstname,
      lastname: config.adminCredentials.adminLastname,
      status: "active",
      role: "Admin",
      reghash: regHashRow,
    },
  });

  if (created) {
    utils.writeToLogFile(`Admin user created!`, "info");
    console.log(`Admin user created!`);
  }
}

dbSync.populateDBTables = async function () {
  createDefaultLogLevels();
  createAdminUser();

  utils.writeToLogFile("DB tables populated!", "info");
  console.log("DB tables populated!");
};
