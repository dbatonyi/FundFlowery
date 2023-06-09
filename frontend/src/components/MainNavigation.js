import Link from "next/link";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

const MainNavigation = ({ auth, logout }) => {
  const { t } = useTranslation("navigation");

  const router = useRouter();

  const currentPath = router.asPath;

  return (
    <nav className="main-navigation">
      {auth ? (
        <ul className="logged-in-menu">
          <li
            className={`main-navigation--link${
              currentPath === "/dashboard" ? " active-link" : ""
            }`}
          >
            <Link href="/dashboard">{t("navigationHome")}</Link>
          </li>
          <li
            className={`main-navigation--link${
              currentPath === "/financial-tables" ? " active-link" : ""
            }`}
          >
            <Link href="/financial-tables">
              {t("navigationFinancialTables")}
            </Link>
          </li>
          <li className={`main-navigation--link`}>
            <div
              onClick={() => {
                logout();
              }}
            >
              {t("navigationLogout")}
            </div>
          </li>
        </ul>
      ) : (
        <ul className="logged-out-menu">
          <li
            className={`main-navigation--link${
              currentPath === "/signup" ? " active-link" : ""
            }`}
          >
            <Link href="/signup">{t("navigationSignUp")}</Link>
          </li>
          <li
            className={`main-navigation--link${
              currentPath === "/signin" ? " active-link" : ""
            }`}
          >
            <Link href="/signin">{t("navigationSignIn")}</Link>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default MainNavigation;
