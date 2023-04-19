import React, { useContext } from "react";
import configData from "../../../config";
import { AuthContext } from "@/layouts/Layout";

const NewIncomeForm = ({ tableUuid, setOpenedForm, reRender, setReRender }) => {
  const { setStatusMessage } = useContext(AuthContext);

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const currentDate = new Date();
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
            incomeDate: currentDate,
            incomeTitle,
            incomeAmount,
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
        <label htmlFor="income-amount">Income amount</label>
        <input className="text" name="income-amount" type="number" required />
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
