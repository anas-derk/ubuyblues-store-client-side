import Link from "next/link";
import AsfourLogoForFooter from "../../../public/images/Logo-ASFOUR-White-footer.png";

export default function Footer() {
    return (
        <footer className="p-5 text-center">
            <div className="container-fluid">
                <div className="row align-items-center">
                    <div className="col-md-4">
                        <img src={AsfourLogoForFooter.src} alt="asfour logo for footer" className="asfour-logo-for-footer" />
                    </div>
                    <div className="col-md-4">
                        <Link href="/" className="text-dark d-block link-btn mb-2 fw-bold">About Us</Link>
                        <Link href="/" className="text-dark d-block link-btn mb-2 fw-bold">Contact Us</Link>
                        <Link href="/" className="text-dark d-block link-btn mb-2 fw-bold">Polices-Terms & Conditions</Link>
                        <Link href="/" className="text-dark d-block link-btn mb-2 fw-bold">Return & Refund Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}