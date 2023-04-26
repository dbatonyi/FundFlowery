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

  const [permission, setPermission] = useState(false);
  const [permissionLevel, setPermissionLevel] = useState(null);

  const [currencyExchangeRates, setCurrencyExchangeRates] = useState(null);

  const [tableData, setTableData] = useState(null);
  const [incomes, setIncomes] = useState(null);
  const [summedIncomeAmount, setSummedIncomeAmount] = useState(null);
  const [filteredIncomes, setFilteredIncomes] = useState(null);
  const [outgoings, setOutgoings] = useState(null);
  const [summedOutgoingAmount, setSummedOutgoingAmount] = useState(null);
  const [filteredOutgoings, setFilteredOutgoings] = useState(null);

  const [reRender, setReRender] = useState(false);

  const [openedForm, setOpenedForm] = useState(null);
  const [titleForm, setTitleForm] = useState(false);

  const [isSharePopupOpened, setIsSharePopupOpened] = useState(false);

  const getPermissionData = async () => {
    try {
      const response = await fetch(
        `${configData.serverUrl}/api/get-financial-table-permission`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            userUuid: userInfo.uuid,
            tableUuid: urlParam,
          }),
        }
      );
      const dataJson = await response.json();

      return dataJson?.data;
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

  const getCurrencyExchangeRates = async () => {
    try {
      const response = await fetch(
        `${configData.serverUrl}/api/get-currency-exchange-rates`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
        }
      );
      const dataJson = await response.json();

      return setCurrencyExchangeRates(dataJson?.data);
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

  const fetchFinancialTable = async () => {
    const sumIncomeAmounts = async (incomeArray) => {
      const sumByCurrency = {};

      incomeArray.forEach((income) => {
        if (sumByCurrency[income.incomeCurrency]) {
          sumByCurrency[income.incomeCurrency] += income.incomeAmount;
        } else {
          sumByCurrency[income.incomeCurrency] = income.incomeAmount;
        }
      });

      setSummedIncomeAmount(sumByCurrency);
    };

    const sumOutgoingAmounts = async (outgoingArray) => {
      const sumByCurrency = {};

      outgoingArray.forEach((outgoing) => {
        if (sumByCurrency[outgoing.outgoingCurrency]) {
          sumByCurrency[outgoing.outgoingCurrency] += outgoing.outgoingAmount;
        } else {
          sumByCurrency[outgoing.outgoingCurrency] = outgoing.outgoingAmount;
        }
      });

      setSummedOutgoingAmount(sumByCurrency);
    };

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
        sumIncomeAmounts(dataJson.data[0].incomes);
        setFilteredIncomes(dataJson.data[0].incomes);
        setOutgoings(dataJson.data[0].outgoings);
        sumOutgoingAmounts(dataJson.data[0].outgoings);
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

  useEffect(() => {
    const tableDataController = async () => {
      const permissionData = await getPermissionData();
      await getCurrencyExchangeRates();

      if (permissionData?.permission) {
        await fetchFinancialTable();
        setPermissionLevel(permissionData.permissionLevel);
        setPermission(true);
      } else {
        await router.push("/dashboard");
      }
    };

    tableDataController();
  }, [reRender]);

  return (
    <div className="financial-table">
      {permission ? (
        <>
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
                      <>
                        {filteredIncomes.map((incomeItem, index) => {
                          return (
                            <IncomeCard
                              incomeData={incomeItem}
                              reRender={reRender}
                              setReRender={setReRender}
                              key={index}
                            />
                          );
                        })}
                      </>
                    ) : (
                      <div className="no-result">There is no incomes</div>
                    )}
                  </div>
                  <div className="financial-table__list--outgoings">
                    Outgoing list:
                    {filteredOutgoings && filteredOutgoings.length > 0 ? (
                      <>
                        {filteredOutgoings.map((outgoingItem, index) => {
                          return (
                            <OutgoingCard
                              outgoingData={outgoingItem}
                              reRender={reRender}
                              setReRender={setReRender}
                              key={index}
                            />
                          );
                        })}
                      </>
                    ) : (
                      <div className="no-result">There is no outgoings</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="financial-table__summary">
                <div className="financial-table__summary--income">
                  <div className="details">
                    {summedIncomeAmount?.HUF ? (
                      <div className="details--huf">
                        {summedIncomeAmount.HUF} HUF
                      </div>
                    ) : null}
                    {summedIncomeAmount?.EUR ? (
                      <div className="details--eur">
                        {summedIncomeAmount.EUR} EUR
                      </div>
                    ) : null}

                    {summedIncomeAmount?.USD ? (
                      <div className="details--usd">
                        {summedIncomeAmount.USD} USD
                      </div>
                    ) : null}
                  </div>
                  <div className="converted-details"></div>
                </div>
                <div className="financial-table__summary--outgoing">
                  <div className="details">
                    {summedOutgoingAmount?.HUF ? (
                      <div className="details--huf">
                        {summedOutgoingAmount.HUF} HUF
                      </div>
                    ) : null}
                    {summedOutgoingAmount?.EUR ? (
                      <div className="details--eur">
                        {summedOutgoingAmount.EUR} EUR
                      </div>
                    ) : null}

                    {summedOutgoingAmount?.USD ? (
                      <div className="details--usd">
                        {summedOutgoingAmount.USD} USD
                      </div>
                    ) : null}
                  </div>
                  <div className="converted-details"></div>
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
              <div className="popup-container--text">
                Share this table with:
              </div>
              <form onSubmit={shareTable}>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" name="email" required />
                <button type="submit">Send</button>
              </form>
            </div>
          ) : null}
        </>
      ) : (
        <div className="fetching-in-progress">Fetching in progress..</div>
      )}
    </div>
  );
};

export default FinancialTable;
