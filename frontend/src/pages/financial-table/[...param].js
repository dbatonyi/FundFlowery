import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import useTranslation from "next-translate/useTranslation";
import { AuthContext } from "../../layouts/Layout";
import NewIncomeForm from "@/components/forms/NewIncomeForm";
import NewOutgoingForm from "@/components/forms/NewOutgoingForm";
import IncomeCard from "@/components/IncomeCard";
import OutgoingCard from "@/components/OutgoingCard";
import YearPicker from "@/components/YearPicker";
import MonthPicker from "@/components/MonthPicker";
import CurrencyRatesTable from "@/components/CurrencyRatesTable";

const configData = require("../../../config");

const FinancialTable = () => {
  const router = useRouter();
  const urlParam = router.query.param;

  const currentDate = new Date();
  const monthNumber = (currentDate.getMonth() + 1).toString().padStart(2, "0");

  const { setStatusMessage, userInfo } = useContext(AuthContext);

  const [permission, setPermission] = useState(false);
  const [permissionLevel, setPermissionLevel] = useState(null);

  const [tableData, setTableData] = useState(null);

  const [incomes, setIncomes] = useState(null);
  const [summedIncomeAmount, setSummedIncomeAmount] = useState(null);
  const [convertedIncomeAmount, setConvertedIncomeAmount] = useState(null);
  const [filteredIncomes, setFilteredIncomes] = useState(null);

  const [outgoings, setOutgoings] = useState(null);
  const [summedOutgoingAmount, setSummedOutgoingAmount] = useState(null);
  const [convertedOutgoingAmount, setConvertedOutgoingAmount] = useState(null);
  const [filteredOutgoings, setFilteredOutgoings] = useState(null);

  const [currencyRates, setCurrencyRates] = useState(null);
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

    summaryController(event.target.value, filteredIncomes, filteredOutgoings);
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
        setOutgoings(dataJson.data[0].outgoings);

        overallTotalSummary(
          selectedCurrency,
          dataJson.data[0].incomes,
          dataJson.data[0].outgoings
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

        const filteredOutgoingsArray = dataJson.data[0].outgoings.filter(
          (outgoing) => {
            const outgoingDate = new Date(outgoing.outgoingDate);
            const outgoingYear = outgoingDate.getFullYear();
            const outgoingMonthNumber = (outgoingDate.getMonth() + 1)
              .toString()
              .padStart(2, "0");

            return (
              outgoingYear === Number(selectedYear) &&
              outgoingMonthNumber === selectedMonth
            );
          }
        );

        setFilteredOutgoings(filteredOutgoingsArray);
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
    const outgoingAmounts = await sumOutgoingAmounts(outgoingsData);

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

    setConvertedIncomeAmount(sumIncAmount[selectedCurrency]);
    setConvertedOutgoingAmount(sumOutAmount[selectedCurrency]);
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
    const outgoingAmounts = await sumOutgoingAmounts(outgoingsData);

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

    if (outgoings) {
      const filteredOutgoingsArray = outgoings.filter((outgoing) => {
        const outgoingDate = new Date(outgoing.outgoingDate);
        const outgoingYear = outgoingDate.getFullYear();
        const outgoingMonthNumber = (outgoingDate.getMonth() + 1)
          .toString()
          .padStart(2, "0");

        return (
          outgoingYear === Number(selectedYear) &&
          outgoingMonthNumber === selectedMonth
        );
      });

      setFilteredOutgoings(filteredOutgoingsArray);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (filteredIncomes && filteredOutgoings) {
      summaryController(selectedCurrency, filteredIncomes, filteredOutgoings);
    }
  }, [filteredIncomes, filteredOutgoings]);

  return (
    <div className="financial-table">
      {permission ? (
        <>
          {tableData ? (
            <>
              <div className="financial-table">
                <div className="financial-table__main">
                  <div className="financial-table__main--title">
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
                    className="financial-table--share"
                    onClick={() => {
                      setIsSharePopupOpened(true);
                    }}
                  >
                    Share with others
                  </div>
                  <div className="financial-table__main--date-pick">
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
                  <div className="financial-table__main--controllers">
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
                  <div className="financial-table__main--list">
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

                <div className="financial-table__sidebar">
                  {currencyRates ? (
                    <CurrencyRatesTable currencyRates={currencyRates} />
                  ) : null}
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
                    Your income summary is:{" "}
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
                    Your outgoings summary is:{" "}
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
                  Total:{" "}
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
                Overall summary:{" "}
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
