import React, { useContext, useState } from "react";
import configData from "../../config";
import { AuthContext } from "@/layouts/Layout";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useTranslation from "next-translate/useTranslation";

//TODO: Not working due to reorganisation of expenditure.
const OutgoingCard = ({ outgoingData, reRender, setReRender }) => {
  const { t } = useTranslation("outgoingCard");
  const { setStatusMessage } = useContext(AuthContext);

  const [selectedDate, setSelectedDate] = useState(
    new Date(outgoingData.outgoingDate)
  );
  const [selectedCurrency, setSelectedCurrency] = useState(
    outgoingData.outgoingCurrency
  );

  const [showMore, setShowMore] = useState(false);
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

      if (response.status === 200) {
        setStatusMessage(t("outgoingCardEditResponse"));
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

      if (response.status === 200) {
        setStatusMessage(t("outgoingCardDeleteResponse"));
        setShowDeletePopup(false);
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
              <div className="financial-table__outgoing-card--details">
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
              </div>
              <div
                className={`financial-table__income-card--dropdown${
                  showMore ? " opened" : ""
                }`}
              >
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
                  {t("outgoingCardIsOnSaleText")}:{" "}
                  {outgoingData.outgoingOnSale ? "Yes" : "No"}
                </div>
              </div>
            </div>
            <div className="financial-table__outgoing-card--controllers">
              <div
                className="financial-table__outgoing-card--show-more"
                onClick={() => {
                  setShowMore(!showMore);
                }}
              >
                {showMore
                  ? t("outgoingCardShowMoreText")
                  : t("outgoingCardShowLessText")}
              </div>
              <div
                className="financial-table__outgoing-card--edit"
                onClick={() => {
                  setShowEditPopup(true);
                }}
              >
                {t("outgoingCardEditTitle")}
              </div>
              <div
                className="financial-table__outgoing-card--delete"
                onClick={() => {
                  setShowDeletePopup(true);
                }}
              >
                {t("outgoingCardDeleteTitle")}
              </div>
            </div>
          </>
        ) : null}
        {showEditPopup && !showDeletePopup ? (
          <>
            <form onSubmit={editOutgoingCard}>
              <div className="financial-table__outgoing-card--container">
                <div className="financial-table__outgoing-card--title">
                  <label htmlFor="outgoing-title">
                    {t("outgoingCardEditTitleLabel")}:
                  </label>
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
                  <label htmlFor="outgoing-amount">
                    {t("outgoingCardEditAmountLabel")}:
                  </label>
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
                    <option value="">
                      {t("outgoingCardEditSelectOptionTitle")}
                    </option>
                    <option value="HUF">
                      {t("outgoingCardEditSelectHUF")}
                    </option>
                    <option value="EUR">
                      {t("outgoingCardEditSelectEUR")}
                    </option>
                    <option value="USD">
                      {t("outgoingCardEditSelectUSD")}
                    </option>
                  </select>
                </div>
                <div className="financial-table__outgoing-card--category">
                  <label htmlFor="outgoing-category">
                    {t("outgoingCardEditCategoryLabel")}:
                  </label>
                  <input
                    className="text"
                    placeholder={outgoingData.outgoingCategory}
                    name="outgoing-category"
                    type="text"
                  />
                </div>
                <div className="financial-table__outgoing-card--origin">
                  <label htmlFor="outgoing-origin">
                    {t("outgoingCardEditOriginLabel")}:
                  </label>
                  <input
                    className="text"
                    placeholder={outgoingData.outgoingOrigin}
                    name="outgoing-origin"
                    type="text"
                  />
                </div>
                <div className="financial-table__outgoing-card--location">
                  <label htmlFor="outgoing-location">
                    {t("outgoingCardEditLocationLabel")}:
                  </label>
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
                    {t("outgoingCardEditOnSaleLabel")}
                  </label>
                </div>
                <div className="financial-table__outgoing-card--description">
                  <label htmlFor="outgoing-desc">
                    {t("outgoingCardEditDescriptionLabel")}:
                  </label>
                  <input
                    className="text"
                    placeholder={outgoingData.description}
                    name="outgoing-desc"
                    type="text"
                  />
                </div>
                <button className="btn" type="submit">
                  {t("outgoingCardEditSubmit")}
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
              {t("outgoingCardDeleteText")}
            </div>
            <div className="income-card__popup--controllers">
              <div
                className="cancel"
                onClick={() => {
                  setShowDeletePopup(false);
                }}
              >
                {t("outgoingCardDeleteNo")}
              </div>
              <div
                className="accept"
                onClick={() => {
                  deleteOutgoingItem();
                }}
              >
                {t("outgoingCardDeleteYes")}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default OutgoingCard;
