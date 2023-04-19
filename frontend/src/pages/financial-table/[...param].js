import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import useTranslation from "next-translate/useTranslation";
import { AuthContext } from "../../layouts/Layout";
import NewIncomeForm from "@/components/forms/NewIncomeForm";
import NewOutgoingForm from "@/components/forms/NewOutgoingForm";
import IncomeCard from "@/components/IncomeCard";
import OutgoingCard from "@/components/OutgoingCard";

const configData = require("../../../config");

const FinancialTable = () => {
  const router = useRouter();
  const urlParam = router.query.param;

  const { setStatusMessage, userInfo } = useContext(AuthContext);

  const [tableData, setTableData] = useState(null);
  const [incomes, setIncomes] = useState(null);
  const [filteredIncomes, setFilteredIncomes] = useState(null);
  const [outgoings, setOutgoings] = useState(null);
  const [filteredOutgoings, setFilteredOutgoings] = useState(null);

  const [reRender, setReRender] = useState(false);

  const [openedForm, setOpenedForm] = useState(null);
  const [titleForm, setTitleForm] = useState(false);

  const [isSharePopupOpened, setIsSharePopupOpened] = useState(false);

  useEffect(() => {
    const fetchFinancialTable = async () => {
      try {
        const response = await fetch(
          `${configData.serverUrl}/api/get-financial-table-data`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authenticate: `Bearer ${configData.apiToken}`,
            },
            credentials: "include",
            body: JSON.stringify({
              tableUuid: urlParam,
            }),
          }
        );
        const dataJson = await response.json();

        if (response.status === 200) {
          console.log(dataJson.data[0]);
          setTableData(dataJson.data[0]);
          setIncomes(dataJson.data[0].incomes);
          setFilteredIncomes(dataJson.data[0].incomes);
          setOutgoings(dataJson.data[0].outgoings);
          setFilteredOutgoings(dataJson.data[0].outgoings);
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

    fetchFinancialTable();
  }, [reRender]);

  const editTitle = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const tableTitle = formData.get("table-title");

    try {
      const response = await fetch(
        `${configData.serverUrl}/api/edit-financial-table-title`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            uuid: tableData.uuid,
            tableName: tableTitle,
          }),
        }
      );

      const dataJson = await response.json();

      if (response.status === 200) {
        setStatusMessage(dataJson.message);
        setReRender(!reRender);
        setTitleForm(false);
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

  const shareTable = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const userEmail = formData.get("email");

    try {
      const response = await fetch(
        `${configData.serverUrl}/api/share-financial-table`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            tableUuid: tableData.uuid,
            inviterUserUuid: userInfo.uuid,
            invitedUserEmail: userEmail,
          }),
        }
      );

      const dataJson = await response.json();

      if (response.status === 200) {
        setStatusMessage(dataJson.message);
        setReRender(!reRender);
        setIsSharePopupOpened(false);
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

  return (
    <div className="financial-table">
      {tableData ? (
        <>
          <div className="financial-table__form-container">
            <div className="financial-table__form-container--title">
              {!titleForm ? (
                <>
                  {tableData.tableName}
                  <div
                    className="edit-title"
                    onClick={() => {
                      setTitleForm(true);
                    }}
                  >
                    Edit
                  </div>
                </>
              ) : (
                <>
                  <form onSubmit={editTitle}>
                    <input
                      className="text"
                      placeholder={tableData.tableName}
                      name="table-title"
                      type="text"
                    />
                    <button className="btn" type="submit">
                      Save
                    </button>
                  </form>
                  <div
                    className="edit-close"
                    onClick={() => {
                      setTitleForm(false);
                    }}
                  >
                    x
                  </div>
                </>
              )}
            </div>
            <div
              className="financial-table__form-container--share"
              onClick={() => {
                setIsSharePopupOpened(true);
              }}
            >
              Share with others
            </div>
            <div className="financial-table__form-container--controllers">
              <div
                className="add-new-income-item"
                onClick={() => {
                  setOpenedForm("income");
                }}
              >
                + Add new income item
              </div>
              <div
                className="add-new-outgoing-item"
                onClick={() => {
                  setOpenedForm("outgoing");
                }}
              >
                + Add new outgoing item
              </div>
            </div>
            <div className="financial-table__list">
              <div className="financial-table__list--incomes">
                Income list:
                {filteredIncomes && filteredIncomes.length > 0 ? (
                  <IncomeCard
                    incomeData={filteredIncomes}
                    reRender={reRender}
                    setReRender={setReRender}
                  />
                ) : (
                  <div className="no-result">There is no incomes</div>
                )}
              </div>
              <div className="financial-table__list--outgoings">
                Outgoing list:
                {filteredOutgoings && filteredOutgoings.length > 0 ? (
                  <OutgoingCard
                    outgoingData={filteredOutgoings}
                    reRender={reRender}
                    setReRender={setReRender}
                  />
                ) : (
                  <div className="no-result">There is no outgoings</div>
                )}
              </div>
            </div>
          </div>
          {openedForm === "income" ? (
            <NewIncomeForm
              tableUuid={urlParam}
              setOpenedForm={setOpenedForm}
              reRender={reRender}
              setReRender={setReRender}
            />
          ) : null}
          {openedForm === "outgoing" ? (
            <NewOutgoingForm
              tableUuid={urlParam}
              setOpenedForm={setOpenedForm}
              reRender={reRender}
              setReRender={setReRender}
            />
          ) : null}
        </>
      ) : null}
      {isSharePopupOpened ? (
        <div className="popup-container share-popup">
          <div
            className="popup-container--close"
            onClick={() => {
              setIsSharePopupOpened(false);
            }}
          >
            X
          </div>
          <div className="popup-container--text">Share this table with:</div>
          <form onSubmit={shareTable}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" required />
            <button type="submit">Send</button>
          </form>
        </div>
      ) : null}
    </div>
  );
};

export default FinancialTable;
