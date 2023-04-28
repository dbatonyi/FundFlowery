import React, { useContext, useState } from "react";
import configData from "../../config";
import { AuthContext } from "@/layouts/Layout";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const OutgoingCard = ({ outgoingData, reRender, setReRender }) => {
  const { setStatusMessage } = useContext(AuthContext);

  const [selectedDate, setSelectedDate] = useState(
    new Date(outgoingData.outgoingDate)
  );
  const [selectedCurrency, setSelectedCurrency] = useState(
    outgoingData.outgoingCurrency
  );

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const [isOnSaleChecked, setIsOnSaleChecked] = useState(
    outgoingData.outgoingOnSale
  );

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleOptionChange = (event) => {
    setSelectedCurrency(event.target.value);
  };

  const handleOnSaleCheckboxChange = (event) => {
    setIsOnSaleChecked(event.target.checked);
  };

  const editOutgoingCard = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const outgoingTitle = formData.get("outgoing-title");
    const outgoingAmount = formData.get("outgoing-amount");
    const outgoingCategory = formData.get("outgoing-category");
    const outgoingOrigin = formData.get("outgoing-origin");
    const outgoingLocation = formData.get("outgoing-location");
    const description = formData.get("outgoing-desc");

    try {
      const response = await fetch(
        `${configData.serverUrl}/api/edit-outgoing-card`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            outgoingId: outgoingData.outgoingId,
            outgoingTitle: outgoingTitle
              ? outgoingTitle
              : outgoingData.outgoingTitle,
            outgoingDate: selectedDate,
            outgoingAmount: outgoingAmount
              ? outgoingAmount
              : outgoingData.outgoingAmount,
            outgoingCurrency: selectedCurrency,
            outgoingCategory: outgoingCategory
              ? outgoingCategory
              : outgoingData.outgoingCategory,
            outgoingOrigin: outgoingOrigin
              ? outgoingOrigin
              : outgoingData.outgoingOrigin,
            outgoingLocation: outgoingLocation
              ? outgoingLocation
              : outgoingData.outgoingLocation,
            outgoingOnSale: isOnSaleChecked,
            description: description ? description : outgoingData.description,
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

  const deleteOutgoingItem = async () => {
    try {
      const response = await fetch(
        `${configData.serverUrl}/api/delete-outgoing-item`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            outgoingId: outgoingData.outgoingId,
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

  const date = new Date(outgoingData.outgoingDate);
  const isoString = date.toISOString();
  const formattedDate = isoString.slice(0, 10);

  return (
    <>
      <div className="financial-table__outgoing-card">
        {!showEditPopup && !showDeletePopup ? (
          <>
            <div className="financial-table__outgoing-card--container">
              <div className="financial-table__outgoing-card--title">
                {outgoingData.outgoingTitle}
              </div>
              <div className="financial-table__outgoing-card--amount">
                {outgoingData.outgoingAmount
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                {outgoingData.outgoingCurrency}
              </div>
              <div className="financial-table__outgoing-card--date">
                {formattedDate}
              </div>
              <div className="financial-table__outgoing-card--category">
                {outgoingData.outgoingCategory}
              </div>
              <div className="financial-table__outgoing-card--origin">
                {outgoingData.outgoingOrigin}
              </div>
              <div className="financial-table__outgoing-card--location">
                {outgoingData.outgoingLocation}
              </div>
              <div className="financial-table__outgoing-card--on-sale">
                It was on sale: {outgoingData.outgoingOnSale ? "Yes" : "No"}
              </div>
            </div>
            <div className="financial-table__outgoing-card--controllers">
              <div
                className="financial-table__outgoing-card--edit"
                onClick={() => {
                  setShowEditPopup(true);
                }}
              >
                Edit
              </div>
              <div
                className="financial-table__outgoing-card--delete"
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
            <form onSubmit={editOutgoingCard}>
              <div className="financial-table__outgoing-card--container">
                <div className="financial-table__outgoing-card--title">
                  <label htmlFor="outgoing-title">Title</label>
                  <input
                    className="text"
                    placeholder={outgoingData.outgoingTitle}
                    name="outgoing-title"
                    type="text"
                  />
                </div>
                <div className="financial-table__outgoing-card--date">
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select a date"
                  />
                </div>
                <div className="financial-table__outgoing-card--amount">
                  <label htmlFor="outgoing-amount">Amount:</label>
                  <input
                    className="text"
                    placeholder={outgoingData.outgoingAmount}
                    name="outgoing-amount"
                    type="number"
                  />
                </div>
                <div className="financial-table__outgoing-card--currency">
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
                <div className="financial-table__outgoing-card--category">
                  <label htmlFor="outgoing-category">Category:</label>
                  <input
                    className="text"
                    placeholder={outgoingData.outgoingCategory}
                    name="outgoing-category"
                    type="text"
                  />
                </div>
                <div className="financial-table__outgoing-card--origin">
                  <label htmlFor="outgoing-origin">Origin:</label>
                  <input
                    className="text"
                    placeholder={outgoingData.outgoingOrigin}
                    name="outgoing-origin"
                    type="text"
                  />
                </div>
                <div className="financial-table__outgoing-card--location">
                  <label htmlFor="outgoing-location">Location:</label>
                  <input
                    className="text"
                    placeholder={outgoingData.outgoingLocation}
                    name="outgoing-location"
                    type="text"
                  />
                </div>
                <div className="financial-table__outgoing-card--on-sale">
                  <label>
                    <input
                      type="checkbox"
                      checked={isOnSaleChecked}
                      onChange={handleOnSaleCheckboxChange}
                    />
                    On Sale
                  </label>
                </div>
                <div className="financial-table__outgoing-card--description">
                  <label htmlFor="outgoing-desc">Description:</label>
                  <input
                    className="text"
                    placeholder={outgoingData.description}
                    name="outgoing-desc"
                    type="text"
                  />
                </div>
                <button className="btn" type="submit">
                  Save
                </button>
              </div>
            </form>
            <div
              className="edit-outgoing-card--close"
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
                  deleteOutgoingItem();
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

export default OutgoingCard;