import React, { useContext, useEffect } from "react";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
    <div className="project-t-signin">
      <LanguageSwitcher />
      <div className="project-t-signin__form-container">
        <form onSubmit={submit}>
          <h1>{t("signInTitle")}</h1>
          {authFailed ? (
            <div className="project-t-signin__form-container--error">
              {t("signInAuthError")}
            </div>
          ) : (
            ""
          )}
          <label htmlFor="email">{t("signInEmail")}</label>
          <input className="text" name="email" type="email" required />

          <label htmlFor="password">{t("signInPassword")}</label>
          <input
            className="signin-password"
            name="password"
            type="password"
            required
          />

          <div className="submit-btn">
            <button className="btn" type="submit">
              {t("signInSubmit")}
            </button>
          </div>
        </form>
        <div className="project-t-signin__form-container--password-reset">
          <Link href="/password/new">{t("signInPassReset")}</Link>
        </div>
        <div className="project-t-signin__form-container--sign-up">
          <Link href="/signup">{t("signInRegistration")}</Link>
        </div>
      </div>
    </div>
  );
};

export default signIn;
