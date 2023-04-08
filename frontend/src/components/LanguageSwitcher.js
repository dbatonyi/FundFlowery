import Link from "next/link";
import { useRouter } from "next/router";

const LanguageSwitcher = () => {
  const router = useRouter();

  const handleLocaleChange = (locale) => {
    router.push(router.pathname, router.asPath, { locale });
  };

  return (
    <div className="language-selector">
      <Link href={router.asPath} locale="en">
        <div
          className="language-selector--item"
          onClick={() => handleLocaleChange("en")}
        >
          English
        </div>
      </Link>
      <Link href={router.asPath} locale="hu">
        <div
          className="langugage-selector--item"
          onClick={() => handleLocaleChange("hu")}
        >
          Magyar
        </div>
      </Link>
    </div>
  );
};

export default LanguageSwitcher;
