import { PiSmileySad } from "react-icons/pi";

export default function NotFoundError({ errorMsg }) {
    return (
        <div className="not-found-product not-found-error text-center d-flex flex-column justify-content-center align-items-center">
            <PiSmileySad className="sorry-icon mb-5" />
            <h3 className="h5">{errorMsg}</h3>
        </div>
    );
}