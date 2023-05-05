import React, { useContext, useEffect } from "react";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { AuthContext } from "../layouts/Layout";

const signIn = () => {
  const { t } = useTranslation("signin");

  const { actions, authFailed } = useContext(AuthContext);

  const submit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const email = formData.get("email");
    const password = formData.get("password");
    actions.signIn(email, password);
  };

  useEffect(() => {
    if (authFailed) {
      const signinPassword = document.querySelector(".signin-password");
      signinPassword.value = "";
    }
  }, [authFailed]);

  return (
    <div className="signin">
      <div className="signin__form-container">
        <form onSubmit={submit}>
          <h1>{t("signInTitle")}</h1>
          {authFailed ? (
            <div className="signin__form-container--error">
              {t("signInAuthError")}
            </div>
          ) : (
            ""
          )}
          <fieldset>
            <label htmlFor="email">{t("signInEmail")}</label>
            <input className="text" name="email" type="email" required />
          </fieldset>
          <fieldset>
            <label htmlFor="password">{t("signInPassword")}</label>
            <input
              className="signin-password"
              name="password"
              type="password"
              required
            />
          </fieldset>
          <div className="signin__form-container--controllers">
            <div className="submit-btn">
              <button className="btn" type="submit">
                {t("signInSubmit")}
              </button>
            </div>
            <div className="password-reset">
              <Link href="/password/new">{t("signInPassReset")}</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default signIn;
