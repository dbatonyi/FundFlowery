import React, { useContext, useState } from "react";
import configData from "../../config";
import { AuthContext } from "@/layouts/Layout";

const IncomeCard = ({ incomeData, reRender, setReRender }) => {
  const { setStatusMessage } = useContext(AuthContext);

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

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
            incomeId: incomeData[0].incomeId,
            incomeTitle,
            incomeAmount,
            incomeCategory,
            incomeOrigin,
            description,
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
        headers: { "Content-Type": "application/json" },
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
            incomeId: incomeData[0].incomeId,
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
        headers: { "Content-Type": "application/json" },
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
      {incomeData.map((item, index) => {
        const date = new Date(item.incomeDate);
        const isoString = date.toISOString();
        const formattedDate = isoString.slice(0, 10);

        return (
          <div className="financial-table__income-card" key={index}>
            {!showEditPopup && !showDeletePopup ? (
              <>
                <div className="financial-table__income-card--container">
                  <div className="financial-table__income-card--title">
                    {item.incomeTitle}
                  </div>
                  <div className="financial-table__income-card--amount">
                    {item.incomeAmount}
                  </div>
                  <div className="financial-table__income-card--date">
                    {formattedDate}
                  </div>
                  <div className="financial-table__income-card--category">
                    {item.incomeCategory}
                  </div>
                  <div className="financial-table__income-card--origin">
                    {item.incomeOrigin}
                  </div>
                  <div className="financial-table__income-card--description">
                    {item.description}
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
                        placeholder={item.incomeTitle}
                        name="income-title"
                        type="text"
                      />
                    </div>
                    <div className="financial-table__income-card--amount">
                      <label htmlFor="income-amount">Amount:</label>
                      <input
                        className="text"
                        placeholder={item.incomeAmount}
                        name="income-amount"
                        type="number"
                      />
                    </div>
                    <div className="financial-table__income-card--category">
                      <label htmlFor="income-category">Category:</label>
                      <input
                        className="text"
                        placeholder={item.incomeCategory}
                        name="income-category"
                        type="text"
                      />
                    </div>
                    <div className="financial-table__income-card--origin">
                      <label htmlFor="income-origin">Origin:</label>
                      <input
                        className="text"
                        placeholder={item.incomeOrigin}
                        name="income-origin"
                        type="text"
                      />
                    </div>
                    <div className="financial-table__income-card--description">
                      <label htmlFor="income-desc">Description:</label>
                      <input
                        className="text"
                        placeholder={item.description}
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
        );
      })}
    </>
  );
};

export default IncomeCard;
