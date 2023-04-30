import Link from "next/link";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

const MainNavigation = ({ auth, logout }) => {
  const { t } = useTranslation("navigation");

  const router = useRouter();

  const currentPath = router.asPath;

  return (
    <>
      {auth ? (
        <div className="main-navigation logged-in">
          <Link href="/dashboard">
            <div className="main-navigation--link">{t("navigationHome")}</div>
          </Link>
          <Link href="/financial-tables">
            <div className="main-navigation--link">
              {t("navigationFinancialTables")}
            </div>
          </Link>
          <div
            className="main-navigation--link"
            onClick={() => {
              logout();
            }}
          >
            {t("navigationLogout")}
          </div>
        </div>
      ) : (
        <div className="main-navigation logged-out">
          {currentPath === "/signin" ? (
            <Link href="/signup">
              <div className="main-navigation--link">
                {t("navigationSignUp")}
              </div>
            </Link>
          ) : (
            <Link href="/signin">
              <div className="main-navigation--link">
                {t("navigationSignIn")}
              </div>
            </Link>
          )}
        </div>
      )}
    </>
  );
};

export default MainNavigation;
