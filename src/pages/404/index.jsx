import Head from "next/head";
import { BiError } from "react-icons/bi";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";

export default function PageNotFound() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
        setIsLoadingPage(false);
    }, []);

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    return (
        <div className="page-not-found pb-5 page">
            <Head>
                <title>{t("Ubuyblues Store")} - {t("Page Not Found")}</title>
            </Head>
            {!isLoadingPage && <>
                <Header />
                <div className="page-content p-4 d-flex align-items-center justify-content-center flex-column">
                    <BiError className="error-404-icon" />
                    <h1 className="mb-3">{t("Sorry,")}</h1>
                    <h2 className="mb-3">{t("this page could not be found.")}</h2>
                    <h3 className="mb-4">{t("Something went wrong.")}</h3>
                    <h3 className="mb-4">{t("The page you were looking for could not be found. Please check the URL")}</h3>
                    <Link href="/" className="home-page-link">{t("Or Go To Home Page")}</Link>
                </div>
            </>}
        </div>
    );
}