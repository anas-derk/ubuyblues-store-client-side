import "../Scss/index.css";
import "@/components/Header/header.css";
import "./home.css";
import "../components/Footer/footer.css";
import "../pages/auth/auth.css";
import "../pages/cart/cart.css";
import "../components/CustomerDashboardSideBar/customer_dashboard_side_bar.css";
import "../pages/customer-dashboard/customer_dashboard.css";
import "../pages/customer-dashboard/addreses/addreses.css";
import "../pages/customer-dashboard/orders/index.css";
import "../pages/confirmation/[id]/confirmation.css";
import "../pages/customer-dashboard/orders/[orderId]/order_details.css";
import "../pages/customer-dashboard/account-details/customer_account_details.css";
import "../pages/404/404.css";
import "../pages/account-verification/account_verification.css";
import "../components/ErrorOnLoadingThePage/error_on_loading_the_page.css";
import "../pages/checkout/checkout.css";
import "../pages/product-details/[id]/product_details.css";
import "../components/ProductCard/product_card.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../components/SectionLoader/section_loader.css";
import "../../config/i18n";
import { GoogleOAuthProvider } from "@react-oauth/google";
import store from "@/store";
import { Provider } from "react-redux";

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={"665697657851-ajm9qfeko4lcero0hj8jh7eqvds9eg18.apps.googleusercontent.com"}>
        <Component {...pageProps} />
      </GoogleOAuthProvider>
    </Provider>
  );
}