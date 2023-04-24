import React, { useContext, useState } from "react";
import configData from "../../config";
import { AuthContext } from "@/layouts/Layout";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const OutgoingCard = ({ outgoingData, reRender, setReRender }) => {
  const { setStatusMessage } = useContext(AuthContext);

  const [selectedDate, setSelectedDate] = useState(
    new Date(outgoingData[0].outgoingDate)
  );
  const [selectedCurrency, setSelectedCurrency] = useState(
    outgoingData[0].outgoingCurrency
  );

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const [isOnSaleChecked, setIsOnSaleChecked] = useState(
    outgoingData[0].outgoingOnSale
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
            outgoingId: outgoingData[0].outgoingId,
            outgoingTitle: outgoingTitle
              ? outgoingTitle
              : outgoingData[0].outgoingTitle,
            outgoingDate: selectedDate,
            outgoingAmount: outgoingAmount
              ? outgoingAmount
              : outgoingData[0].outgoingAmount,
            outgoingCurrency: selectedCurrency,
            outgoingCategory: outgoingCategory
              ? outgoingCategory
              : outgoingData[0].outgoingCategory,
            outgoingOrigin: outgoingOrigin
              ? outgoingOrigin
              : outgoingData[0].outgoingOrigin,
            outgoingLocation: outgoingLocation
              ? outgoingLocation
              : outgoingData[0].outgoingLocation,
            outgoingOnSale: isOnSaleChecked,
            description: description
              ? description
              : outgoingData[0].description,
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
            outgoingId: outgoingData[0].outgoingId,
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

  return (
    <>
      {outgoingData.map((item, index) => {
        const date = new Date(item.outgoingDate);
        const isoString = date.toISOString();
        const formattedDate = isoString.slice(0, 10);

        return (
          <div className="financial-table__outgoing-card" key={index}>
            {!showEditPopup && !showDeletePopup ? (
              <>
                <div className="financial-table__outgoing-card--container">
                  <div className="financial-table__outgoing-card--title">
                    {item.outgoingTitle}
                  </div>
                  <div className="financial-table__outgoing-card--amount">
                    {item.outgoingAmount}
                  </div>
                  <div className="financial-table__outgoing-card--date">
                    {formattedDate}
                  </div>
                  <div className="financial-table__outgoing-card--category">
                    {item.outgoingCategory}
                  </div>
                  <div className="financial-table__outgoing-card--origin">
                    {item.outgoingOrigin}
                  </div>
                  <div className="financial-table__outgoing-card--location">
                    {item.outgoingLocation}
                  </div>
                  <div className="financial-table__outgoing-card--on-sale">
                    It was on sale: {item.outgoingOnSale ? "Yes" : "No"}
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
                        placeholder={item.outgoingTitle}
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
                        placeholder={item.outgoingAmount}
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
                        placeholder={item.outgoingCategory}
                        name="outgoing-category"
                        type="text"
                      />
                    </div>
                    <div className="financial-table__outgoing-card--origin">
                      <label htmlFor="outgoing-origin">Origin:</label>
                      <input
                        className="text"
                        placeholder={item.outgoingOrigin}
                        name="outgoing-origin"
                        type="text"
                      />
                    </div>
                    <div className="financial-table__outgoing-card--location">
                      <label htmlFor="outgoing-location">Location:</label>
                      <input
                        className="text"
                        placeholder={item.outgoingLocation}
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
                        placeholder={item.description}
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
        );
      })}
    </>
  );
};

export default OutgoingCard;
