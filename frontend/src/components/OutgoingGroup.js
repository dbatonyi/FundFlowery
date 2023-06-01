import React, { useContext, useState } from "react";
import configData from "../../config";
import { AuthContext } from "@/layouts/Layout";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useTranslation from "next-translate/useTranslation";

import NewOutgoingForm from "./forms/NewOutgoingForm";

const OutgoingGroup = ({
  outgoingGroupData,
  setOpenedForm,
  reRender,
  setReRender,
}) => {
  const { t } = useTranslation("outgoingGroup");
  const { setStatusMessage } = useContext(AuthContext);

  console.log(outgoingGroupData);
  const [selectedDate, setSelectedDate] = useState(
    outgoingGroupData.outgoingsGroupDate
  );

  const [showMore, setShowMore] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const [showAddPopup, setShowAddPopup] = useState(false);

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

  const date = new Date(outgoingGroupData.outgoingsGroupDate);
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
                  {outgoingGroupData.outgoingsGroupTitle}
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
                {showMore
                  ? t("outgoingGroupShowMore")
                  : t("outgoingGroupShowLess")}
              </div>
              <div
                className="financial-table__outgoing-group--edit"
                onClick={() => {
                  setShowEditPopup(true);
                }}
              >
                {t("outgoingGroupEditGroup")}
              </div>
              <div
                className="financial-table__outgoing-group--delete"
                onClick={() => {
                  setShowDeletePopup(true);
                }}
              >
                {t("outgoingGroupDeleteGroup")}
              </div>
              <div
                className="financial-table__outgoing-group--add"
                onClick={() => {
                  setShowAddPopup(true);
                }}
              >
                {t("outgoingGroupAddOutgoing")}
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
                    {t("outgoingGroupTitleLabel")}:
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
                    placeholderText={t("outgoingGroupSelectDate")}
                  />
                </div>
                <button className="btn" type="submit">
                  {t("outgoingGroupSubmit")}
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
          <div className="outgoing-group__popup">
            <div className="outgoing-group__popup--text">
              {t("outgoingGroupDeleteText")}
            </div>
            <div className="outgoing-group__popup--controllers">
              <div
                className="cancel"
                onClick={() => {
                  setShowDeletePopup(false);
                }}
              >
                {t("outgoingGroupDeleteNo")}
              </div>
              <div
                className="accept"
                onClick={() => {
                  deleteOutgoingGroup();
                }}
              >
                {t("outgoingGroupDeleteYes")}
              </div>
            </div>
          </div>
        ) : null}
        {showAddPopup ? (
          <div className="income-group__popup">
            <NewOutgoingForm
              outgoingGroupUuid={outgoingGroupData.uuid}
              setOpenedForm={setOpenedForm}
              reRender={reRender}
              setReRender={setReRender}
            />
          </div>
        ) : null}
      </div>
    </>
  );
};

export default OutgoingGroup;
