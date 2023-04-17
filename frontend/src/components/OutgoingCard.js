import React, { useContext, useState } from "react";
import configData from "../../config";
import { AuthContext } from "@/layouts/Layout";

const OutgoingCard = ({ outgoingData, reRender, setReRender }) => {
  const { setStatusMessage } = useContext(AuthContext);

  const [showDeletePopup, setShowDeletePopup] = useState(false);

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
      {outgoingData.map((item, index) => {
        const date = new Date(item.outgoingDate);
        const isoString = date.toISOString();
        const formattedDate = isoString.slice(0, 10);

        return (
          <div className="financial-table__outgoing-card" key={index}>
            {!showDeletePopup ? (
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
                </div>
                <div className="financial-table__outgoing-card--controllers">
                  <div className="financial-table__outgoing-card--edit">
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
                      deleteOutgoingItem();
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

export default OutgoingCard;
