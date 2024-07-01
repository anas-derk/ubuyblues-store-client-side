import Head from "next/head";
import { BiError } from "react-icons/bi";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import { getUserInfo } from "../../../public/global_functions/popular";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";

export default function PageNotFound() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
        if (userToken) {
            getUserInfo()
                .then((result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                    }
                    setIsLoadingPage(false);
                })
                .catch((err) => {
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                    } else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        } else {
            setIsLoadingPage(false);
        }
    }, []);

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    return (
        <div className="page-not-found pb-5 page d-flex align-items-center justify-content-center flex-column text-center">
            <Head>
                <title>{t("Ubuyblues Store")} - {t("Page Not Found")}</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content pt-5 pb-5">
                    <BiError className="error-404-icon" />
                    <h1 className="mb-3">{t("Sorry,")}</h1>
                    <h2 className="mb-3">{t("this page could not be found.")}</h2>
                    <h3 className="mb-4">{t("Something went wrong.")}</h3>
                    <h3 className="mb-4">{t("The page you were looking for could not be found. Please check the URL")}</h3>
                    <Link href="/" className="home-page-link">{t("Or Go To Home Page")}</Link>
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}