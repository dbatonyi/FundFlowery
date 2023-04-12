import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../layouts/Layout";

const configData = require("../../config");

const FinancialTable = (props) => {
  const { setStatusMessage, userInfo } = useContext(AuthContext);

  const [reRender, setReRender] = useState(false);

  const [financialTableList, setFinancialTableList] = useState(null);
  const [filteredFinancialTableList, setFilteredFinancialTableList] =
    useState(null);

  const [showPopup, setShowPopup] = useState(false);

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
        headers: { "Content-Type": "application/json" },
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
          `${configData.serverUrl}/api/get-financial-tables-by-user`,
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
          console.log(dataJson.data);
          setFinancialTableList(dataJson.data);
          setFilteredFinancialTableList(dataJson.data);
        }
      } catch (error) {
        const log = await fetch(`${configData.serverUrl}/api/log`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

  //Form handler
  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const tableName = formData.get("table-name");
    createNewFinancialTable(tableName);

    setShowPopup(false);
  };

  return (
    <div className="financial-table">
      <div className="financial-table__container">
        <h1>Financial Tables</h1>
        <div className="financial-table__container--controllers">
          <div
            className="create-new-table"
            onClick={() => {
              setShowPopup(true);
            }}
          >
            +
          </div>
        </div>
        <div className="financial-table__container-list">
          The financial tables list goes here!
          {filteredFinancialTableList &&
          filteredFinancialTableList.length > 0 ? (
            <div className="financial-table-list--item">item</div>
          ) : (
            <div className="financial-table--no-result">
              There is no financial table with this user.
            </div>
          )}
        </div>
      </div>
      {showPopup ? (
        <div className="popup-container">
          <div
            className="popup-container--close"
            onClick={() => {
              setShowPopup(false);
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
    </div>
  );
};

export default FinancialTable;
