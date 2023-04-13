import React from "react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
const configData = require("../../../../config");

const ResetPassword = () => {
  const router = useRouter();
  const urlParam = router.query.param;
  const { t } = useTranslation("resetpassword");

  const submit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const password = formData.get("password");
    const rePassword = formData.get("repassword");

    if (password === rePassword) {
      await fetch(`${configData.serverUrl}/api/password/reset/${urlParam}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          password: password,
          repassword: rePassword,
        }),
      });

      await router.push("/");
    }

    return console.log("Password must match");
  };

  return (
    <div className="reset-password">
      <div className="reset-password__form-container">
        <form onSubmit={submit}>
          <h1>{t("resetPassTitle")}</h1>

          <label htmlFor="password">{t("resetPassPassword")}</label>
          <input name="password" type="password" required className="text" />

          <label htmlFor="password">{t("resetPassRePassword")}</label>
          <input name="repassword" type="password" required className="text" />
          <div className="submit-btn">
            <button className="btn" type="submit">
              {t("resetPassSubmit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
