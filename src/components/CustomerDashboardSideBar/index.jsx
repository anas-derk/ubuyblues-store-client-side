import Link from "next/link";
import { RxDashboard } from "react-icons/rx";
import { LuShoppingBag } from "react-icons/lu";
import { HiOutlineHome } from "react-icons/hi";
import { BsPerson } from "react-icons/bs";
import { MdOutlineFavoriteBorder, MdOutlineLogout } from "react-icons/md";
import { useRouter } from "next/router";

export default function CustomerDashboardSideBar() {
    const router = useRouter();
    const userLogout = () => {
        localStorage.removeItem("asfour-store-user-id");
        router.push("/auth");
    }
    return (
        <aside className="customer-dashboard-side-bar bg-white">
            <ul className="managment-customer-account-link-list">
                <li
                    className="managment-customer-account-link-item"
                >
                    <Link href="/customer-dashboard" className="text-dark w-100 d-block p-4 managment-customer-account-link fw-bold">
                        <RxDashboard className="me-3 customer-account-managment-link-icon" />
                        <span className="customer-dashboard-link-name">Dashboard</span>
                    </Link>
                </li>
                <li
                    className="managment-customer-account-link-item"
                >
                    <Link href="/customer-dashboard" className="text-dark w-100 d-block p-4 managment-customer-account-link fw-bold">
                        <LuShoppingBag className="me-3 customer-account-managment-link-icon" />
                        <span className="customer-dashboard-link-name">Orders</span>
                    </Link>
                </li>
                <li
                    className="managment-customer-account-link-item"
                >
                    <Link href="/customer-dashboard" className="text-dark w-100 d-block p-4 managment-customer-account-link fw-bold">
                        <HiOutlineHome className="me-3 customer-account-managment-link-icon" />
                        <span className="customer-dashboard-link-name">Addresses</span>
                    </Link>
                </li>
                <li
                    className="managment-customer-account-link-item"
                >
                    <Link href="/customer-dashboard" className="text-dark w-100 d-block p-4 managment-customer-account-link fw-bold">
                        <BsPerson className="me-3 customer-account-managment-link-icon" />
                        <span className="customer-dashboard-link-name">Account Details</span>
                    </Link>
                </li>
                <li
                    className="managment-customer-account-link-item"
                >
                    <Link href="/customer-dashboard" className="text-dark w-100 d-block p-4 managment-customer-account-link fw-bold">
                        <MdOutlineFavoriteBorder className="me-3 customer-account-managment-link-icon" />
                        <span className="customer-dashboard-link-name">Wish List</span>
                    </Link>
                </li>
                <li
                    className="managment-customer-account-link-item"
                    onClick={userLogout}
                >
                    <Link href="#" className="text-dark w-100 d-block p-4 managment-customer-account-link fw-bold">
                        <MdOutlineLogout className="me-3 customer-account-managment-link-icon" />
                        <span className="customer-dashboard-link-name">Logout</span>
                    </Link>
                </li>
            </ul>
        </aside>
    )
}