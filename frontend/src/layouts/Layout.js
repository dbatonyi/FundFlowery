import React, { createContext, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Notifications from "@/components/Notifications";
import CurrencyRatesTable from "@/components/CurrencyRatesTable";

const config = require("../../config");
const appVersion = require("../../app-version");

export const AuthContext = React.createContext(null);

const Layout = (props) => {
  const router = useRouter();
  const getLocation = router.pathname;
  const currentPath = router.asPath;

  const [isLoading, setIsLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);

  const [currencyRates, setCurrencyRates] = useState(null);

  useEffect(authentication, [router.route]);

  useEffect(() => {
    setAuthFailed(false);
  }, [router.route]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStatusMessage(null);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [statusMessage]);

  function authentication() {
    fetch(`${config.serverUrl}/api/user`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((content) => {
        const authorized = content.auth;
        setAuth(authorized);
        if (authorized) {
          setUserInfo(content.userInfo);
          setIsLoading(false);

          if (getLocation === "/") {
            router.push("/dashboard");
          }
        } else {
          const resetPasswordUrls = getLocation.includes("/password/");

          if (
            !["/signin", "/signup"].includes(getLocation) &&
            !resetPasswordUrls
          ) {
            router.push("/signin");
          } else {
            setIsLoading(false);
          }
        }
      })
      .catch((err) => setAuth(false));
  }

  function logout() {
    fetch(`${config.serverUrl}/api/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    setAuth(false);

    router.push("/signin");
  }

  /**
   * SignIn function
   *
   * @param {string} email
   * @param {string} password
   */
  async function signIn(email, password) {
    const response = await fetch(`${config.serverUrl}/api/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (response.status === 200) {
      setAuth(true);
      router.push("/dashboard");
    }
    if (response.status === 401) {
      setAuthFailed(true);
      setAuth(false);
    }
  }

  return (
    <>
      {isLoading ? (
        <>Page is loading!</>
      ) : (
        <AuthContext.Provider
          value={{
            auth,
            authFailed,
            userInfo,
            setStatusMessage,
            setCurrencyRates,
            actions: {
              logout,
              signIn,
            },
          }}
        >
          <div className={`fund-flowery${auth ? " logged-in" : ""}`}>
            <Head>
              <title>FundFlowery</title>
              <meta name="description" content="FundFlowery" />
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header auth={auth} logout={logout} />
            <main className="fund-flowery__main">
              {props.children}
              {auth ? (
                <div className="fund-flowery__sidebar">
                  {auth && userInfo?.uuid ? (
                    <Notifications
                      userInfo={userInfo}
                      setStatusMessage={setStatusMessage}
                    />
                  ) : null}
                  {auth &&
                  currentPath.includes("financial-table") &&
                  currencyRates ? (
                    <CurrencyRatesTable currencyRates={currencyRates} />
                  ) : null}
                </div>
              ) : null}
              {statusMessage ? (
                <div className="fund-flowery-system-message">
                  <div className="fund-flowery-system-message--message">
                    {statusMessage}
                  </div>
                  <div
                    className="fund-flowery-system-message--close"
                    onClick={() => {
                      setStatusMessage(null);
                    }}
                  >
                    X
                  </div>
                </div>
              ) : null}
            </main>
            <div className="app-version">v{appVersion.version}</div>
            <ul className="circles">
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </div>
        </AuthContext.Provider>
      )}
    </>
  );
};

export default Layout;
