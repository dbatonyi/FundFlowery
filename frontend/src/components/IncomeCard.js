import React, { useContext, useEffect, useState } from "react";
import configData from "../../config";
import { AuthContext } from "@/layouts/Layout";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const IncomeCard = ({ incomeData, reRender, setReRender }) => {
  const { setStatusMessage } = useContext(AuthContext);

  const [selectedDate, setSelectedDate] = useState(
    new Date(incomeData.incomeDate)
  );
  const [selectedCurrency, setSelectedCurrency] = useState(
    incomeData.incomeCurrency
  );

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

  useEffect(() => {
    console.log(showDeletePopup);
  }, [showDeletePopup]);

  const date = new Date(incomeData.incomeDate);
  const isoString = date.toISOString();
  const formattedDate = isoString.slice(0, 10);

  return (
    <>
      <div className="financial-table__income-card">
        {!showEditPopup && !showDeletePopup ? (
          <>
            <div className="financial-table__income-card--container">
              <div className="financial-table__income-card--title">
                {incomeData.incomeTitle}
              </div>
              <div className="financial-table__income-card--amount">
                {incomeData.incomeAmount} {incomeData.incomeCurrency}
              </div>
              <div className="financial-table__income-card--date">
                {formattedDate}
              </div>
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
            <div className="financial-table__income-card--controllers">
              <div
                className="financial-table__income-card--edit"
                onClick={() => {
                  setShowEditPopup(true);
                }}
              >
                Edit
              </div>
              <div
                className="financial-table__income-card--delete"
                onClick={() => {
                  setShowDeletePopup(true);
                }}
              >
                Delete
              </div>
            </div>
          </>
        ) : null}
        {showEditPopup && !showDeletePopup ? (
          <>
            <form onSubmit={editIncomeCard}>
              <div className="financial-table__income-card--container">
                <div className="financial-table__income-card--title">
                  <label htmlFor="income-title">Title</label>
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
                  <label htmlFor="income-amount">Amount:</label>
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
                    <option value="">Select an option</option>
                    <option value="HUF">HUF</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div className="financial-table__income-card--category">
                  <label htmlFor="income-category">Category:</label>
                  <input
                    className="text"
                    placeholder={incomeData.incomeCategory}
                    name="income-category"
                    type="text"
                  />
                </div>
                <div className="financial-table__income-card--origin">
                  <label htmlFor="income-origin">Origin:</label>
                  <input
                    className="text"
                    placeholder={incomeData.incomeOrigin}
                    name="income-origin"
                    type="text"
                  />
                </div>
                <div className="financial-table__income-card--description">
                  <label htmlFor="income-desc">Description:</label>
                  <input
                    className="text"
                    placeholder={incomeData.description}
                    name="income-desc"
                    type="text"
                  />
                </div>
                <button className="btn" type="submit">
                  Save
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
              You definitely want to delete this item
            </div>
            <div className="income-card__popup--controllers">
              <div
                className="cancel"
                onClick={() => {
                  setShowDeletePopup(false);
                }}
              >
                No
              </div>
              <div
                className="accept"
                onClick={() => {
                  deleteIncomeItem();
                }}
              >
                Yes
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default IncomeCard;
