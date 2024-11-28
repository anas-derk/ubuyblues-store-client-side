import Head from "next/head";
import Header from "@/components/Header";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LoaderPage from "@/components/LoaderPage";
import Link from "next/link";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import { getAnimationSettings, getInitialStateForElementBeforeAnimation, getUserInfo, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import { motion } from "motion/react";

export default function CustomerDashboard() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [userInfo, setUserInfo] = useState(true);

    const router = useRouter();

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.userlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
        if (userToken) {
            getUserInfo()
                .then(async (result) => {
                    if (!result.error) {
                        setUserInfo(result.data);
                        setIsLoadingPage(false);
                    } else {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                        await router.replace("/auth");
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                        await router.replace("/auth");
                    }
                    else {
                        setIsLoadingPage(false);
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                    }
                });
        } else {
            router.replace("/auth");
        }
    }, []);

    const userLogout = async () => {
        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
        await router.replace("/auth");
    }

    return (
        <div className="customer-dashboard">
            <Head>
                <title>{t(process.env.storeName)} - {t("Customer Dashboard")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content page pt-5">
                    <div className="container-fluid align-items-center pb-4">
                        <div className="row">
                            <div className="col-xl-3">
                                <CustomerDashboardSideBar />
                            </div>
                            <motion.div className="col-xl-9" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
                                <div className="customer-info-and-managment-account-links-for-customer">
                                    <h1 className="welcome-msg fw-bold mb-4">
                                        <span className="me-2">{t("Hello")} {userInfo.email}</span>
                                        <button className="logout-btn managment-link" onClick={userLogout}>{t("Log out")}</button>
                                    </h1>
                                    <h2 className="h6 managment-links">
                                        <span className="me-2">{t("From your account dashboard you can view your")}</span>
                                        <Link href="/customer-dashboard/orders" className="managment-link me-2">{t("recent orders")}</Link>
                                        <span className="me-2">{t(",")}</span>
                                        <Link href="/customer-dashboard/addreses" className="managment-link me-2">{t("shipping and billing addresses")}</Link>
                                        <span className="me-2">{t(",")}</span>
                                        <Link href="/customer-dashboard/account-details" className="managment-link me-2">{t("edit your password and account details")}</Link>
                                    </h2>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}