module.exports = {
  locales: ["en", "hu"], // Array with the languages that you want to use
  defaultLocale: "en", // Default language of your website
  pages: {
    "*": [
      "signin",
      "signup",
      "newpassword",
      "resetpassword",
      "navigation",
      "dashboard",
      "financialTables",
      "notifications",
      "inviteCard",
      "currencyRatesTable",
      "financialTable",
      "monthPicker",
      "incomeCard",
      "outgoingCard",
      "newIncomeForm",
      "newOutgoingForm",
    ], // Namespaces that you want to import per page (we stick to one namespace for all the application in this tutorial)
  },
};
