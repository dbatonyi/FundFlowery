import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import MainNavigation from "./MainNavigation";

const Header = ({ auth, logout }) => {
  return (
    <header className="fund-flowery__header">
      <div className="fund-flowery__header--logo">
        <Link href="/">FundFlowery</Link>
      </div>
      <MainNavigation auth={auth} logout={logout} />
      <LanguageSwitcher />
    </header>
  );
};

export default Header;
