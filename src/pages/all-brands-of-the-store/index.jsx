import Head from "next/head";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFoundError from "@/components/NotFoundError";
import { useTranslation } from "react-i18next";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { getAllBrandsInsideThePage, getAnimationSettings, getInitialStateForElementBeforeAnimation, getStoreDetails, getUserInfo, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import SectionLoader from "@/components/SectionLoader";
import BrandCard from "@/components/BrandCard";
import { motion } from "motion/react";

export default function AllBrands({ storeId }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [isGetUserInfo, setIsGetUserInfo] = useState(true);

    const [isGetBrands, setIsGetBrands] = useState(true);

    const [storeDetails, setStoreDetails] = useState({
        _id: "",
        name: "",
    });

    const [allBrandsInsideThePage, setAllBrandsInsideThePage] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const pageSize = 9;

    const { i18n, t } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.USER_LANGUAGE_FIELD_NAME_IN_LOCAL_STORAGE);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
        if (userToken) {
            getUserInfo()
                .then((result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                    }
                    setIsGetUserInfo(false);
                })
                .catch((err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.USER_TOKEN_NAME_IN_LOCAL_STORAGE);
                        setIsGetUserInfo(false);
                    }
                    else {
                        setIsLoadingPage(false);
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                    }
                });
        } else {
            setIsGetUserInfo(false);
        }
    }, []);

    useEffect(() => {
        getStoreDetails(storeId)
            .then(async (storeDetailsResult) => {
                if (!storeDetailsResult.error && storeDetailsResult.data?.status === "approving") {
                    setStoreDetails({
                        _id: storeDetailsResult.data._id,
                        name: storeDetailsResult.data.name
                    });
                    const result = (await getAllBrandsInsideThePage(1, pageSize, `storeId=${storeDetailsResult.data._id}`)).data;
                    setAllBrandsInsideThePage(result.brands);
                    setTotalPagesCount(Math.ceil(result.brandsCount / pageSize));
                }
                setIsGetBrands(false);
            })
            .catch((err) => {
                setIsLoadingPage(false);
                setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
            });
    }, []);

    useEffect(() => {
        if (!isGetUserInfo && !isGetBrands) {
            setIsLoadingPage(false);
        }
    }, [isGetUserInfo, isGetBrands]);

    const getNextPage = async () => {
        try {
            setIsGetBrands(true);
            const newCurrentPage = currentPage + 1;
            setAllBrandsInsideThePage([...allBrandsInsideThePage, ...(await getAllBrandsInsideThePage(newCurrentPage, pageSize, `storeId=${storeDetails._id}`)).data.brands]);
            setCurrentPage(newCurrentPage);
            setIsGetBrands(false);
        }
        catch (err) {
            setIsGetBrands(false);
            setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
        }
    }

    return (
        <div className="all-brands page">
            <Head>
                <title>{t(process.env.STORE_NAME)} - {t("All The Brands Of The Store")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content pb-5 pt-5">
                    <div className="container-fluid">
                        {Object.keys(storeDetails).length > 0 ? <>
                            <motion.h1 className="welcome-msg mb-5 border-bottom border-2 pb-3 w-fit mx-auto text-white h3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>{t("All The Brands Of The Store")}: {storeDetails.name[i18n.language]}</motion.h1>
                            <div className="row brands-box section-data-box mb-5">
                                {allBrandsInsideThePage.length > 0 && allBrandsInsideThePage.map((brand) => (
                                    <motion.div className="col-xs-12 col-lg-6 col-xl-4" key={brand._id}
                                        initial={{
                                            scale: 0.7,
                                        }}
                                        whileInView={{
                                            scale: 1,
                                            transition: {
                                                duration: 0.5,
                                            }
                                        }}
                                        whileHover={{
                                            scale: 1.1
                                        }}
                                    >
                                        <BrandCard
                                            brandDetails={brand}
                                        />
                                    </motion.div>
                                ))}
                                {allBrandsInsideThePage.length === 0 && <NotFoundError errorMsg={t("Sorry, Not Found Any Brands !!")} />}
                                {isGetBrands && <SectionLoader />}
                            </div>
                            {!isGetBrands && currentPage < totalPagesCount && <button className="mb-4 d-block mx-auto text-center show-btn p-3" onClick={getNextPage}>Show More</button>}
                            {errorMsg && <NotFoundError errorMsg={errorMsg} />}
                        </> : <NotFoundError errorMsg={t("Sorry, This Store Is Not Found !!")} />}
                    </div>
                </div>
                <Footer />
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}

export async function getServerSideProps({ query }) {
    const allowedCountries = ["kuwait", "germany", "turkey"];
    if (query.country) {
        if (!allowedCountries.includes(query.country)) {
            if (query.storeId) {
                return {
                    redirect: {
                        permanent: false,
                        destination: `/all-brands?storeId=${query.storeId}`,
                    },
                    props: {
                        countryAsProperty: process.env.BASE_COUNTRY,
                        storeId: query.storeId,
                    },
                }
            }
            return {
                redirect: {
                    permanent: false,
                    destination: "/all-brands",
                },
                props: {
                    countryAsProperty: process.env.BASE_COUNTRY,
                },
            }
        }
        if (Object.keys(query).filter((key) => key !== "country" && key !== "storedId").length > 2) {
            return {
                redirect: {
                    permanent: false,
                    destination: `/all-brands?country=${query.country}&storeId=${query.storeId}`,
                },
                props: {
                    countryAsProperty: query.country,
                    storeId: query.storeId,
                },
            }
        }
        return {
            props: {
                countryAsProperty: query.country,
                storeId: query.storeId,
            },
        }
    }
    if (query.storeId) {
        return {
            props: {
                storeId: query.storeId,
            },
        }
    }
    return {
        props: {},
    }
}