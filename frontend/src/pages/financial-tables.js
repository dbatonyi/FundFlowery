import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../layouts/Layout";

const configData = require("../../config");

const FinancialTable = (props) => {
  const { setStatusMessage, userInfo } = useContext(AuthContext);

  return (
    <div className="financial-table">
      <div className="financial-table__container">
        <h1>Financial Tables</h1>
        <div className="financial-table__container--text">
          The financial tables list goes here!
        </div>
      </div>
    </div>
  );
};

export default FinancialTable;
