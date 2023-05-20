const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fetch = require("isomorphic-fetch");
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

  const regHashRow = crypto.randomBytes(20).toString("hex");

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

async function createCurrencyExchanges() {
  const { CurrencyExchangeRates } = require("../models");

  const saveExchangeRates = async (
    currencyExchangeBase,
    currencyExchangeTarget,
    currencyExchangeRate
  ) => {
    try {
      const exchangeRate = await CurrencyExchangeRates.create({
        currencyExchangeBase,
        currencyExchangeTarget,
        currencyExchangeRate,
      });

      return exchangeRate;
    } catch (error) {
      return utils.writeToLogFile(error, "error");
    }
  };

  const getExchangeRates = async () => {
    try {
      const currencyResponse = await fetch(
        "https://api.apilayer.com/exchangerates_data/latest?symbols=HUF%2C%20EUR%2C%20USD&base=HUF",
        {
          headers: {
            apikey: config.api.exchangeRatesDataAPI,
          },
        }
      );

      const currencyData = await currencyResponse.json();

      const hufUsdRate = currencyData.rates.USD;
      const hufEurRate = currencyData.rates.EUR;
      const usdHufRate = 1 / hufUsdRate;
      const eurHufRate = 1 / hufEurRate;
      const eurUsdRate = hufEurRate / hufUsdRate;
      const usdEurRate = hufUsdRate / hufEurRate;

      await saveExchangeRates("HUF", "EUR", hufEurRate);
      await saveExchangeRates("HUF", "USD", hufUsdRate);
      await saveExchangeRates("USD", "HUF", usdHufRate);
      await saveExchangeRates("EUR", "HUF", eurHufRate);
      await saveExchangeRates("EUR", "USD", eurUsdRate);
      await saveExchangeRates("USD", "EUR", usdEurRate);
    } catch (error) {
      return utils.writeToLogFile(error, "error");
    }
  };

  try {
    const count = await CurrencyExchangeRates.count();
    if (count === 0) {
      await getExchangeRates();
      return utils.writeToLogFile(`Currencies successfully created!`, "info");
    }

    return utils.writeToLogFile(`Currencies already created!`, "info");
  } catch (error) {
    return utils.writeToLogFile(error, "error");
  }
}

dbSync.populateDBTables = async function () {
  await createDefaultLogLevels();
  await createAdminUser();
  await createCurrencyExchanges();

  utils.writeToLogFile("DB tables populated!", "info");
  console.log("DB tables populated!");
};
