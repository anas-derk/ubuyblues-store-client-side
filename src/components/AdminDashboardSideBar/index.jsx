import Logo from "../../../public/images/Logo-ASFOUR-White-footer.png";
import { MdProductionQuantityLimits } from "react-icons/md";
import Link from "next/link";
import { useState } from "react";

export default function AdminDashboardSideBar({ activeParentLink, activeChildLink }) {
    const [activeLinks, setActiveLinks] = useState(activeParentLink);
    return (
        <aside className="admin-dashboard-side-bar pt-3">
            <img src={Logo.src} alt="logo" width="100" height="100" className="d-block mx-auto logo-img" />
            <hr className="mb-0" />
            <ul className="managment-items-list">
                <li
                    className={`managment-item p-3 ${activeLinks === "products-managment" ? "active" : ""}`}
                    onClick={() => activeLinks ? setActiveLinks("") : setActiveLinks("products-managment")}
                >
                    <MdProductionQuantityLimits className="me-2" />
                    <button
                        className="managment-button btn p-0"
                    >
                        <span>Products</span>
                    </button>
                </li>
                {activeLinks === "products-managment" && <ul className="links-list">
                    <li className={`link-item p-3 ${activeChildLink === "add-new-product" ? "active" : ""}`}>
                        <Link
                            href={{
                                pathname: "/admin-dashboard/add-new-product",
                                query: {
                                    activeParentLink: "products-managment",
                                    activeChildLink: "add-new-product"
                                }
                            }}
                            className="managment-link p-0"
                        >
                            <span>Add New</span>
                        </Link>
                    </li>
                    <li className="link-item p-3">
                        <Link href="/" className="managment-link p-0">
                            <span>Update / Delete</span>
                        </Link>
                    </li>
                </ul>}
            </ul>
        </aside>
    );
}