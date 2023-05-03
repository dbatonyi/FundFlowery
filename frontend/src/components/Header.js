import React, { useContext } from "react";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import MainNavigation from "./MainNavigation";
import Notifications from "./Notifications";

import { AuthContext } from "@/layouts/Layout";

const Header = ({ auth, logout }) => {
  const { setStatusMessage, userInfo } = useContext(AuthContext);

  return (
    <header className="fund-flowery__header">
      <div className="fund-flowery__header--logo">
        <Link href="/">FundFlowery</Link>
      </div>
      <MainNavigation auth={auth} logout={logout} />
      {auth && userInfo?.uuid ? (
        <Notifications
          userInfo={userInfo}
          setStatusMessage={setStatusMessage}
        />
      ) : null}
      <LanguageSwitcher />
    </header>
  );
};

export default Header;
