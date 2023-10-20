import "../Scss/index.css";
import "@/components/Header/header.css";
import "./home.css";
import "../components/Footer/footer.css";
import "../pages/admin-dashboard/login/login.css";
import "../components/AdminDashboardSideBar/admin_dashboard_side_bar.css";
import "../pages/admin-dashboard/admin_dashboard.css";
import "../pages/auth/auth.css";
import "../pages/cart/cart.css";
import "../components/CustomerDashboardSideBar/customer_dashboard_side_bar.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
