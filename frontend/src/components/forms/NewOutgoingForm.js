import React, { useContext, useState } from "react";
import configData from "../../../config";
import { AuthContext } from "@/layouts/Layout";

import "react-datepicker/dist/react-datepicker.css";
import useTranslation from "next-translate/useTranslation";

const NewOutgoingForm = ({
  outgoingGroupUuid,
  setShowAddPopup,
  reRender,
  setReRender,
}) => {
  const { t } = useTranslation("newOutgoingForm");
  const { setStatusMessage } = useContext(AuthContext);

  const [selectedCurrency, setSelectedCurrency] = useState("");

  const [isOnSaleChecked, setIsOnSaleChecked] = useState(false);

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
    const description = formData.get("description");

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
            outgoingTitle,
            outgoingAmount,
            outgoingCurrency: selectedCurrency,
            outgoingCategory: outgoingCategory.toLowerCase(),
            outgoingOrigin: outgoingOrigin.toLowerCase(),
            outgoingOnSale: isOnSaleChecked,
            description,
            outgoingGroupUuid,
          }),
        }
      );

      if (response.status === 200) {
        setStatusMessage(t("newOutgoingFormSubmittedResponse"));
        setReRender(!reRender);
        setShowAddPopup(null);
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
          setShowAddPopup(null);
        }}
      >
        X
      </div>
      <div className="new-outgoing-popup--title">
        {t("newOutgoingFormTitleText")}
      </div>
      <form onSubmit={submitHandler}>
        <fieldset>
          <label htmlFor="outgoing-title">
            {t("newOutgoingFormTitleLabel")}
          </label>
          <input className="text" name="outgoing-title" type="text" required />
        </fieldset>
        <fieldset>
          <label htmlFor="outgoing-amount">
            {t("newOutgoingFormAmountLabel")}
          </label>
          <input
            className="text"
            name="outgoing-amount"
            type="number"
            required
          />
        </fieldset>
        <fieldset>
          <label htmlFor="outgoing-select-currency">
            {t("newOutgoingFormCurrencyLabel")}
          </label>
          <select value={selectedCurrency} onChange={handleOptionChange}>
            <option value="">{t("newOutgoingFormSelectOptionTitle")}</option>
            <option value="HUF">{t("newOutgoingFormSelectHUF")}</option>
            <option value="EUR">{t("newOutgoingFormSelectEUR")}</option>
            <option value="USD">{t("newOutgoingFormSelectUSD")}</option>
          </select>
        </fieldset>
        <fieldset>
          <label htmlFor="outgoing-category">
            {t("newOutgoingFormCategoryLabel")}
          </label>
          <input
            className="text"
            name="outgoing-category"
            type="text"
            required
          />
        </fieldset>
        <fieldset>
          <label htmlFor="outgoing-origin">
            {t("newOutgoingFormOriginLabel")}
          </label>
          <input className="text" name="outgoing-origin" type="text" required />
        </fieldset>
        <fieldset className="custom-checkbox">
          <label>
            <input
              type="checkbox"
              checked={isOnSaleChecked}
              onChange={handleOnSaleCheckboxChange}
            />
            {t("newOutgoingFormOnSale")}
          </label>
        </fieldset>
        <fieldset>
          <label htmlFor="description">
            {t("newOutgoingFormDescriptionLabel")}
          </label>
          <input className="text" name="description" type="text" />
        </fieldset>
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
