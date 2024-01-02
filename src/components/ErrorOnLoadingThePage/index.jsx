import { PiSmileySad } from "react-icons/pi";
import Header from "../Header";

export default function ErrorOnLoadingThePage() {
    return (
        <>
            <Header />
            <div className="error-msg-on-loading-the-page d-flex flex-column justify-content-center align-items-center text-white">
                <PiSmileySad className="error-icon mb-5" />
                <p className="error-msg-on-loading-box">Sorry, Something Went Wrong, Please Try Again !!</p>
            </div>
        </>
    );
}