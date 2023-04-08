import React, { createContext, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const config = require("@/config");

export const AuthContext = React.createContext(null);

const Layout = (props) => {
  const router = useRouter();
  const getLocation = router.pathname;

  const [isLoading, setIsLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);

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
            actions: {
              logout,
              signIn,
            },
          }}
        >
          <div className="app-container">
            <Head>
              <title>Project-T</title>
              <meta name="description" content="Project-T" />
              <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="project-t-main">
              {props.children}
              {statusMessage ? (
                <div className="project-t-system-message">
                  <div className="project-t-system-message--message">
                    {statusMessage}
                  </div>
                  <div
                    className="project-t-system-message--close"
                    onClick={() => {
                      setStatusMessage(null);
                    }}
                  >
                    X
                  </div>
                </div>
              ) : null}
            </main>
          </div>
        </AuthContext.Provider>
      )}
    </>
  );
};

export default Layout;
