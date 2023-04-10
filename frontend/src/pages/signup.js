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

    if (password === repassword) {
      await fetch(`${config.serverUrl}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          firstname: firstName,
          lastname: lastName,
          password: password,
        }),
      });

      await router.push("/signin");
      return;
    }

    return console.log("Password must be match");
  };

  return (
    <div className="signup">
      <div className="signup-containerd">
        <form className="signup-container__form" onSubmit={submit}>
          <h1>{t("signupTitle")}</h1>

          <label htmlFor="email">{t("signupEmail")}</label>
          <input className="text" name="email" type="email" required />

          <label htmlFor="firstname">{t("signupFirstName")}</label>
          <input name="firstname" type="text" required className="text" />

          <label htmlFor="lastname">{t("signupLastName")}</label>
          <input name="lastname" type="text" required className="text" />

          <label htmlFor="password">{t("signupPassword")}</label>
          <input name="password" type="password" required className="text" />

          <label htmlFor="repassword">{t("signupRePassword")}</label>
          <input name="repassword" type="password" required className="text" />

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
