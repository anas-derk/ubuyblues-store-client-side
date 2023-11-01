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
import "../pages/customer-dashboard/wish-list/wish_list.css";
import "../pages/customer-dashboard/customer_dashboard.css";
import "../pages/customer-dashboard/addreses/addreses.css";
import "../pages/customer-dashboard/account-details/customer_account_details.css";
import "../pages/404/404.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
