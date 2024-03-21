import { PiSmileySad } from "react-icons/pi";

export default function NotFoundError({ errorMsg }) {
    return (
        <div className="not-found-product not-found-error text-center d-flex flex-column justify-content-center align-items-center">
            <PiSmileySad className="sorry-icon mb-5" />
            <h1 className="h4">{errorMsg}</h1>
        </div>
    );
}