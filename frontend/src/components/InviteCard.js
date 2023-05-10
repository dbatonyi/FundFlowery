import React, { useContext, useState } from "react";
import configData from "../../config";
import useTranslation from "next-translate/useTranslation";
import { AuthContext } from "@/layouts/Layout";

const InviteCard = ({ notificationsData, reRender, setReRender }) => {
  const { t } = useTranslation("inviteCard");
  const { setStatusMessage } = useContext(AuthContext);

  const acceptInvitation = async () => {
    try {
      const response = await fetch(
        `${configData.serverUrl}/api/accept-invitation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            invitationUuid: notificationsData.invitationTableUuid,
          }),
        }
      );
      const dataJson = await response.json();

      if (response.status === 200) {
        //TODO - Better status messages
        setReRender(!reRender);
      }
    } catch (error) {
      const log = await fetch(`${configData.serverUrl}/api/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authenticate: `Bearer ${configData.apiToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          log: error,
        }),
      });
      const data = await log.json();
      setStatusMessage(data.message);
    }
  };

  const deleteInvitation = async () => {
    try {
      const response = await fetch(
        `${configData.serverUrl}/api/delete-invitation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            invitationUuid: notificationsData.invitationTableUuid,
          }),
        }
      );
      const dataJson = await response.json();

      if (response.status === 200) {
        //TODO - Better status messages
        setReRender(!reRender);
      }
    } catch (error) {
      const log = await fetch(`${configData.serverUrl}/api/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authenticate: `Bearer ${configData.apiToken}`,
        },
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
    <div className="notification-card">
      <div className="notification-card--text">
        {notificationsData.name} {t("inviteCardText1")}{" "}
        {notificationsData.tableName} {t("inviteCardText2")}
      </div>
      <div className="notification-card--controllers">
        <div
          className="accept"
          onClick={() => {
            acceptInvitation();
          }}
        >
          +
        </div>
        <div
          className="decline"
          onClick={() => {
            deleteInvitation();
          }}
        >
          -
        </div>
      </div>
    </div>
  );
};

export default InviteCard;
