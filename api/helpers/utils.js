const fs = require("fs");

var utils = (module.exports = {});

utils.writeToLogFile = function (data, level) {
  const currentDate = new Date();

  let fileName = "";
  if (level === "error") {
    fileName = "./logs/error.log";
  } else if (level === "warning") {
    fileName = "./logs/warning.log";
  } else {
    fileName = "./logs/info.log";
  }

  try {
    fs.accessSync(fileName, fs.constants.F_OK);
  } catch (err) {
    fs.writeFileSync(fileName, "");
  }

  const logMessage = `${currentDate.toISOString()}: ${data}\n`;

  fs.appendFileSync(fileName, logMessage);
};

utils.updateCurrencyExchanges = async () => {
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
    if (count > 0) {
      await CurrencyExchangeRates.drop();
      utils.writeToLogFile(`Currencies table successfully deleted!`, "info");
    }

    await getExchangeRates();
    return utils.writeToLogFile(`Currencies successfully created!`, "info");
  } catch (error) {
    return utils.writeToLogFile(error, "error");
  }
};
