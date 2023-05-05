import React from "react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
const config = require("../../../config");

const NewPassword = () => {
  const router = useRouter();
  const { t } = useTranslation("newpassword");

  const submit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const email = formData.get("email");

    await fetch(`${config.serverUrl}/api/password/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: email,
      }),
    });

    await router.push("/");
  };

  return (
    <div className="new-password">
      <div className="new-password__form-container">
        <form onSubmit={submit}>
          <h1>{t("newPassTitle")}</h1>
          <fieldset>
            <label htmlFor="email">{t("newPassEmail")}</label>
            <input name="email" type="email" required className="text" />
          </fieldset>
          <div className="submit-btn">
            <button className="btn" type="submit">
              {t("newPassSubmit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPassword;
