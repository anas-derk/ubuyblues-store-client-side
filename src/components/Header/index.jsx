import Link from "next/link";
import { useState, useEffect } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { BsFillPersonFill, BsPersonVcard } from "react-icons/bs";
import { IoEarth } from "react-icons/io5";
import { MdOutlineLogout } from "react-icons/md";
import { useRouter } from "next/router";
import { MdOutlineDarkMode, MdOutlineWbSunny } from "react-icons/md";

export default function Header() {

    const [userId, setUserId] = useState("");

    const [lightMode, setLightMode] = useState("sunny");

    const handleChangeMode = () => {
        const newLightMode = lightMode == "sunny" ? "dark" : "sunny";
        setLightMode(newLightMode);
        let rootElement = document.documentElement;
        rootElement.style.setProperty("--main-color-one", newLightMode === "sunny" ? "#6A017A" : "#000");
        localStorage.setItem("asfour-store-light-mode", newLightMode);
    }

    const router = useRouter();

    useEffect(() => {
        const userId = localStorage.getItem("asfour-store-user-id");
        setUserId(userId);
        const tempLightMode = localStorage.getItem("asfour-store-light-mode");
        if (tempLightMode && (tempLightMode === "dark" || tempLightMode === "sunny")) {
            setLightMode(tempLightMode);
            let rootElement = document.documentElement;
            rootElement.style.setProperty("--main-color-one", tempLightMode === "sunny" ? "#6A017A" : "#000");
        }
    }, []);

    const userLogout = () => {
        localStorage.removeItem("asfour-store-user-id");
        router.push("/auth");
    }

    return (
        <header className="global-header">
            <div className="container-fluid text-end">
                <div className="navigate-icons p-3">
                    {!userId ? <Link href="/auth">
                        <BsFillPersonFill className="home-icon global-header-icon me-5" />
                    </Link> : <>
                        <MdOutlineLogout className="logout-icon global-header-icon me-5" onClick={userLogout} />
                        <Link href="/customer-dashboard">
                            <BsPersonVcard className="home-icon global-header-icon me-5" />
                        </Link>
                    </>}
                    <Link href="/">
                        <AiOutlineHome className="home-icon global-header-icon" />
                    </Link>
                </div>
                <div className="languages-and-others-stores p-3">
                    {lightMode == "sunny" ?
                        <MdOutlineDarkMode
                            className="dark-mode-icon global-header-icon me-5"
                            onClick={handleChangeMode}
                        /> :
                        <MdOutlineWbSunny
                            className="sunny-icon global-header-icon me-5"
                            onClick={handleChangeMode}
                        />}
                    <IoEarth className="earth-icon global-header-icon me-5" />
                    <Link href="/">
                        <AiOutlineHome className="home-icon global-header-icon" />
                    </Link>
                </div>
            </div>
        </header>
    );
}