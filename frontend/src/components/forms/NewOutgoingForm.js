import React, { useContext, useState } from "react";
import configData from "../../../config";
import { AuthContext } from "@/layouts/Layout";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useTranslation from "next-translate/useTranslation";

const NewOutgoingForm = ({
  tableUuid,
  setOpenedForm,
  reRender,
  setReRender,
}) => {
  const { t } = useTranslation("newOutgoingForm");
  const { setStatusMessage } = useContext(AuthContext);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("");

  const [isOnSaleChecked, setIsOnSaleChecked] = useState(false);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleOptionChange = (event) => {
    setSelectedCurrency(event.target.value);
  };

  const handleOnSaleCheckboxChange = (event) => {
    setIsOnSaleChecked(event.target.checked);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const outgoingTitle = formData.get("outgoing-title");
    const outgoingAmount = formData.get("outgoing-amount");
    const outgoingCategory = formData.get("outgoing-category");
    const outgoingOrigin = formData.get("outgoing-origin");
    const outgoingLocation = formData.get("outgoing-location");
    const description = formData.get("description");

    if (!selectedDate) {
      return;
    }

    try {
      const response = await fetch(
        `${configData.serverUrl}/api/create-new-outgoing-item`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            outgoingDate: selectedDate,
            outgoingTitle,
            outgoingAmount,
            outgoingCurrency: selectedCurrency,
            outgoingCategory: outgoingCategory.toLowerCase(),
            outgoingOrigin: outgoingOrigin.toLowerCase(),
            outgoingLocation: outgoingLocation.toLowerCase(),
            outgoingOnSale: isOnSaleChecked,
            description,
            tableUuid,
          }),
        }
      );

      const dataJson = await response.json();

      if (response.status === 200) {
        setStatusMessage(dataJson.message);
        setReRender(!reRender);
        setOpenedForm(null);
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
    <div className="new-outgoing-popup">
      <div
        className="new-outgoing-popup--close"
        onClick={() => {
          setOpenedForm(null);
        }}
      >
        X
      </div>
      <div className="new-outgoing-popup--title">
        {t("newOutgoingFormTitleText")}
      </div>
      <form onSubmit={submitHandler}>
        <label htmlFor="outgoing-title">{t("newOutgoingFormTitleLabel")}</label>
        <input className="text" name="outgoing-title" type="text" required />
        <div className="new-outgoing-popup--date">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            placeholderText={t("newOutgoingFormSelectDate")}
          />
        </div>
        <label htmlFor="outgoing-amount">
          {t("newOutgoingFormAmountLabel")}
        </label>
        <input className="text" name="outgoing-amount" type="number" required />
        <select value={selectedCurrency} onChange={handleOptionChange}>
          <option value="">{t("newOutgoingFormSelectOptionTitle")}</option>
          <option value="HUF">{t("newOutgoingFormSelectHUF")}</option>
          <option value="EUR">{t("newOutgoingFormSelectEUR")}</option>
          <option value="USD">{t("newOutgoingFormSelectUSD")}</option>
        </select>
        <label htmlFor="outgoing-category">
          {t("newOutgoingFormCategoryLabel")}
        </label>
        <input className="text" name="outgoing-category" type="text" required />
        <label htmlFor="outgoing-origin">
          {t("newOutgoingFormOriginLabel")}
        </label>
        <input className="text" name="outgoing-origin" type="text" required />
        <label htmlFor="outgoing-location">
          {t("newOutgoingFormLocationLabel")}
        </label>
        <input className="text" name="outgoing-location" type="text" />
        <label>
          <input
            type="checkbox"
            checked={isOnSaleChecked}
            onChange={handleOnSaleCheckboxChange}
          />
          {t("newOutgoingFormOnSale")}
        </label>
        <label htmlFor="description">
          {t("newOutgoingFormDescriptionLabel")}
        </label>
        <input className="text" name="description" type="text" />
        <div className="submit-btn">
          <button className="btn" type="submit">
            {t("newOutgoingFormSubmit")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewOutgoingForm;
