let apiController = require("../controllers/apiController");

module.exports = function (app) {
  // API

  app.post("/api/log", apiController.apiLog);

  app.post(
    "/api/get-financial-tables-by-user",
    apiController.getFinancialTablesByUser
  );

  app.post(
    "/api/get-financial-table-data-by-id",
    apiController.getFinancialTableDataById
  );
};
