import Head from "next/head";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFoundError from "@/components/NotFoundError";
import { useTranslation } from "react-i18next";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { getStoreDetails, getUserInfo } from "../../../public/global_functions/popular";
import axios from "axios";
import SectionLoader from "@/components/SectionLoader";
import BrandCard from "@/components/BrandCard";

export default function AllBrands({ storeId }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

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
        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
        if (userToken) {
            getUserInfo()
                .then((result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                    }
                    setIsGetUserInfo(false);
                })
                .catch((err) => {
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                        setIsGetUserInfo(false);
                    } else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        } else {
            setIsGetUserInfo(false);
        }
    }, []);

    useEffect(() => {
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
    }, []);

    useEffect(() => {
        getStoreDetails(storeId)
            .then(async (storeDetailsResult) => {
                if (!storeDetailsResult.error && storeDetailsResult.data?.status === "approving") {
                    setStoreDetails({
                        _id: storeDetailsResult.data._id,
                        name: storeDetailsResult.data.name
                    });
                    const result = await getBrandsCount(`storeId=${storeDetailsResult.data._id}`);
                    if (result.data > 0) {
                        setAllBrandsInsideThePage((await getAllBrandsInsideThePage(1, pageSize, `storeId=${storeDetailsResult.data._id}`)).data);
                        setTotalPagesCount(Math.ceil(result.data / pageSize));
                    }
                }
                setIsGetBrands(false);
            })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
    }, []);

    useEffect(() => {
        if (!isGetUserInfo && !isGetBrands) {
            setIsLoadingPage(false);
        }
    }, [isGetUserInfo, isGetBrands]);

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    const getBrandsCount = async (filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/brands/brands-count?${filters ? filters : ""}`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllBrandsInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/brands/all-brands-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getNextPage = async () => {
        setIsGetBrands(true);
        const newCurrentPage = currentPage + 1;
        setAllBrandsInsideThePage([...allBrandsInsideThePage, ...(await getAllBrandsInsideThePage(newCurrentPage, pageSize, `storeId=${storeDetails._id}`)).data]);
        setCurrentPage(newCurrentPage);
        setIsGetBrands(false);
    }

    return (
        <div className="all-brands page d-flex flex-column justify-content-center align-items-center">
            <Head>
                <title>{t("Ubuyblues Store")} - {t("All The Brands Of The Store")}</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div className="page-content pb-5 pt-5">
                    <div className="container-fluid">
                        {Object.keys(storeDetails).length > 0 ? <>
                            <h1 className="welcome-msg mb-5 border-bottom border-2 pb-3 w-fit mx-auto text-white">{t("All The Brands Of The Store")}: {storeDetails.name}</h1>
                            <div className="row brands-box section-data-box mb-5">
                                {allBrandsInsideThePage.length > 0 && allBrandsInsideThePage.map((brand) => (
                                    <div className="col-xs-12 col-lg-6 col-xl-4" key={brand._id}>
                                        <BrandCard
                                            brandDetails={brand}
                                        />
                                    </div>
                                ))}
                                {allBrandsInsideThePage.length === 0 && <NotFoundError errorMsg={t("Sorry, Not Found Any Brands !!")} />}
                                {isGetBrands && <SectionLoader />}
                            </div>
                            {!isGetBrands && currentPage < totalPagesCount && <button className="mb-4 d-block mx-auto text-center show-btn p-3" onClick={getNextPage}>Show More</button>}
                        </> : <NotFoundError errorMsg={t("Sorry, This Store Is Not Found !!")} />}
                    </div>
                </div>
                <Footer />
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
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
                        countryAsProperty: "kuwait",
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
                    countryAsProperty: "kuwait",
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