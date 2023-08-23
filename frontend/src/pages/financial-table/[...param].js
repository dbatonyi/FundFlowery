import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import useTranslation from "next-translate/useTranslation";
import { AuthContext } from "../../layouts/Layout";
import NewIncomeForm from "@/components/forms/NewIncomeForm";
import OutgoingGroup from "@/components/OutgoingGroup";
import NewOutgoingGroupForm from "@/components/forms/NewOutgoingGroupForm";
import IncomeCard from "@/components/IncomeCard";
import YearPicker from "@/components/YearPicker";
import MonthPicker from "@/components/MonthPicker";

const configData = require("../../../config");

const FinancialTable = () => {
  const { t } = useTranslation("financialTable");

  const router = useRouter();
  const urlParam = router.query.param;

  const currentDate = new Date();
  const monthNumber = (currentDate.getMonth() + 1).toString().padStart(2, "0");

  const { setStatusMessage, userInfo, setCurrencyRates } =
    useContext(AuthContext);

  const [permission, setPermission] = useState(false);
  const [permissionLevel, setPermissionLevel] = useState(null);

  const [tableData, setTableData] = useState(null);

  const [incomes, setIncomes] = useState(null);
  const [summedIncomeAmount, setSummedIncomeAmount] = useState(null);
  const [convertedIncomeAmount, setConvertedIncomeAmount] = useState(null);
  const [filteredIncomes, setFilteredIncomes] = useState(null);

  const [outgoingsGroup, setOutgoingsGroup] = useState(null);
  const [summedOutgoingAmount, setSummedOutgoingAmount] = useState(null);
  const [convertedOutgoingAmount, setConvertedOutgoingAmount] = useState(null);
  const [filteredOutgoingsGroup, setFilteredOutgoingsGroup] = useState(null);

  const [selectedCurrency, setSelectedCurrency] = useState("HUF");

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(monthNumber);

  const [overallTotal, setOverallTotal] = useState(0);

  const [reRender, setReRender] = useState(false);

  const [openedForm, setOpenedForm] = useState(null);
  const [titleForm, setTitleForm] = useState(false);

  const [isSharePopupOpened, setIsSharePopupOpened] = useState(false);

  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);

    summaryController(
      event.target.value,
      filteredIncomes,
      0 /* filteredOutgoings */
    );
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

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
        setOutgoingsGroup(dataJson.data[0].outgoingsGroup);

        console.log("Data: ", dataJson.data[0]);

        overallTotalSummary(
          selectedCurrency,
          dataJson.data[0].incomes,
          //TODO: Fix the outgoing issues
          //dataJson.data[0].outgoings
          0
        );

        const filteredIncomesArray = dataJson.data[0].incomes.filter(
          (income) => {
            const incomeDate = new Date(income.incomeDate);
            const incomeYear = incomeDate.getFullYear();
            const incomeMonthNumber = (incomeDate.getMonth() + 1)
              .toString()
              .padStart(2, "0");

            return (
              incomeYear === Number(selectedYear) &&
              incomeMonthNumber === selectedMonth
            );
          }
        );

        setFilteredIncomes(filteredIncomesArray);

        const filteredOutgoingsGroupArray =
          dataJson.data[0].outgoingsGroup.filter((outgoingGroup) => {
            const outgoingsGroupDate = new Date(
              outgoingGroup.outgoingsGroupDate
            );
            const outgoingsGroupYear = outgoingsGroupDate.getFullYear();
            const outgoingsGroupMonthNumber = (
              outgoingsGroupDate.getMonth() + 1
            )
              .toString()
              .padStart(2, "0");

            return (
              outgoingsGroupYear === Number(selectedYear) &&
              outgoingsGroupMonthNumber === selectedMonth
            );
          });

        setFilteredOutgoingsGroup(filteredOutgoingsGroupArray);
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

      if (response.status === 200) {
        setStatusMessage(t("financialTableEditResponse"));
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
        setStatusMessage(t("financialTableShareResponse"));
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

  const summaryController = async (
    selectedCurrency,
    incomesData,
    outgoingsData
  ) => {
    const currencyExchangeRates = await getCurrencyExchangeRates();

    const sumIncomeAmounts = async (incomeArray) => {
      const sumByCurrency = { HUF: 0, EUR: 0, USD: 0 };

      incomeArray.forEach((income) => {
        if (sumByCurrency[income.incomeCurrency]) {
          sumByCurrency[income.incomeCurrency] += income.incomeAmount;
        } else {
          sumByCurrency[income.incomeCurrency] = income.incomeAmount;
        }
      });

      setSummedIncomeAmount(sumByCurrency);
      return sumByCurrency;
    };

    const sumOutgoingAmounts = async (outgoingArray) => {
      const sumByCurrency = { HUF: 0, EUR: 0, USD: 0 };

      outgoingArray.forEach((outgoing) => {
        if (sumByCurrency[outgoing.outgoingCurrency]) {
          sumByCurrency[outgoing.outgoingCurrency] += outgoing.outgoingAmount;
        } else {
          sumByCurrency[outgoing.outgoingCurrency] = outgoing.outgoingAmount;
        }
      });

      setSummedOutgoingAmount(sumByCurrency);
      return sumByCurrency;
    };

    const incomeAmounts = await sumIncomeAmounts(incomesData);
    //TODO: fix this
    //const outgoingAmounts = await sumOutgoingAmounts(outgoingsData);

    const sumIncAmount = { ...incomeAmounts };

    for (const currency of Object.keys(incomeAmounts)) {
      if (currency === selectedCurrency) continue;
      const exchangeRateObj = currencyExchangeRates.find(
        (rate) =>
          rate.currencyExchangeBase === currency &&
          rate.currencyExchangeTarget === selectedCurrency
      );
      if (exchangeRateObj) {
        sumIncAmount[selectedCurrency] +=
          sumIncAmount[currency] * exchangeRateObj.currencyExchangeRate;
        delete sumIncAmount[currency];
      }
    }

    //TODO: fix this
    /* const sumOutAmount = { ...outgoingAmounts };

    for (const currency of Object.keys(outgoingAmounts)) {
      if (currency === selectedCurrency) continue;
      const exchangeRateObj = currencyExchangeRates.find(
        (rate) =>
          rate.currencyExchangeBase === currency &&
          rate.currencyExchangeTarget === selectedCurrency
      );
      if (exchangeRateObj) {
        sumOutAmount[selectedCurrency] +=
          sumOutAmount[currency] * exchangeRateObj.currencyExchangeRate;
        delete sumOutAmount[currency];
      }
    } */

    setConvertedIncomeAmount(sumIncAmount[selectedCurrency]);
    //TODO: fix this
    /* setConvertedOutgoingAmount(sumOutAmount[selectedCurrency]); */
  };

  const overallTotalSummary = async (
    selectedCurrency,
    incomesData,
    outgoingsData
  ) => {
    const currencyExchangeRates = await getCurrencyExchangeRates();
    setCurrencyRates(currencyExchangeRates);

    const sumIncomeAmounts = async (incomeArray) => {
      const sumByCurrency = { HUF: 0, EUR: 0, USD: 0 };

      incomeArray.forEach((income) => {
        if (sumByCurrency[income.incomeCurrency]) {
          sumByCurrency[income.incomeCurrency] += income.incomeAmount;
        } else {
          sumByCurrency[income.incomeCurrency] = income.incomeAmount;
        }
      });

      setSummedIncomeAmount(sumByCurrency);
      return sumByCurrency;
    };

    console.log("outgoindData: ", outgoingsData);

    const sumOutgoingAmounts = async (outgoingArray) => {
      const sumByCurrency = { HUF: 0, EUR: 0, USD: 0 };

      outgoingArray.forEach((outgoing) => {
        if (sumByCurrency[outgoing.outgoingCurrency]) {
          sumByCurrency[outgoing.outgoingCurrency] += outgoing.outgoingAmount;
        } else {
          sumByCurrency[outgoing.outgoingCurrency] = outgoing.outgoingAmount;
        }
      });

      setSummedOutgoingAmount(sumByCurrency);
      return sumByCurrency;
    };

    const incomeAmounts = await sumIncomeAmounts(incomesData);
    //TODO: Fix outgoing amounts

    //const outgoingAmounts = await sumOutgoingAmounts(outgoingsData);
    const outgoingAmounts = { HUF: 0, EUR: 0, USD: 0 };

    const sumIncAmount = { ...incomeAmounts };

    for (const currency of Object.keys(incomeAmounts)) {
      if (currency === selectedCurrency) continue;
      const exchangeRateObj = currencyExchangeRates.find(
        (rate) =>
          rate.currencyExchangeBase === currency &&
          rate.currencyExchangeTarget === selectedCurrency
      );
      if (exchangeRateObj) {
        sumIncAmount[selectedCurrency] +=
          sumIncAmount[currency] * exchangeRateObj.currencyExchangeRate;
        delete sumIncAmount[currency];
      }
    }

    const sumOutAmount = { ...outgoingAmounts };

    for (const currency of Object.keys(outgoingAmounts)) {
      if (currency === selectedCurrency) continue;
      const exchangeRateObj = currencyExchangeRates.find(
        (rate) =>
          rate.currencyExchangeBase === currency &&
          rate.currencyExchangeTarget === selectedCurrency
      );
      if (exchangeRateObj) {
        sumOutAmount[selectedCurrency] +=
          sumOutAmount[currency] * exchangeRateObj.currencyExchangeRate;
        delete sumOutAmount[currency];
      }
    }

    setOverallTotal(
      (sumIncAmount[selectedCurrency] ? sumIncAmount[selectedCurrency] : 0) -
        (sumOutAmount[selectedCurrency] ? sumOutAmount[selectedCurrency] : 0)
    );
  };

  /* Permission system */
  useEffect(() => {
    const tableDataController = async () => {
      const permissionData = await getPermissionData();

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

  useEffect(() => {
    if (incomes) {
      const filteredIncomesArray = incomes.filter((income) => {
        const incomeDate = new Date(income.incomeDate);
        const incomeYear = incomeDate.getFullYear();
        const incomeMonthNumber = (incomeDate.getMonth() + 1)
          .toString()
          .padStart(2, "0");

        return (
          incomeYear === Number(selectedYear) &&
          incomeMonthNumber === selectedMonth
        );
      });

      setFilteredIncomes(filteredIncomesArray);
    }

    //TODO: Fix the outgoing issues
    if (outgoingsGroup) {
      const filteredOutgoingsGroupArray = outgoingsGroup.filter(
        (outgoingGroup) => {
          const outgoingsGroupDate = new Date(outgoingGroup.outgoingsGroupDate);
          const outgoingsGroupYear = outgoingsGroupDate.getFullYear();
          const outgoingsGroupMonthNumber = (outgoingsGroupDate.getMonth() + 1)
            .toString()
            .padStart(2, "0");

          return (
            outgoingsGroupYear === Number(selectedYear) &&
            outgoingsGroupMonthNumber === selectedMonth
          );
        }
      );

      setFilteredOutgoingsGroup(filteredOutgoingsGroupArray);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (filteredIncomes && filteredOutgoingsGroup) {
      summaryController(
        selectedCurrency,
        filteredIncomes,
        0 /* filteredOutgoings */
      );
    }
  }, [filteredIncomes, filteredOutgoingsGroup]);

  return (
    <div className="financial-table-content">
      {permission ? (
        <>
          {tableData ? (
            <>
              <div className="financial-table">
                <div className="financial-table__header">
                  <div className="financial-table__header--title">
                    {!titleForm ? (
                      <>
                        {tableData.tableName}
                        <div
                          className="edit-title"
                          onClick={() => {
                            setTitleForm(true);
                          }}
                        >
                          {t("financialTableEditTitle")}
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
                            {t("financialTableSaveTitle")}
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
                    className="financial-table--share"
                    onClick={() => {
                      setIsSharePopupOpened(true);
                    }}
                  >
                    {t("financialTableShareWithOthersText")}
                  </div>
                  <div className="financial-table__header--date-pick">
                    <YearPicker
                      startYear={2000}
                      endYear={2030}
                      selectedYear={selectedYear}
                      onYearChange={handleYearChange}
                    />
                    <MonthPicker
                      selectedMonth={selectedMonth}
                      handleMonthChange={handleMonthChange}
                    />
                  </div>
                  <div className="financial-table__header--controllers">
                    <div
                      className="add-new-income-item"
                      onClick={() => {
                        setOpenedForm("income");
                      }}
                    >
                      {t("financialTableAddIncome")}
                    </div>
                    <div
                      className="add-new-outgoing-item"
                      onClick={() => {
                        setOpenedForm("outgoing");
                      }}
                    >
                      {t("financialTableAddOutgoing")}
                    </div>
                  </div>
                </div>
                <div className="financial-table__main">
                  <div className="financial-table__main--titles">
                    <div className="incomes-title">
                      {t("financialTableIncomeListText")}:
                    </div>
                    <div className="outgoings-title">
                      {t("financialTableOutgoingListText")}:
                    </div>
                  </div>
                  <div className="financial-table__main--list">
                    <div className="financial-table__list--incomes">
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
                        <div className="no-result">
                          {t("financialTableNoIncomes")}
                        </div>
                      )}
                    </div>
                    <div className="financial-table__list--outgoings">
                      {filteredOutgoingsGroup &&
                      filteredOutgoingsGroup.length > 0 ? (
                        <>
                          {filteredOutgoingsGroup.map(
                            (outgoingGroupData, index) => {
                              return (
                                <OutgoingGroup
                                  outgoingGroupData={outgoingGroupData}
                                  reRender={reRender}
                                  setReRender={setReRender}
                                  setOpenedForm={setOpenedForm}
                                  getCurrencyExchangeRates={
                                    getCurrencyExchangeRates
                                  }
                                  selectedCurrency={selectedCurrency}
                                  key={index}
                                />
                              );
                            }
                          )}
                        </>
                      ) : (
                        <div className="no-result">
                          {t("financialTableNoOutgoings")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="financial-table__summary">
                <div className="financial-table__summary--income">
                  <div className="details">
                    {summedIncomeAmount?.HUF ? (
                      <div className="details--huf">
                        {summedIncomeAmount.HUF.toFixed(2)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                        HUF
                      </div>
                    ) : null}
                    {summedIncomeAmount?.EUR ? (
                      <div className="details--eur">
                        {summedIncomeAmount.EUR.toFixed(2)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                        EUR
                      </div>
                    ) : null}

                    {summedIncomeAmount?.USD ? (
                      <div className="details--usd">
                        {summedIncomeAmount.USD.toFixed(2)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                        USD
                      </div>
                    ) : null}
                  </div>
                  <div className="converted-details">
                    {t("financialTableIncomeSummary")}:{" "}
                    {convertedIncomeAmount
                      ? convertedIncomeAmount
                          .toFixed(2)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      : 0}{" "}
                    {selectedCurrency}
                  </div>
                </div>
                <div className="financial-table__summary--outgoing">
                  <div className="details">
                    {summedOutgoingAmount?.HUF ? (
                      <div className="details--huf">
                        {summedOutgoingAmount.HUF.toFixed(2)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                        HUF
                      </div>
                    ) : null}
                    {summedOutgoingAmount?.EUR ? (
                      <div className="details--eur">
                        {summedOutgoingAmount.EUR.toFixed(2)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                        EUR
                      </div>
                    ) : null}

                    {summedOutgoingAmount?.USD ? (
                      <div className="details--usd">
                        {summedOutgoingAmount.USD.toFixed(2)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                        USD
                      </div>
                    ) : null}
                  </div>
                  <div className="converted-details">
                    {t("financialTableOutgoingSummary")}:{" "}
                    {convertedOutgoingAmount
                      ? convertedOutgoingAmount
                          .toFixed(2)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      : 0}{" "}
                    {selectedCurrency}
                  </div>
                </div>
                <div className="financial-table__summary--controller">
                  <label htmlFor="currency-select">Select Currency:</label>
                  <select
                    id="currency-select"
                    value={selectedCurrency}
                    onChange={handleCurrencyChange}
                  >
                    <option value="HUF">HUF</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div className="financial-table__summary--total">
                  {t("financialTableTotalTitle")}:{" "}
                  {convertedIncomeAmount >= 0 && convertedOutgoingAmount >= 0
                    ? (
                        (convertedIncomeAmount ? convertedIncomeAmount : 0) -
                        (convertedOutgoingAmount ? convertedOutgoingAmount : 0)
                      )
                        .toFixed(2)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : 0}{" "}
                  {selectedCurrency}
                </div>
              </div>
              <div className="financial-table__overall-summary">
                {t("financialTableOverallTitle")}:{" "}
                {overallTotal
                  .toFixed(2)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                {selectedCurrency}
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
                <NewOutgoingGroupForm
                  financialTableUuid={urlParam}
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
                {t("financialTableShareTable")}:
              </div>
              <form onSubmit={shareTable}>
                <label htmlFor="email">
                  {t("financialTableShareTableEmailLabel")}
                </label>
                <input id="email" type="email" name="email" required />
                <button type="submit">
                  {t("financialTableShareTableSubmit")}
                </button>
              </form>
            </div>
          ) : null}
        </>
      ) : (
        <div className="fetching-in-progress">{t("financialTableLoading")}</div>
      )}
    </div>
  );
};

export default FinancialTable;
