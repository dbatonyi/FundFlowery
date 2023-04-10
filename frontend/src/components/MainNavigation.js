import Link from "next/link";
import { useRouter } from "next/router";

const MainNavigation = ({ auth, logout }) => {
  const router = useRouter();

  const currentPath = router.asPath;

  return (
    <>
      {auth ? (
        <div className="main-navigation logged-in">
          <Link href="/dashboard">
            <div className="main-navigation--link">Home</div>
          </Link>
          <Link href="/financial-tables">
            <div className="main-navigation--link">Financial tables</div>
          </Link>
          <div
            className="main-navigation--link"
            onClick={() => {
              logout();
            }}
          >
            Logout
          </div>
        </div>
      ) : (
        <div className="main-navigation logged-out">
          {currentPath === "/signin" ? (
            <Link href="/signup">
              <div className="main-navigation--link">Sign Up</div>
            </Link>
          ) : (
            <Link href="/signin">
              <div className="main-navigation--link">Signin</div>
            </Link>
          )}
        </div>
      )}
    </>
  );
};

export default MainNavigation;
