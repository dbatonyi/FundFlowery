import React, { useContext } from "react";
import configData from "../../config";
import { AuthContext } from "@/layouts/Layout";

const IncomeCard = ({ incomeData, reRender, setReRender }) => {
  const { setStatusMessage } = useContext(AuthContext);

  return (
    <>
      {incomeData.map((item, index) => {
        const date = new Date(item.incomeDate);
        const isoString = date.toISOString();
        const formattedDate = isoString.slice(0, 10);

        return (
          <div className="financial-table__income-card" key={index}>
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
              <div className="financial-table__income-card--delete">Delete</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default IncomeCard;
