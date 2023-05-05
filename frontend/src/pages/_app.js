import "../styles/core.scss";
import Layout from "@/layouts/Layout";

const appVersion = require("../../app-version");

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
      <div className="app-version">v{appVersion.version}</div>
    </Layout>
  );
}

export default MyApp;
