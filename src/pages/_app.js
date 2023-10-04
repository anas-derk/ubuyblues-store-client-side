import "../Scss/index.css";
import "@/components/Header/header.css";
import "./home.css";
import "../components/Footer/footer.css";
import "../pages/admin-dashboard/login/login.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
