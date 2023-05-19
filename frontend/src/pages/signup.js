import React from "react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
const config = require("../../config");

const SignUp = () => {
  const { t } = useTranslation("signup");
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const firstName = formData.get("firstname");
    const lastName = formData.get("lastname");
    const email = formData.get("email");
    const password = formData.get("password");
    const repassword = formData.get("repassword");

    if (password !== repassword) {
      return setStatusMessage("Passwords must be match!");
    }

    const registrationResponse = await fetch(`${config.serverUrl}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        firstname: firstName,
        lastname: lastName,
        password: password,
      }),
    });

    const data = await registrationResponse.json();
    setStatusMessage(data.message);
    router.push("/signin");
  };

  return (
    <div className="signup">
      <div className="signup-container">
        <form className="signup-container__form" onSubmit={submit}>
          <h1>{t("signupTitle")}</h1>
          <fieldset>
            <label htmlFor="email">
              {t("signupEmail")} <span>*</span>
            </label>
            <input className="text" name="email" type="email" required />
          </fieldset>
          <fieldset>
            <label htmlFor="firstname">
              {t("signupFirstName")} <span>*</span>
            </label>
            <input name="firstname" type="text" required className="text" />
          </fieldset>
          <fieldset>
            <label htmlFor="lastname">
              {t("signupLastName")} <span>*</span>
            </label>
            <input name="lastname" type="text" required className="text" />
          </fieldset>
          <fieldset>
            <label htmlFor="password">
              {t("signupPassword")} <span>*</span>
            </label>
            <input name="password" type="password" required className="text" />
          </fieldset>
          <fieldset>
            <label htmlFor="repassword">
              {t("signupRePassword")} <span>*</span>
            </label>
            <input
              name="repassword"
              type="password"
              required
              className="text"
            />
          </fieldset>

          <div className="submit-btn">
            <button className="btn" type="submit">
              {t("signupSubmit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
