import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../layouts/Layout";
import useTranslation from "next-translate/useTranslation";

const configData = require("../../config");

const FinancialTable = (props) => {
  const { t } = useTranslation("financialTables");
  const { setStatusMessage, userInfo } = useContext(AuthContext);

  const [reRender, setReRender] = useState(false);

  const [financialTableList, setFinancialTableList] = useState(null);
  const [filteredFinancialTableList, setFilteredFinancialTableList] =
    useState(null);

  const [sharedFinancialTableList, setSharedFinancialTableList] =
    useState(null);
  const [
    filteredSharedFinancialTableList,
    setFilteredSharedFinancialTableList,
  ] = useState(null);

  const [selectedTableUuid, setSelectedTableUuid] = useState(null);
  const [selectedSharedTableUuid, setSelectedSharedTableUuid] = useState(null);

  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showLeavePopup, setShowLeavePopup] = useState(false);

  //Functions

  const fetchFinancialTableList = async () => {
    try {
      const response = await fetch(
        `${configData.serverUrl}/api/get-financial-tables`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            userId: userInfo.uuid,
          }),
        }
      );
      const dataJson = await response.json();

      if (response.status === 200) {
        setFinancialTableList(dataJson.data);
        setFilteredFinancialTableList(dataJson.data);
      }
    } catch (error) {
      const log = await fetch(`${configData.serverUrl}/api/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authenticate: `Bearer ${configData.apiToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          log: error,
        }),
      });
      const data = await log.json();
      setStatusMessage(data.message);
    }
  };

  const fetchSharedFinancialTableList = async () => {
    try {
      const response = await fetch(
        `${configData.serverUrl}/api/get-shared-financial-tables`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            userId: userInfo.uuid,
          }),
        }
      );
      const dataJson = await response.json();

      if (response.status === 200) {
        setSharedFinancialTableList(dataJson.data);
        setFilteredSharedFinancialTableList(dataJson.data);
      }
    } catch (error) {
      const log = await fetch(`${configData.serverUrl}/api/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authenticate: `Bearer ${configData.apiToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          log: error,
        }),
      });
      const data = await log.json();
      setStatusMessage(data.message);
    }
  };

  const createNewFinancialTable = async (tableName) => {
    try {
      const response = await fetch(
        `${configData.serverUrl}/api/create-financial-table`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            userId: userInfo.uuid,
            tableName,
          }),
        }
      );
      const dataJson = await response.json();

      if (response.status === 200) {
        setReRender(!reRender);
      }
    } catch (error) {
      const log = await fetch(`${configData.serverUrl}/api/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authenticate: `Bearer ${configData.apiToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          log: error,
        }),
      });
      const data = await log.json();
      setStatusMessage(data.message);
    }
  };

  const deleteFinancialTable = async (tableUuid) => {
    try {
      const response = await fetch(
        `${configData.serverUrl}/api/delete-financial-table`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            tableUuid,
          }),
        }
      );
      const dataJson = await response.json();

      if (response.status === 200) {
        //TODO - Better status messages
        setReRender(!reRender);
      }
    } catch (error) {
      const log = await fetch(`${configData.serverUrl}/api/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authenticate: `Bearer ${configData.apiToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          log: error,
        }),
      });
      const data = await log.json();
      setStatusMessage(data.message);
    }
  };

  const leaveSharedFinancialTable = async (tableUuid) => {
    try {
      const response = await fetch(
        `${configData.serverUrl}/api/leave-shared-financial-table`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            userId: userInfo.uuid,
            tableUuid,
          }),
        }
      );
      const dataJson = await response.json();

      if (response.status === 200) {
        //TODO - Better status messages
        setReRender(!reRender);
      }
    } catch (error) {
      const log = await fetch(`${configData.serverUrl}/api/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authenticate: `Bearer ${configData.apiToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          log: error,
        }),
      });
      const data = await log.json();
      setStatusMessage(data.message);
    }
  };

  //useEffects

  useEffect(() => {
    fetchFinancialTableList();
    fetchSharedFinancialTableList();
  }, [reRender]);

  //Handlers
  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const tableName = formData.get("table-name");
    createNewFinancialTable(tableName);

    setShowCreatePopup(false);
  };

  return (
    <div className="financial-table-list">
      <div className="financial-table-list__container">
        <h1>{t("financialTablesTitle")}</h1>
        <div className="financial-table-list__container--controllers">
          <div
            className="create-new-table"
            onClick={() => {
              setShowCreatePopup(true);
            }}
          >
            +
          </div>
        </div>
        <div className="financial-table-list__container-list">
          {t("financialTablesListText")}
          {filteredFinancialTableList &&
          filteredFinancialTableList.length > 0 ? (
            <>
              {filteredFinancialTableList.map((table) => {
                return (
                  <div
                    key={table.uuid}
                    className="financial-table-list__container-list--item"
                  >
                    <Link href={`/financial-table/${table.uuid}`}>
                      {table.tableName}
                    </Link>
                    <div
                      className="delete-table"
                      onClick={() => {
                        setSelectedTableUuid(table.uuid);
                        setShowDeletePopup(true);
                      }}
                    >
                      {t("financialTablesCardDelete")}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="financial-table-list--no-result">
              {t("financialTablesNoResult")}
            </div>
          )}
        </div>
      </div>
      <div className="financial-table-list__shared-container">
        {filteredSharedFinancialTableList &&
        filteredSharedFinancialTableList.length > 0 ? (
          <>
            {t("financialTablesSharedListText")}
            {filteredSharedFinancialTableList.map((table) => {
              return (
                <div
                  key={table.uuid}
                  className="financial-table-list__container-list--item"
                >
                  <Link href={`/financial-table/${table.uuid}`}>
                    {table.tableName}
                  </Link>
                  <div
                    className="leave-table"
                    onClick={() => {
                      setSelectedSharedTableUuid(table.uuid);
                      setShowLeavePopup(true);
                    }}
                  >
                    Leave
                  </div>
                </div>
              );
            })}
          </>
        ) : null}
      </div>
      {showCreatePopup ? (
        <div className="popup-container">
          <div
            className="popup-container--close"
            onClick={() => {
              setShowCreatePopup(false);
            }}
          >
            X
          </div>
          <div className="popup-container--title">
            {t("financialTablesCreateCardTitle")}
          </div>
          <form onSubmit={submitHandler}>
            <label htmlFor="table-name">
              {t("financialTablesCreateCardNameLabel")}
            </label>
            <input className="text" name="table-name" type="text" required />
            <button className="submit-btn" type="submit">
              {t("financialTablesCreateCardSubmit")}
            </button>
          </form>
        </div>
      ) : null}
      {showDeletePopup ? (
        <div className="popup-container">
          <div
            className="popup-container--close"
            onClick={() => {
              setShowDeletePopup(false);
            }}
          >
            X
          </div>
          <div className="popup-container--title">
            {t("financialTablesDeleteCardTitle")}
          </div>
          <div className="popup-container--controllers">
            <div
              className="cancel"
              onClick={() => {
                setShowDeletePopup(false);
                setSelectedTableUuid(null);
              }}
            >
              {t("financialTablesDeleteCardNo")}
            </div>
            <div
              className="accept"
              onClick={() => {
                deleteFinancialTable(selectedTableUuid);
                setShowDeletePopup(false);
              }}
            >
              {t("financialTablesDeleteCardYes")}
            </div>
          </div>
        </div>
      ) : null}
      {showLeavePopup ? (
        <div className="popup-container">
          <div
            className="popup-container--close"
            onClick={() => {
              setShowLeavePopup(false);
            }}
          >
            X
          </div>
          <div className="popup-container--title">
            {t("financialTablesLeaveCardTitle")}
          </div>
          <div className="popup-container--controllers">
            <div
              className="cancel"
              onClick={() => {
                setShowLeavePopup(false);
                setSelectedSharedTableUuid(null);
              }}
            >
              {t("financialTablesLeaveCardNo")}
            </div>
            <div
              className="accept"
              onClick={() => {
                leaveSharedFinancialTable(selectedSharedTableUuid);
                setShowLeavePopup(false);
              }}
            >
              {t("financialTablesLeaveCardYes")}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FinancialTable;
