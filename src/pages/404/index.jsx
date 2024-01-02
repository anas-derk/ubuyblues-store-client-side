import Head from "next/head";
import ubuybluesLogo from "../../../public/images/UbuyBlues_Logo_merged_White.png";
import { BiError } from "react-icons/bi";
import Link from "next/link";

export default function PageNotFound() {
    return (
        <div className="page-not-found d-flex align-items-center justify-content-center flex-column">
            <Head>
                <title>Ubuyblues Store - Page Not Found</title>
            </Head>
            <div className="page-content p-4 text-center">
                <img src={ubuybluesLogo.src} alt="asfour logo !" className="mb-4 d-block mx-auto" />
                <BiError className="error-404-icon" />
                <h1 className="mb-3">Sorry,</h1>
                <h2 className="mb-3">this page could not be found.</h2>
                <h3 className="mb-4">Something went wrong.</h3>
                <h3 className="mb-4">The page you were looking for could not be found. Please check the URL</h3>
                <Link href="/" className="home-page-link">Or Go To Home Page</Link>
            </div>
        </div>
    );
}