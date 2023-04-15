import React, { useContext } from "react";
import configData from "../../../config";
import { AuthContext } from "@/layouts/Layout";

const NewOutgoingForm = ({
  tableUuid,
  setOpenedForm,
  reRender,
  setReRender,
}) => {
  const { setStatusMessage } = useContext(AuthContext);

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const currentDate = new Date();
    const outgoingTitle = formData.get("outgoing-title");
    const outgoingAmount = formData.get("outgoing-amount");
    const outgoingCategory = formData.get("outgoing-category");
    const outgoingOrigin = formData.get("outgoing-origin");
    const description = formData.get("description");

    try {
      const response = await fetch(
        `${configData.serverUrl}/api/create-new-outgoing-item`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authenticate: `Bearer ${configData.apiToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            outgoingDate: currentDate,
            outgoingTitle,
            outgoingAmount,
            outgoingCategory: outgoingCategory.toLowerCase(),
            outgoingOrigin: outgoingOrigin.toLowerCase(),
            description,
            tableUuid,
          }),
        }
      );

      const dataJson = await response.json();

      if (response.status === 200) {
        setStatusMessage(dataJson.message);
        setReRender(!reRender);
        setOpenedForm(null);
      }
    } catch (error) {
      const log = await fetch(`${configData.serverUrl}/api/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="new-outgoing-popup">
      <div
        className="new-outgoing-popup--close"
        onClick={() => {
          setOpenedForm(null);
        }}
      >
        X
      </div>
      <div className="new-outgoing-popup--title">Add new outgoing item</div>
      <form onSubmit={submitHandler}>
        <label htmlFor="outgoing-title">Outgoing title</label>
        <input className="text" name="outgoing-title" type="text" required />
        <label htmlFor="outgoing-amount">Outgoing amount</label>
        <input className="text" name="outgoing-amount" type="number" required />
        <label htmlFor="outgoing-category">Outgoing category</label>
        <input className="text" name="outgoing-category" type="text" required />
        <label htmlFor="outgoing-origin">Outgoing origin</label>
        <input className="text" name="outgoing-origin" type="text" required />
        <label htmlFor="description">Description</label>
        <input className="text" name="description" type="text" />
        <div className="submit-btn">
          <button className="btn" type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewOutgoingForm;
