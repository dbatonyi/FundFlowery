import React, { useContext, useEffect, useState } from "react";

const configData = require("@/config");

const Dashboard = (props) => {
  const { setStatusMessage, userInfo } = useContext(AuthContext);

  return (
    <div className="project-t-dashboard">
      <div className="project-t-dashboard__container">
        <h1>Dashboard</h1>
        <div className="project-t-dashboard__container--text">
          Lorem ipsum dolor set test text
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
