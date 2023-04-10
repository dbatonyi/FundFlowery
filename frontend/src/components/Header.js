import LanguageSwitcher from "./LanguageSwitcher";
import MainNavigation from "./MainNavigation";

const Header = ({ auth, logout }) => {
  return (
    <header>
      <LanguageSwitcher />
      <MainNavigation auth={auth} logout={logout} />
    </header>
  );
};

export default Header;
