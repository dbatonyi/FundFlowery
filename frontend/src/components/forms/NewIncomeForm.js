import React, { useContext, useState } from "react";
import configData from "../../../config";
import { AuthContext } from "@/layouts/Layout";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const NewIncomeForm = ({ tableUuid, setOpenedForm, reRender, setReRender }) => {
  const { setStatusMessage } = useContext(AuthContext);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("");

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleOptionChange = (event) => {
    setSelectedCurrency(event.target.value);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const incomeTitle = formData.get("income-title");
    const incomeAmount = formData.get("income-amount");
    const incomeCategory = formData.get("income-category");
    const incomeOrigin = formData.get("income-origin");
    const description = formData.get("description");

    try {
      const response = await fetch(
        `${configData.serverUrl}/api/create-new-income-item`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            incomeDate: selectedDate,
            incomeTitle,
            incomeAmount,
            incomeCurrency: selectedCurrency,
            incomeCategory: incomeCategory.toLowerCase(),
            incomeOrigin: incomeOrigin.toLowerCase(),
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
    <div className="new-income-popup">
      <div
        className="new-income-popup--close"
        onClick={() => {
          setOpenedForm(null);
        }}
      >
        X
      </div>
      <div className="new-income-popup--title">Add new income item</div>
      <form onSubmit={submitHandler}>
        <label htmlFor="income-title">Income title</label>
        <input className="text" name="income-title" type="text" required />
        <div className="new-income-popup--date">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select a date"
          />
        </div>
        <label htmlFor="income-amount">Income amount</label>
        <input className="text" name="income-amount" type="number" required />
        <select value={selectedCurrency} onChange={handleOptionChange}>
          <option value="">Select an option</option>
          <option value="HUF">HUF</option>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
        </select>
        <label htmlFor="income-category">Income category</label>
        <input className="text" name="income-category" type="text" required />
        <label htmlFor="income-origin">Income origin</label>
        <input className="text" name="income-origin" type="text" required />
        <label htmlFor="description">Description</label>
        <input className="text" name="description" type="text" />
        <div className="submit-btn">
          <button className="btn" type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewIncomeForm;
