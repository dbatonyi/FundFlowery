let apiController = require("../controllers/apiController");

module.exports = function (app) {
  // API

  app.post("/api/log", apiController.apiLog);

  app.post("/api/create-financial-table", apiController.createFinancialTable);

  app.post("/api/get-financial-tables", apiController.getFinancialTablesByUser);

  app.post(
    "/api/get-financial-table-data",
    apiController.getFinancialTableDataByUuid
  );

  app.post(
    "/api/delete-financial-table",
    apiController.deleteFinancialTableByUuid
  );

  app.post("/api/create-new-income-item", apiController.createIncomeItem);

  app.post(
    "/api/create-new-outgoing-group-item",
    apiController.createNewOutgoingGroupItem
  );

  app.post("/api/create-new-outgoing-item", apiController.createOutgoingItem);

  app.post("/api/delete-income-item", apiController.deleteIncomeItem);

  app.post("/api/delete-outgoing-item", apiController.deleteOutgoingItem);

  app.post(
    "/api/edit-financial-table-title",
    apiController.editFinancialTableTitle
  );

  app.post("/api/edit-income-card", apiController.editIncomeCard);

  app.post("/api/edit-outgoing-card", apiController.editOutgoingCard);

  app.post("/api/share-financial-table", apiController.shareFinancialTable);

  app.post("/api/get-invites-list", apiController.getInvitesList);

  app.post("/api/accept-invitation", apiController.acceptInvitation);

  app.post("/api/delete-invitation", apiController.deleteInvitation);

  app.post(
    "/api/get-financial-table-permission",
    apiController.financialTablePermission
  );

  app.post(
    "/api/get-shared-financial-tables",
    apiController.getSharedFinancialTables
  );

  app.post(
    "/api/leave-shared-financial-table",
    apiController.leaveSharedFinancialTable
  );

  app.get(
    "/api/get-currency-exchange-rates",
    apiController.getCurrencyExchangeRates
  );
};
