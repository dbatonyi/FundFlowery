import LanguageSwitcher from "./LanguageSwitcher";
import MainNavigation from "./MainNavigation";
import Notifications from "./Notifications";

const Header = ({ auth, logout }) => {
  return (
    <header>
      <LanguageSwitcher />
      <MainNavigation auth={auth} logout={logout} />
      {auth ? <Notifications /> : null}
    </header>
  );
};

export default Header;
