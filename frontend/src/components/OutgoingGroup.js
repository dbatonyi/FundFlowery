import React, { useContext, useState } from "react";
import configData from "../../config";
import { AuthContext } from "@/layouts/Layout";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
//import useTranslation from "next-translate/useTranslation";

const OutgoingGroup = ({ outgoingGroupData, reRender, setReRender }) => {
  //TODO: Add translations
  //const { t } = useTranslation("outgoingGroup");
  const { setStatusMessage } = useContext(AuthContext);

  const [selectedDate, setSelectedDate] = useState(
    outgoingGroupData.outgoingsGroupDate
  );

  const [showMore, setShowMore] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const editOutgoingGroup = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const outgoingTitle = formData.get("outgoing-title");

    try {
      const response = await fetch(
        `${configData.serverUrl}/api/edit-outgoing-group`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            outgoingGroupId: outgoingGroupData.uuid,
            outgoingGroupTitle: outgoingGroupData.outgoingGroupTitle
              ? outgoingTitle
              : outgoingGroupData.outgoingTitle,
            outgoingDate: selectedDate,
          }),
        }
      );

      if (response.status === 200) {
        setStatusMessage("Outgoing group edited");
        setReRender(!reRender);
        setShowEditPopup(false);
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

  const deleteOutgoingGroup = async () => {
    try {
      const response = await fetch(
        `${configData.serverUrl}/api/delete-outgoing-group`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            outgoingId: outgoingData.outgoingId,
          }),
        }
      );

      if (response.status === 200) {
        setStatusMessage("Outgoing group deleted");
        setShowDeletePopup(false);
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

  const date = new Date(outgoingGroupData.outgoingDate);
  const isoString = date.toISOString();
  const formattedDate = isoString.slice(0, 10);

  return (
    <>
      <div className="financial-table__outgoing-group">
        {!showEditPopup && !showDeletePopup ? (
          <>
            <div className="financial-table__outgoing-group--container">
              <div className="financial-table__outgoing-group--details">
                <div className="financial-table__outgoing-group--title">
                  {outgoingGroupData.outgoingTitle}
                </div>
                <div className="financial-table__outgoing-group--date">
                  {formattedDate}
                </div>
              </div>
              <div
                className={`financial-table__income-group--dropdown${
                  showMore ? " opened" : ""
                }`}
              ></div>
            </div>
            <div className="financial-table__outgoing-group--controllers">
              <div
                className="financial-table__outgoing-group--show-more"
                onClick={() => {
                  setShowMore(!showMore);
                }}
              >
                {showMore ? "Show more" : "Show less"}
              </div>
              <div
                className="financial-table__outgoing-group--edit"
                onClick={() => {
                  setShowEditPopup(true);
                }}
              >
                Edit group
              </div>
              <div
                className="financial-table__outgoing-group--delete"
                onClick={() => {
                  setShowDeletePopup(true);
                }}
              >
                Delete group
              </div>
            </div>
          </>
        ) : null}
        {showEditPopup && !showDeletePopup ? (
          <>
            <form onSubmit={editOutgoingGroup}>
              <div className="financial-table__outgoing-group--container">
                <div className="financial-table__outgoing-group--title">
                  <label htmlFor="outgoing-group-title">
                    Outgoing group title:
                  </label>
                  <input
                    className="text"
                    placeholder={outgoingGroupData.outgoingTitle}
                    name="outgoing-group-title"
                    type="text"
                  />
                </div>
                <div className="financial-table__outgoing-group--date">
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select a date"
                  />
                </div>
                <button className="btn" type="submit">
                  Submit
                </button>
              </div>
            </form>
            <div
              className="edit-outgoing-group--close"
              onClick={() => {
                setShowEditPopup(false);
              }}
            >
              X
            </div>
          </>
        ) : null}
        {!showEditPopup && showDeletePopup ? (
          <div className="income-group__popup">
            <div className="income-group__popup--text">
              You will want to delete this item
            </div>
            <div className="income-group__popup--controllers">
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
                  deleteOutgoingGroup();
                }}
              >
                Yes
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default OutgoingGroup;