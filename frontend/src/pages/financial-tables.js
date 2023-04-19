import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../layouts/Layout";

const configData = require("../../config");

const FinancialTable = (props) => {
  const { setStatusMessage, userInfo } = useContext(AuthContext);

  const [reRender, setReRender] = useState(false);

  const [financialTableList, setFinancialTableList] = useState(null);
  const [filteredFinancialTableList, setFilteredFinancialTableList] =
    useState(null);

  const [selectedTableUuid, setSelectedTableUuid] = useState(null);

  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  //Functions

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
        setStatusMessage(dataJson.message);
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

    fetchFinancialTableList();
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
        <h1>Financial Tables</h1>
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
          The financial tables list goes here!
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
                      Delete
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="financial-table-list--no-result">
              There is no financial table with this user.
            </div>
          )}
        </div>
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
          <div className="popup-container--title">Create new table</div>
          <form onSubmit={submitHandler}>
            <label htmlFor="table-name">Table name</label>
            <input className="text" name="table-name" type="text" required />
            <button className="submit-btn" type="submit">
              Create
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
            You really want to delete the table
          </div>
          <div className="popup-container--controllers">
            <div
              className="cancel"
              onClick={() => {
                setShowDeletePopup(false);
                setSelectedTableUuid(null);
              }}
            >
              No
            </div>
            <div
              className="accept"
              onClick={() => {
                deleteFinancialTable(selectedTableUuid);
                setShowDeletePopup(false);
              }}
            >
              Yes
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FinancialTable;
