import React, { useContext, useState } from "react";
import configData from "../../config";
import { AuthContext } from "@/layouts/Layout";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useTranslation from "next-translate/useTranslation";

const IncomeCard = ({ incomeData, reRender, setReRender }) => {
  const { t } = useTranslation("incomeCard");
  const { setStatusMessage } = useContext(AuthContext);

  const [selectedDate, setSelectedDate] = useState(
    new Date(incomeData.incomeDate)
  );
  const [selectedCurrency, setSelectedCurrency] = useState(
    incomeData.incomeCurrency
  );

  const [showMore, setShowMore] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleOptionChange = (event) => {
    setSelectedCurrency(event.target.value);
  };

  const editIncomeCard = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const incomeTitle = formData.get("income-title");
    const incomeAmount = formData.get("income-amount");
    const incomeCategory = formData.get("income-category");
    const incomeOrigin = formData.get("income-origin");
    const description = formData.get("income-desc");

    try {
      const response = await fetch(
        `${configData.serverUrl}/api/edit-income-card`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            incomeId: incomeData.incomeId,
            incomeTitle: incomeTitle ? incomeTitle : incomeData.incomeTitle,
            incomeDate: selectedDate,
            incomeAmount: incomeAmount ? incomeAmount : incomeData.incomeAmount,
            incomeCurrency: selectedCurrency,
            incomeCategory: incomeCategory
              ? incomeCategory
              : incomeData.incomeCategory,
            incomeOrigin: incomeOrigin ? incomeOrigin : incomeData.incomeOrigin,
            description: description ? description : incomeData.description,
          }),
        }
      );

      const dataJson = await response.json();

      if (response.status === 200) {
        setStatusMessage(dataJson.message);
        setReRender(!reRender);
        setShowEditPopup(false);
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

  const deleteIncomeItem = async () => {
    try {
      const response = await fetch(
        `${configData.serverUrl}/api/delete-income-item`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            incomeId: incomeData.incomeId,
          }),
        }
      );
      const dataJson = await response.json();

      if (response.status === 200) {
        setShowDeletePopup(false);
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

  const date = new Date(incomeData.incomeDate);
  const isoString = date.toISOString();
  const formattedDate = isoString.slice(0, 10);

  return (
    <>
      <div className="financial-table__income-card">
        {!showEditPopup && !showDeletePopup ? (
          <>
            <div className="financial-table__income-card--container">
              <div className="financial-table__income-card--details">
                <div className="financial-table__income-card--title">
                  {incomeData.incomeTitle}
                </div>
                <div className="financial-table__income-card--amount">
                  {incomeData.incomeAmount
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                  {incomeData.incomeCurrency}
                </div>
                <div className="financial-table__income-card--date">
                  {formattedDate}
                </div>
              </div>
              <div
                className={`financial-table__income-card--dropdown${
                  showMore ? " opened" : ""
                }`}
              >
                <div className="financial-table__income-card--category">
                  {incomeData.incomeCategory}
                </div>
                <div className="financial-table__income-card--origin">
                  {incomeData.incomeOrigin}
                </div>
                <div className="financial-table__income-card--description">
                  {incomeData.description}
                </div>
              </div>
            </div>
            <div className="financial-table__income-card--controllers">
              <div
                className="financial-table__income-card--show-more"
                onClick={() => {
                  setShowMore(!showMore);
                }}
              >
                {showMore
                  ? t("incomeCardShowMoreText")
                  : t("incomeCardShowLessText")}
              </div>
              <div
                className="financial-table__income-card--edit"
                onClick={() => {
                  setShowEditPopup(true);
                }}
              >
                {t("incomeCardEditTitle")}
              </div>
              <div
                className="financial-table__income-card--delete"
                onClick={() => {
                  setShowDeletePopup(true);
                }}
              >
                {t("incomeCardDeleteTitle")}
              </div>
            </div>
          </>
        ) : null}
        {showEditPopup && !showDeletePopup ? (
          <>
            <form onSubmit={editIncomeCard}>
              <div className="financial-table__income-card--container">
                <div className="financial-table__income-card--title">
                  <label htmlFor="income-title">
                    {t("incomeCardEditTitleLabel")}:
                  </label>
                  <input
                    className="text"
                    placeholder={incomeData.incomeTitle}
                    name="income-title"
                    type="text"
                  />
                </div>
                <div className="financial-table__income-card--date">
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select a date"
                  />
                </div>
                <div className="financial-table__income-card--amount">
                  <label htmlFor="income-amount">
                    {t("incomeCardEditAmountLabel")}:
                  </label>
                  <input
                    className="text"
                    placeholder={incomeData.incomeAmount}
                    name="income-amount"
                    type="number"
                  />
                </div>
                <div className="financial-table__income-card--currency">
                  <select
                    value={selectedCurrency}
                    onChange={handleOptionChange}
                  >
                    <option value="">
                      {t("incomeCardEditSelectOptionTitle")}
                    </option>
                    <option value="HUF">{t("incomeCardEditSelectHUF")}</option>
                    <option value="EUR">{t("incomeCardEditSelectEUR")}</option>
                    <option value="USD">{t("incomeCardEditSelectUSD")}</option>
                  </select>
                </div>
                <div className="financial-table__income-card--category">
                  <label htmlFor="income-category">
                    {t("incomeCardEditCategoryLabel")}:
                  </label>
                  <input
                    className="text"
                    placeholder={incomeData.incomeCategory}
                    name="income-category"
                    type="text"
                  />
                </div>
                <div className="financial-table__income-card--origin">
                  <label htmlFor="income-origin">
                    {t("incomeCardEditOriginLabel")}:
                  </label>
                  <input
                    className="text"
                    placeholder={incomeData.incomeOrigin}
                    name="income-origin"
                    type="text"
                  />
                </div>
                <div className="financial-table__income-card--description">
                  <label htmlFor="income-desc">
                    {t("incomeCardEditDescriptionLabel")}:
                  </label>
                  <input
                    className="text"
                    placeholder={incomeData.description}
                    name="income-desc"
                    type="text"
                  />
                </div>
                <button className="btn" type="submit">
                  {t("incomeCardEditSubmit")}
                </button>
              </div>
            </form>
            <div
              className="edit-income-card--close"
              onClick={() => {
                setShowEditPopup(false);
              }}
            >
              X
            </div>
          </>
        ) : null}
        {!showEditPopup && showDeletePopup ? (
          <div className="income-card__popup">
            <div className="income-card__popup--text">
              {t("incomeCardDeleteText")}
            </div>
            <div className="income-card__popup--controllers">
              <div
                className="cancel"
                onClick={() => {
                  setShowDeletePopup(false);
                }}
              >
                {t("incomeCardDeleteNo")}
              </div>
              <div
                className="accept"
                onClick={() => {
                  deleteIncomeItem();
                }}
              >
                {t("incomeCardDeleteYes")}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default IncomeCard;
