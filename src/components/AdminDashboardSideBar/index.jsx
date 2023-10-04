import Logo from "../../../public/images/Logo-ASFOUR-White-footer.png";
import { MdProductionQuantityLimits } from "react-icons/md";
import Link from "next/link";

export default function AdminDashboardSideBar() {
    return (
        <aside className="admin-dashboard-side-bar pt-3">
            <img src={Logo.src} alt="logo" width="100" height="100" className="d-block mx-auto logo-img" />
            <hr className="mb-0" />
            <ul className="managment-items-list">
                <li className="managment-item p-3">
                    <MdProductionQuantityLimits className="me-2" />
                    <Link href="/admin-dashboard" className="managment-link">
                        Products
                    </Link>
                </li>
            </ul>
        </aside>
    );
}