import React, { useContext, useState } from "react";
import configData from "../../config";
import { AuthContext } from "@/layouts/Layout";

const InviteCard = ({ notificationsData }) => {
  const { setStatusMessage, userInfo } = useContext(AuthContext);

  console.log(notificationsData);

  return (
    <div className="notification-card">
      <div className="notification-card--text">
        {notificationsData.name} invited you to join{" "}
        {notificationsData.tableName} table
      </div>
      <div className="notification-card--controllers">
        <div className="accept">+</div>
        <div className="decline">-</div>
      </div>
    </div>
  );
};

export default InviteCard;
