import Head from "next/head";
import Header from "@/components/Header";
import Link from "next/link";
import { MdKeyboardArrowRight, MdOutlineMail } from "react-icons/md";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import { RiArrowUpDoubleFill, RiArrowDownDoubleFill } from "react-icons/ri";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import Slider from "react-slick";
import { FaTimes, FaWhatsapp } from "react-icons/fa";
import { MdOutlineContactPhone } from "react-icons/md";
import { useTranslation } from "react-i18next";
import validations from "../../public/global_functions/validations";
import PaginationBar from "@/components/PaginationBar";
import prices from "../../public/global_functions/prices";
import ShareOptionsBox from "@/components/ShareOptionsBox";
import ProductCard from "@/components/ProductCard";
import { getProductsCount, getAllProductsInsideThePage } from "../../public/global_functions/popular";

export default function Home({ countryAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [token, setToken] = useState("");

    const [usdPriceAgainstCurrency, setUsdPriceAgainstCurrency] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [isGetCategories, setIsGetCategories] = useState(true);

    const [isGetProducts, setIsGetProducts] = useState(true);

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const [favoriteProductsListForUser, setFavoriteProductsListForUser] = useState([]);

    const [allProductsInsideThePage, setAllProductsInsideThePage] = useState([]);

    const [allCategoriesInsideThePage, setAllCategoriesInsideThePage] = useState([]);

    const [appearedNavigateIcon, setAppearedNavigateIcon] = useState("down");

    const [currentPage, setCurrentPage] = useState({
        forCategories: 1,
        forProducts: 1,
    });

    const [totalPagesCount, setTotalPagesCount] = useState({
        forProducts: 0,
        forCategories: 0,
    });

    const [isDisplayShareOptionsBox, setIsDisplayShareOptionsBox] = useState(false);

    const [appearedSections, setAppearedSections] = useState([]);

    const [allBrands, setAllBrands] = useState([]);

    const [isDisplayContactIcons, setIsDisplayContactIcons] = useState(false);

    const { i18n, t } = useTranslation();

    const pageSize = 8;

    useEffect(() => {
        setIsLoadingPage(true);
        prices.getUSDPriceAgainstCurrency(countryAsProperty).then((price) => {
            setUsdPriceAgainstCurrency(price);
            setCurrencyNameByCountry(prices.getCurrencyNameByCountry(countryAsProperty));
            if (!isGetCategories && !isGetProducts) {
                setIsLoadingPage(false);
            }
        })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
    }, [countryAsProperty]);

    useEffect(() => {
        const userToken = localStorage.getItem("asfour-store-user-token");
        if (userToken) {
            setToken(userToken);
            validations.getUserInfo(userToken)
                .then((result) => {
                    if (!result.error) {
                        setFavoriteProductsListForUser(result.data.favorite_products_list);
                    }
                })
                .catch((err) => {
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem("asfour-store-user-token");
                    } else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        }
    }, []);

    useEffect(() => {
        window.onscroll = function () { handleScrollToUpAndDown(this) };
        setWindowInnerWidth(window.innerWidth);
        window.addEventListener("resize", function () {
            setWindowInnerWidth(this.innerWidth);
        });
        const userLanguage = localStorage.getItem("asfour-store-language");
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en");
        // =============================================================================
        getCategoriesCount()
            .then(async (result) => {
                if (result.data > 0) {
                    setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(1, pageSize)).data);
                    totalPagesCount.forCategories = Math.ceil(result.data / pageSize);
                }
                setIsGetCategories(false);
            })
            .catch((err) => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
        // =============================================================================
        getProductsCount()
            .then(async (result) => {
                if (result.data > 0) {
                    setAllProductsInsideThePage((await getAllProductsInsideThePage(1, pageSize)).data);
                    totalPagesCount.forProducts = Math.ceil(result.data / pageSize);
                }
                setIsGetProducts(false);
            })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
        // =============================================================================
        getAppearedSections()
            .then(async (result) => {
                const appearedSectionsLength = result.data.length;
                setAppearedSections(appearedSectionsLength > 0 ? result.data.map((appearedSection) => appearedSection.isAppeared ? appearedSection.sectionName : "") : []);
                if (appearedSectionsLength > 0) {
                    for (let i = 0; i < appearedSectionsLength; i++) {
                        if (result.data[i].sectionName === "brands" && result.data[i].isAppeared) {
                            setAllBrands((await getAllBrands()).data);
                        }
                    }
                }
            })
            .catch(() => {
                setIsLoadingPage(false);
                setIsErrorMsgOnLoadingThePage(true);
            });
        // ========================================================================================== 
    }, []);

    useEffect(() => {
        if (!isGetCategories && !isGetProducts) {
            setIsLoadingPage(false);
        }
    }, [isGetCategories, isGetProducts]);

    const getCategoriesCount = async () => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/categories/categories-count`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllCategoriesInsideThePage = async (pageNumber, pageSize) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/categories/all-categories-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}`);
            return await res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAppearedSections = async () => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/appeared-sections/all-sections`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllBrands = async () => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/brands/all-brands`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const handleSelectUserLanguage = (userLanguage) => {
        i18n.changeLanguage(userLanguage);
        document.body.lang = userLanguage;
    }

    const handleScrollToUpAndDown = (window) => {
        if (window.scrollY > 500) {
            setAppearedNavigateIcon("up");
        } else {
            setAppearedNavigateIcon("down");
        }
    }

    const navigateToUpOrDown = (navigateOrientation) => {
        if (navigateOrientation === "up") {
            window.scrollTo({
                behavior: "smooth",
                top: 0,
                left: 0,
            });
        } else if (navigateOrientation === "down") {
            window.scrollTo({
                behavior: "smooth",
                top: document.querySelector("footer").offsetTop,
                left: 0,
            });
        }
    }

    const isFavoriteProductForUser = (favorite_products_list, productId) => {
        for (let i = 0; i < favorite_products_list.length; i++) {
            if (favorite_products_list[i]._id === productId) return true;
        }
        return false;
    }

    const getAppearedSlidesCount = (windowInnerWidth, count) => {
        if (windowInnerWidth < 767) return 1;
        if (windowInnerWidth >= 767 && windowInnerWidth < 1199 && count >= 2) return 2;
        if (windowInnerWidth >= 1199 && count >= 3) return 3;
        return count;
    }

    const getPreviousPage = async (section) => {
        if (section === "categories") {
            setIsGetCategories(true);
            const newCurrentPage = currentPage.forCategories - 1;
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(newCurrentPage, pageSize)).data);
            setCurrentPage({ ...currentPage, forCategories: newCurrentPage });
            setIsGetCategories(false);
        }
        if (section === "products") {
            setIsGetProducts(true);
            const newCurrentPage = currentPage.forProducts - 1;
            setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize)).data);
            setCurrentPage({ ...currentPage, forProducts: newCurrentPage });
            setIsGetProducts(false);
        }
    }

    const getNextPage = async (section) => {
        if (section === "categories") {
            setIsGetCategories(true);
            const newCurrentPage = currentPage.forCategories + 1;
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(newCurrentPage, pageSize)).data);
            setCurrentPage({ ...currentPage, forCategories: newCurrentPage });
            setIsGetCategories(false);
        }
        if (section === "products") {
            setIsGetProducts(true);
            const newCurrentPage = currentPage.forProducts + 1;
            setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize)).data);
            setCurrentPage({ ...currentPage, forProducts: newCurrentPage });
            setIsGetProducts(false);
        }
    }

    const getSpecificPage = async (pageNumber, section) => {
        if (section === "categories") {
            setIsGetCategories(true);
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(pageNumber, pageSize)).data);
            setCurrentPage({ ...currentPage, forCategories: pageNumber });
            setIsGetCategories(false);
        }
        if (section === "products") {
            setIsGetProducts(true);
            setAllProductsInsideThePage((await getAllProductsInsideThePage(pageNumber, pageSize)).data);
            setCurrentPage({ ...currentPage, forProducts: pageNumber });
            setIsGetProducts(false);
        }
    }

    return (
        <div className="home page">
            <Head>
                <title>Ubuyblues Store - Home</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <Header />
                <div className="navigate-to-up-button">
                    {appearedNavigateIcon === "up" && <RiArrowUpDoubleFill className="arrow-up arrow-icon" onClick={() => navigateToUpOrDown("up")} />}
                    {appearedNavigateIcon === "down" && <RiArrowDownDoubleFill className="arrow-down arrow-icon" onClick={() => navigateToUpOrDown("down")} />}
                </div>
                {/* Start Share Options Box */}
                {isDisplayShareOptionsBox && <ShareOptionsBox setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox} />}
                {/* End Share Options Box */}
                <div className="page-content">
                    <div className="container-fluid">
                        {/* Start Categories Section */}
                        <section className="categories mb-5 pb-5" id="categories">
                            <h2 className="section-name text-center mb-4 text-white">{t("Categories")}</h2>
                            {allCategoriesInsideThePage.length === 0 && !isGetCategories && <p className="alert alert-danger w-100">Sorry, Can't Find Any Categories !!</p>}
                            {isGetCategories && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                                <span className="loader-table-data"></span>
                            </div>}
                            <div className="row mb-5">
                                {allCategoriesInsideThePage.map((category) => (
                                    <div className="col-md-3" key={category._id}>
                                        <div className="category-details p-3">
                                            <Link href={`/categories/${category._id}`} className="product-by-category-link text-dark">
                                                <h5 className="cateogory-name mb-3">{category.name}</h5>
                                                <MdKeyboardArrowRight className="forward-arrow-icon" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {totalPagesCount.forCategories > 1 && !isGetCategories &&
                                <PaginationBar
                                    totalPagesCount={totalPagesCount.forCategories}
                                    currentPage={currentPage.forCategories}
                                    getPreviousPage={getPreviousPage}
                                    getNextPage={getNextPage}
                                    getSpecificPage={getSpecificPage}
                                    paginationButtonTextColor={"#FFF"}
                                    paginationButtonBackgroundColor={"transparent"}
                                    activePaginationButtonColor={"#000"}
                                    activePaginationButtonBackgroundColor={"#FFF"}
                                    isDisplayCurrentPageNumberAndCountOfPages={false}
                                    isDisplayNavigateToSpecificPageForm={false}
                                    section="categories"
                                />
                            }
                        </section>
                        {/* End Categories Section */}
                        {/* Start Last Added Products */}
                        <section className="last-added-products mb-5 pb-3" id="latest-added-products">
                            <h2 className="section-name text-center mb-4 text-white">{t("Last Added Products")}</h2>
                            <div className="row products-box pt-4 pb-4">
                                {allProductsInsideThePage.length > 0 && allProductsInsideThePage.map((product) => (
                                    <div className="col-xs-12 col-lg-6 col-xl-4" key={product._id}>
                                        <ProductCard
                                            product={product}
                                            setIsDisplayShareOptionsBox={setIsDisplayShareOptionsBox}
                                            usdPriceAgainstCurrency={usdPriceAgainstCurrency}
                                            currencyNameByCountry={currencyNameByCountry}
                                            token={token}
                                            isFavoriteProductForUserAsProperty={isFavoriteProductForUser(favoriteProductsListForUser, product._id)}
                                        />
                                    </div>
                                ))}
                                {totalPagesCount.forProducts > 1 && !isGetProducts &&
                                    <PaginationBar
                                        totalPagesCount={totalPagesCount.forProducts}
                                        currentPage={currentPage.forProducts}
                                        getPreviousPage={getPreviousPage}
                                        getNextPage={getNextPage}
                                        getSpecificPage={getSpecificPage}
                                        paginationButtonTextColor={"#FFF"}
                                        paginationButtonBackgroundColor={"transparent"}
                                        activePaginationButtonColor={"#000"}
                                        activePaginationButtonBackgroundColor={"#FFF"}
                                        section="products"
                                    />}
                            </div>
                        </section>
                        {/* End Last Added Products */}
                        {appearedSections.includes("brands") && allBrands.length > 0 && <section className="brands mb-5">
                            <h2 className="section-name text-center mb-5 text-white">{t("Brands")}</h2>
                            <div className="container-fluid">
                                <Slider
                                    dots={true}
                                    arrows={false}
                                    infinite={false}
                                    speed={500}
                                    slidesToShow={getAppearedSlidesCount(windowInnerWidth, allBrands.length)}
                                    slidesToScroll={getAppearedSlidesCount(windowInnerWidth, allBrands.length)}
                                >
                                    {allBrands.map((brand) => (
                                        <div className="brand-box mb-4" key={brand._id}>
                                            <div className="brand-image-box mb-4">
                                                <a
                                                    href="https://google.com"
                                                    target="_blank"
                                                >
                                                    <img
                                                        src={`${process.env.BASE_API_URL}/${brand.imagePath}`}
                                                        alt={`${brand.title} Brand Image`}
                                                    />
                                                </a>
                                            </div>
                                            <h2 className="text-white text-center">{brand.title}</h2>
                                        </div>
                                    ))}
                                </Slider>
                            </div>
                        </section>}
                        <div className="contact-icons-box" onClick={() => setIsDisplayContactIcons(value => !value)}>
                            <ul className="contact-icons-list">
                                {isDisplayContactIcons && <li className="contact-icon-item mb-3">
                                    <a href="mailto:info@asfourintlco.com" target="_blank"><MdOutlineMail className="mail-icon" /></a>
                                </li>}
                                {isDisplayContactIcons && appearedSections.includes("whatsapp button") && <li className="contact-icon-item mb-3">
                                    <a href="https://wa.me/96560048235?text=welcome" target="_blank"><FaWhatsapp className="whatsapp-icon" /></a>
                                </li>}
                                {!isDisplayContactIcons && <li className="contact-icon-item"><MdOutlineContactPhone className="contact-icon" /></li>}
                                {isDisplayContactIcons && <li className="contact-icon-item"><FaTimes className="close-icon" /></li>}
                            </ul>
                        </div>
                        {/* End Contact Icons Box */}
                    </div>
                    <Footer />
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div >
    );
}

export async function getServerSideProps({ query }) {
    const allowedCountries = ["kuwait", "germany", "turkey"];
    if (query.country) {
        if (!allowedCountries.includes(query.country)) {
            return {
                redirect: {
                    permanent: false,
                    destination: "/",
                },
                props: {
                    countryAsProperty: "kuwait",
                },
            }
        }
        if (Object.keys(query).filter((key) => key !== "country").length > 1) {
            return {
                redirect: {
                    permanent: false,
                    destination: `/?country=${query.country}`,
                },
                props: {
                    countryAsProperty: query.country,
                },
            }
        }
        return {
            props: {
                countryAsProperty: query.country,
            },
        }
    }
    return {
        props: {
            countryAsProperty: "kuwait",
        },
    }
}