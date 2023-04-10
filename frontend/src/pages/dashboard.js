import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../layouts/Layout";

const configData = require("../../config");

const Dashboard = (props) => {
  const { setStatusMessage, userInfo } = useContext(AuthContext);

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        <h1>Dashboard</h1>
        <div className="dashboard__container--text">
          Lorem ipsum dolor set test text
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
