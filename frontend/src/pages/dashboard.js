import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../layouts/Layout";
import useTranslation from "next-translate/useTranslation";

const configData = require("../../config");

const Dashboard = (props) => {
  const { t } = useTranslation("dashboard");
  const { setStatusMessage, userInfo } = useContext(AuthContext);

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        <h1>{t("dashboardTitle")}</h1>
        <div className="dashboard__container--text">
          Lorem ipsum dolor set test text
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
