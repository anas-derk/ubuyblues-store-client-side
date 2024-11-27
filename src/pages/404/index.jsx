import Head from "next/head";
import { BiError } from "react-icons/bi";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import { getUserInfo, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { motion } from "motion/react";

export default function PageNotFound() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.userlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
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
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                        setIsLoadingPage(false);
                    }
                    else {
                        setIsLoadingPage(false);
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                    }
                });
        } else {
            setIsLoadingPage(false);
        }
    }, []);

    return (
        <div className="page-not-found page d-flex align-items-center justify-content-center flex-column text-center">
            <Head>
                <title>{t(process.env.storeName)} - {t("Page Not Found")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content pt-5 pb-5">
                    <motion.div
                        className="position-relative"
                        initial={{
                            scale: 0.5,
                        }}
                        animate={{
                            scale: 1,
                            color: "#F00",
                            transition: {
                                duration: 0.5,
                            }
                        }}
                    >
                        <BiError className="error-404-icon" />
                    </motion.div>
                    <motion.h1
                        className="mb-3 h4"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1,
                            transition: {
                                delay: 0.5,
                                duration: 0.3
                            }
                        }}
                    >{t("Sorry,")}</motion.h1>
                    <motion.h2
                        className="mb-3 h5"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1,
                            transition: {
                                delay: 1,
                                duration: 0.3
                            }
                        }}
                    >{t("this page could not be found.")}</motion.h2>
                    <motion.h3
                        className="mb-4 h6"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1,
                            transition: {
                                delay: 1.5,
                                duration: 0.3
                            }
                        }}
                    >{t("Something went wrong.")}</motion.h3>
                    <motion.h3
                        className="mb-4 h6"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1,
                            transition: {
                                delay: 2,
                                duration: 0.3
                            }
                        }}
                    >{t("The page you were looking for could not be found. Please check the URL")}</motion.h3>
                    <motion.div
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1,
                            transition: {
                                delay: 2.5,
                                duration: 0.3
                            }
                        }}
                    >
                        <Link href="/" className="home-page-link-button">{t("Or Go To Home Page")}</Link>
                    </motion.div>
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}