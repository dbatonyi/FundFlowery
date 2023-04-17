import React, { useContext, useState } from "react";
import configData from "../../config";
import { AuthContext } from "@/layouts/Layout";

const IncomeCard = ({ incomeData, reRender, setReRender }) => {
  const { setStatusMessage } = useContext(AuthContext);

  const [showDeletePopup, setShowDeletePopup] = useState(false);

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
            {!showDeletePopup ? (
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
                </div>
                <div className="financial-table__income-card--controllers">
                  <div className="financial-table__income-card--edit">Edit</div>
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
            ) : (
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
            )}
          </div>
        );
      })}
    </>
  );
};

export default IncomeCard;
