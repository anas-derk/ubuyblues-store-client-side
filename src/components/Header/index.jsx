import { AiOutlineHome } from "react-icons/ai";
import { BsFillPersonFill } from "react-icons/bs";
import { IoEarth } from "react-icons/io5";

export default function Header() {
    return (
        <header className="global-header">
            <div className="container-fluid text-end">
                <div className="navigate-icons p-3">
                    <BsFillPersonFill className="home-icon global-header-icon me-5" />
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