import Link from "next/link";
import { useState, useEffect } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { BsFillSuitHeartFill, BsFillPersonFill, BsPersonVcard } from "react-icons/bs";
import { MdOutlineLogout } from "react-icons/md";
import { useRouter } from "next/router";
import { MdOutlineDarkMode, MdOutlineWbSunny } from "react-icons/md";
import { useTranslation } from "react-i18next";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import ubuybluesLogo from "../../../public/images/UbuyBlues_Logo_merged_Purple.jpg";
import { FaShoppingCart } from "react-icons/fa";

export default function Header() {

    const [lightMode, setLightMode] = useState("sunny");

    const [token, setToken] = useState("");

    const router = useRouter();

    const { i18n, t } = useTranslation();

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.userTokenNameInLocalStorage);
        if (userToken) {
            setToken(userToken);
        }
        const tempLightMode = localStorage.getItem("asfour-store-light-mode");
        if (tempLightMode && (tempLightMode === "dark" || tempLightMode === "sunny")) {
            setLightMode(tempLightMode);
            let rootElement = document.documentElement;
            rootElement.style.setProperty("--main-color-one", tempLightMode === "sunny" ? "#6A017A" : "#000");
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
        localStorage.setItem("asfour-store-language", language);
    }

    const handleSelectCountry = async (country) => {
        try {
            switch (country) {
                case "kuwait": {
                    await router.replace({
                        pathname: router.pathname,
                        query: {
                            ...router.query,
                            country,
                        }
                    });
                    localStorage.setItem("asfour-store-country", country);
                    return;
                }
                case "germany": {
                    await router.replace({
                        pathname: router.pathname,
                        query: {
                            ...router.query,
                            country,
                        }
                    });
                    localStorage.setItem("asfour-store-country", country);
                    return;
                }
                case "turkey": {
                    await router.replace({
                        pathname: router.pathname,
                        query: {
                            ...router.query,
                            country,
                        }
                    });
                    localStorage.setItem("asfour-store-country", country);
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
            <Navbar expand="lg" className="bg-body-tertiary bg-white" fixed="top">
                <Container fluid>
                    <Navbar.Brand href="/" as={Link}>
                        <img src={ubuybluesLogo.src} alt="asfour logo for footer" className="ubuyblues-logo" width="75" height="75" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav>
                            <Nav.Link href="/" as={Link}>
                                <AiOutlineHome className={`home-icon global-header-icon ${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                {t("Home")}
                            </Nav.Link>
                            {!token && <Nav.Link href="/auth" as={Link}>
                                <BsFillPersonFill className={`home-icon global-header-icon ${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                {t("Login / Register")}
                            </Nav.Link>}
                            <Nav.Link href="/add-your-store" as={Link}>
                                <AiOutlineHome className={`home-icon global-header-icon ${i18n.language !== "ar" ? "me-2" : "ms-2"}`} />
                                {t("Add Your Store")}
                            </Nav.Link>
                            <NavDropdown title={t("Languages")} id="products-nav-dropdown">
                                <NavDropdown.Item onClick={() => handleChangeLanguage("ar")}>{t("Arabic")}</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={() => handleChangeLanguage("en")}>{t("English")}</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={() => handleChangeLanguage("tr")}>{t("Turkey")}</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={() => handleChangeLanguage("de")}>{t("Germany")}</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title={t("Countries")} id="products-nav-dropdown">
                                <NavDropdown.Item onClick={() => handleSelectCountry("kuwait")}>{t("KW")}</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={() => handleSelectCountry("germany")}>{t("DE")}</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={() => handleSelectCountry("turkey")}>{t("TR")}</NavDropdown.Item>
                            </NavDropdown>
                            <Nav.Link href="/cart" as={Link}>
                                <FaShoppingCart className="cart-icon link-icon" />
                            </Nav.Link>
                            <Nav.Link href="/customer-dashboard/favorite-products" as={Link}>
                                <BsFillSuitHeartFill className="cart-icon link-icon" />
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
                                    <BsPersonVcard className="user-icon link-icon" />
                                </Nav.Link>
                                <button className="btn btn-danger logout-btn" onClick={userLogout}>
                                    <MdOutlineLogout className={i18n.language !== "ar" ? "me-2" : "ms-2"} />
                                    <span>{t("Logout")}</span>
                                </button>
                            </>}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}