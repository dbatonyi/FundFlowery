import React, { useContext } from "react";

import LanguageSwitcher from "./LanguageSwitcher";
import MainNavigation from "./MainNavigation";
import Notifications from "./Notifications";

import { AuthContext } from "@/layouts/Layout";

const Header = ({ auth, logout }) => {
  const { setStatusMessage, userInfo } = useContext(AuthContext);

  return (
    <header>
      <LanguageSwitcher />
      <MainNavigation auth={auth} logout={logout} />
      {auth && userInfo?.uuid ? (
        <Notifications
          userInfo={userInfo}
          setStatusMessage={setStatusMessage}
        />
      ) : null}
    </header>
  );
};

export default Header;
