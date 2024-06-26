import { useState, useEffect } from "react";
import { RiArrowDownDoubleFill, RiArrowUpDoubleFill } from "react-icons/ri";

export default function NavigateToUpOrDown() {

    const [appearedNavigateIcon, setAppearedNavigateIcon] = useState("down");

    useEffect(() => {
        window.onscroll = function () { handleScrollToUpAndDown(this) };
    }, []);

    const handleScrollToUpAndDown = (window) => {
        if (window.scrollY > 500) {
            setAppearedNavigateIcon("up");
        } else {
            setAppearedNavigateIcon("down");
        }
    }

    const navigateToUpOrDown = () => {
        if (appearedNavigateIcon === "up") {
            window.scrollTo({
                behavior: "smooth",
                top: 0,
                left: 0,
            });
        } else {
            window.scrollTo({
                behavior: "smooth",
                top: document.querySelector("footer").offsetTop,
                left: 0,
            });
        }
    }
    
    return (
        <div
            className="navigate-to-up-button"
            onClick={navigateToUpOrDown}
        >
            {appearedNavigateIcon === "up" ? <RiArrowUpDoubleFill className="arrow-up arrow-icon" /> : <RiArrowDownDoubleFill className="arrow-down arrow-icon" />}
        </div>
    );
}