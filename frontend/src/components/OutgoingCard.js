import React, { useContext } from "react";
import configData from "../../config";
import { AuthContext } from "@/layouts/Layout";

const OutgoingCard = ({ outgoingData, reRender, setReRender }) => {
  const { setStatusMessage } = useContext(AuthContext);

  return (
    <>
      {outgoingData.map((item, index) => {
        const date = new Date(item.outgoingDate);
        const isoString = date.toISOString();
        const formattedDate = isoString.slice(0, 10);

        return (
          <div className="financial-table__outgoing-card" key={index}>
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
              <div className="financial-table__outgoing-card--edit">Edit</div>
              <div className="financial-table__outgoing-card--delete">
                Delete
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default OutgoingCard;
