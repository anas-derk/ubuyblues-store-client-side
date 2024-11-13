import Link from "next/link";
import { useState, useEffect } from "react";
import { AiOutlineAppstoreAdd, AiOutlineHome } from "react-icons/ai";
import { BsFillSuitHeartFill, BsFillPersonFill, BsPersonVcard } from "react-icons/bs";
import { MdOutlineLogout } from "react-icons/md";
import { useRouter } from "next/router";
import { MdOutlineDarkMode, MdOutlineWbSunny } from "react-icons/md";
import { useTranslation } from "react-i18next";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import ubuybluesLogo from "../../../public/images/UbuyBlues_Logo_merged_Purple.webp";
import { FaShoppingCart } from "react-icons/fa";
import { getFavoriteProductsCount, getProductsByIds } from "../../../public/global_functions/popular";
import { useDispatch, useSelector } from "react-redux";

export default function Header() {

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [lightMode, setLightMode] = useState("sunny");

    const [token, setToken] = useState("");

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

    const router = useRouter();

    const { i18n, t } = useTranslation();

    const dispatch = useDispatch();

    const state = useSelector(state => state);

    useEffect(() => {
        setWindowInnerWidth(window.innerWidth);
        window.addEventListener("resize", () => {
            setWindowInnerWidth(window.innerWidth);
        });
        const tempLightMode = localStorage.getItem("asfour-store-light-mode");
        if (tempLightMode && (tempLightMode === "dark" || tempLightMode === "sunny")) {
            setLightMode(tempLightMode);
            let rootElement = document.documentElement;
            rootElement.style.setProperty("--main-color-one", tempLightMode === "sunny" ? "#6A017A" : "#000");
        }
    }, []);

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
        if (userToken) {
            setToken(userToken);
            getFavoriteProductsCount()
                .then((result) => {
                    if (!result.error) {
                        dispatch({
                            type: "(Add / Delete) (To / From ) Favorite",
                            productsCountInFavorite: result.data
                        });
                    }
                })
                .catch((err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
                    }
                    else {
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                    }
                });
        }
    }, []);

    useEffect(() => {
        let tempAllProductsDataInsideTheCart = JSON.parse(localStorage.getItem(process.env.userCartNameInLocalStorage));
        if (Array.isArray(tempAllProductsDataInsideTheCart)) {
            getProductsByIds(tempAllProductsDataInsideTheCart.map((product) => product._id))
                .then((result) => {
                    let tempProductsCountInCart = 0, tempProductsIds = [];
                    result.data.productByIds.forEach((storeProducts) => {
                        tempProductsCountInCart += storeProducts.products.length;
                        storeProducts.products.forEach((product) => {
                            tempProductsIds.push(product._id);
                        });
                    });
                    localStorage.setItem(process.env.userCartNameInLocalStorage, JSON.stringify(tempAllProductsDataInsideTheCart.filter((product) => tempProductsIds.includes(product._id))));
                    dispatch({
                        type: "(Add / Delete) (To / From ) Cart",
                        productsCountInCart: tempProductsCountInCart
                    });
                })
                .catch((err) => {
                    setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                });
        }
    }, []);

    const handleChangeMode = () => {
        const newLightMode = lightMode == "sunny" ? "dark" : "sunny";
        setLightMode(newLightMode);
        let rootElement = document.documentElement;
        rootElement.style.setProperty("--main-color-one", newLightMode === "sunny" ? "#6A017A" : "#000");
        localStorage.setItem("asfour-store-light-mode", newLightMode);
    }

    const userLogout = async () => {
        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
        await router.push("/auth");
    }

    const handleChangeLanguage = (language) => {
        i18n.changeLanguage(language);
        document.body.lang = language;
        localStorage.setItem(process.env.userlanguageFieldNameInLocalStorage, language);
    }

    const handleSelectCountry = async (country) => {
        try {
            switch (country) {
                case "kuwait": {
                    localStorage.setItem(process.env.selectedCountryByUser, country);
                    await router.replace({
                        pathname: router.pathname,
                        query: {
                            ...router.query,
                            country,
                        }
                    });
                    return;
                }
                case "germany": {
                    localStorage.setItem(process.env.selectedCountryByUser, country);
                    await router.replace({
                        pathname: router.pathname,
                        query: {
                            ...router.query,
                            country,
                        }
                    });
                    return;
                }
                case "turkey": {
                    localStorage.setItem(process.env.selectedCountryByUser, country);
                    await router.replace({
                        pathname: router.pathname,
                        query: {
                            ...router.query,
                            country,
                        }
                    });
                    return
                }
                default: {
                    return "Sorry, Invalid Country !!";
                }
            }

        }
        catch (err) {
            return err;
        }
    }

    return (
        <header className="global-header">
            <Navbar expand="lg" className="bg-body-tertiary pb-1 pt-1" fixed="top">
                <Container fluid>
                    <Navbar.Brand href="/" as={Link}>
                        <img src={ubuybluesLogo.src} alt="ubuyblues logo for header" className="ubuyblues-logo" width="70" height="70" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        {!errorMsgOnLoadingThePage ? <Nav>
                            <Nav.Link href="/" as={Link}>
                                <AiOutlineHome className={`home-icon global-header-icon ${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                {t("Home")}
                            </Nav.Link>
                            {!token && <Nav.Link href="/auth" as={Link}>
                                <BsFillPersonFill className={`home-icon global-header-icon ${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                {t("Login / Register")}
                            </Nav.Link>}
                            <Nav.Link href="/add-your-store" as={Link}>
                                <AiOutlineAppstoreAdd className={`home-icon global-header-icon ${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                {t("Add Your Store")}
                            </Nav.Link>
                            <NavDropdown title={t("Languages")} id="products-nav-dropdown">
                                <NavDropdown.Item onClick={() => handleChangeLanguage("ar")}>{t("Arabic")}</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={() => handleChangeLanguage("en")}>{t("English")}</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={() => handleChangeLanguage("tr")}>{t("Turkish")}</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={() => handleChangeLanguage("de")}>{t("German")}</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title={t("Countries")} id="products-nav-dropdown">
                                <NavDropdown.Item onClick={() => handleSelectCountry("kuwait")}>{t("KW")}</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={() => handleSelectCountry("germany")}>{t("DE")}</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={() => handleSelectCountry("turkey")}>{t("TR")}</NavDropdown.Item>
                            </NavDropdown>
                            <Nav.Link href="/cart" as={Link} className={windowInnerWidth > 991 && "ps-4 pe-4"}>
                                <div className="d-inline icon-box">
                                    <FaShoppingCart className={`cart-icon link-icon ${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                    <span
                                        className="products-count-in-cart-box products-count-box"
                                        style={i18n.language !== "ar" ? {
                                            right: "-20px",
                                            top: "-10px"
                                        } : {
                                            left: "-20px",
                                            top: "-10px"
                                        }}
                                    >{state.productsCountInCart}</span>
                                </div>
                            </Nav.Link>
                            <Nav.Link href="/customer-dashboard/favorite-products" as={Link} className={token && windowInnerWidth > 991 && "ps-4 pe-4"}>
                                <div className="d-inline icon-box">
                                    <BsFillSuitHeartFill className={`favorite-icon link-icon ${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                    {token && <span
                                        className="products-count-in-favorite-box products-count-box"
                                        style={i18n.language !== "ar" ? {
                                            right: "-20px",
                                            top: "-10px"
                                        } : {
                                            left: "-20px",
                                            top: "-10px"
                                        }}
                                    >{state.productsCountInFavorite}</span>}
                                </div>
                            </Nav.Link>
                            {lightMode == "sunny" ?
                                <MdOutlineDarkMode
                                    className="dark-mode-icon global-header-icon ms-2 me-2"
                                    onClick={handleChangeMode}
                                /> :
                                <MdOutlineWbSunny
                                    className="sunny-icon global-header-icon ms-2 me-2"
                                    onClick={handleChangeMode}
                                />}
                            {token && <>
                                <Nav.Link href="/customer-dashboard" as={Link}>
                                    <BsPersonVcard className={`user-icon link-icon ${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                    {t("Profile")}
                                </Nav.Link>
                                <button className="btn btn-danger logout-btn" onClick={userLogout}>
                                    <MdOutlineLogout className={i18n.language !== "ar" ? "me-2" : "ms-2"} />
                                    <span>{t("Logout")}</span>
                                </button>
                            </>}
                        </Nav> : <p className="alert alert-danger m-0 w-100 text-center fw-bold">{errorMsgOnLoadingThePage}</p>}
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}