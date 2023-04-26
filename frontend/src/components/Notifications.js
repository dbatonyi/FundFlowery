import React, { useEffect, useState } from "react";
import configData from "../../config";

import InviteCard from "./InviteCard";

const Notifications = ({ userInfo, setStatusMessage }) => {
  const [reRender, setReRender] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const response = await fetch(
          `${configData.serverUrl}/api/get-invites-list`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authenticate: `Bearer ${configData.apiToken}`,
            },
            credentials: "include",
            body: JSON.stringify({
              userUuid: userInfo.uuid,
            }),
          }
        );
        const dataJson = await response.json();

        if (response.status === 200) {
          setNotifications(dataJson.data);
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

    fetchInvites();
  }, [reRender]);

  return (
    <div className="notifications">
      <div
        className="notification-controller"
        onClick={() => {
          setShowDropdown(!showDropdown);
        }}
      >
        Notification placeholder
      </div>
      {showDropdown ? (
        <div className="notifications-list">
          {notifications.length > 0 ? (
            <>
              {notifications.map((item, index) => (
                <InviteCard
                  notificationsData={item}
                  reRender={reRender}
                  setReRender={setReRender}
                  key={index}
                />
              ))}
            </>
          ) : (
            <div className="no-result">You have no notifications</div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Notifications;
