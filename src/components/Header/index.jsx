import Link from "next/link";
import { useState, useEffect } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { BsFillPersonFill, BsPersonVcard } from "react-icons/bs";
import { IoEarth } from "react-icons/io5";
import { MdOutlineLogout } from "react-icons/md";
import { useRouter } from "next/router";

export default function Header() {

    const [userId, setUserId] = useState("");

    const router = useRouter();

    useEffect(() => {
        const userId = localStorage.getItem("asfour-store-user-id");
        setUserId(userId);
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
                    <AiOutlineHome className="home-icon global-header-icon" />
                </div>
                <div className="languages-and-others-stores p-3">
                    <IoEarth className="earth-icon global-header-icon me-5" />
                    <AiOutlineHome className="home-icon global-header-icon" />
                </div>
            </div>
        </header>
    );
}