import React, { useContext, useState } from "react";
import configData from "../../../config";
import { AuthContext } from "@/layouts/Layout";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useTranslation from "next-translate/useTranslation";

const NewOutgoingGroupForm = ({
  financialTableUuid,
  setOpenedForm,
  reRender,
  setReRender,
}) => {
  const { t } = useTranslation("newOutgoingGroupForm");
  const { setStatusMessage } = useContext(AuthContext);

  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const outgoingsGroupTitle = formData.get("outgoing-group-title");

    if (!selectedDate) {
      return;
    }

    try {
      const response = await fetch(
        `${configData.serverUrl}/api/create-new-outgoing-group-item`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            outgoingsGroupTitle,
            outgoingsGroupDate: selectedDate,
            financialTableId: financialTableUuid,
          }),
        }
      );

      if (response.status === 200) {
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
        {t("newOutgoingGroupFormTitle")}
      </div>
      <form onSubmit={submitHandler}>
        <label htmlFor="outgoing-group-title">
          {t("newOutgoingGroupFormNameLabel")}
        </label>
        <input
          className="text"
          name="outgoing-group-title"
          type="text"
          required
        />
        <div className="new-outgoing-popup--date">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            placeholderText="Outgoing group date"
          />
        </div>
        <div className="submit-btn">
          <button className="btn" type="submit">
            {t("newOutgoingGroupFormSubmit")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewOutgoingGroupForm;
