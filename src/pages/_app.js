import "../Scss/index.css";
import "@/components/Header/header.css";
import "./home.css";
import "../components/Footer/footer.css";
import "../pages/admin-dashboard/login/login.css";
import "../components/AdminPanelHeader/admin_panel_header.css";
import "../pages/auth/auth.css";
import "../pages/cart/cart.css";
import "../components/CustomerDashboardSideBar/customer_dashboard_side_bar.css";
import "../pages/customer-dashboard/customer_dashboard.css";
import "../pages/customer-dashboard/addreses/addreses.css";
import "../pages/customer-dashboard/orders/index.css";
import "../pages/customer-dashboard/account-details/customer_account_details.css";
import "../pages/customer-dashboard/addreses/billing-address/customer_billing_address.css";
import "../pages/customer-dashboard/addreses/shipping-address/customer_shipping_address.css";
import "../pages/404/404.css";
import "../pages/admin-dashboard/update-and-delete-products/update_and_delete_products.css";
import "../pages/account-verification/account_verification.css";
import "../pages/admin-dashboard/orders-managment/billing/[orderId]/billing.css";
import "../components/ErrorOnLoadingThePage/error_on_loading_the_page.css";
import "../pages/checkout/checkout.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../config/i18n";
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function App({ Component, pageProps }) {
  return (
    <GoogleOAuthProvider clientId={"665697657851-ajm9qfeko4lcero0hj8jh7eqvds9eg18.apps.googleusercontent.com"}>
      <Component {...pageProps} />
    </GoogleOAuthProvider>
  );
}