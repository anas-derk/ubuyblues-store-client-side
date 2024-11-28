import Link from "next/link";
import { RxDashboard } from "react-icons/rx";
import { LuShoppingBag } from "react-icons/lu";
import { HiOutlineHome } from "react-icons/hi";
import { BsPerson } from "react-icons/bs";
import { MdOutlineFavoriteBorder, MdOutlineLogout } from "react-icons/md";
import { useRouter } from "next/router";
import { IoWalletOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { getAnimationSettings, getInitialStateForElementBeforeAnimation } from "../../../public/global_functions/popular";

export default function CustomerDashboardSideBar() {

    const router = useRouter();

    const { i18n, t } = useTranslation();

    const userLogout = () => {
        localStorage.removeItem(process.env.userTokenNameInLocalStorage);
        router.push("/auth");
    }

    return (
        <aside className="customer-dashboard-side-bar managment-links-side-bar bg-white">
            <ul className="managment-customer-account-link-list managment-link-list">
                <motion.li
                    className="managment-customer-account-link-item managment-link-item"
                    initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                >
                    <Link
                        href="/customer-dashboard"
                        className={`text-dark w-100 d-block managment-customer-account-link managment-link fw-bold ${router.pathname === "/customer-dashboard" && "active"}`}
                    >
                        <RxDashboard className={`customer-account-managment-link-icon managment-link-icon ${i18n.language !== "ar" ? "me-3" : "ms-3"}`} />
                        <span className="customer-dashboard-link-name managment-link-name">{t("Dashboard")}</span>
                    </Link>
                </motion.li>
                <motion.li
                    className="managment-customer-account-link-item managment-link-item"
                    initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                >
                    <Link
                        href="/customer-dashboard/orders"
                        className={`text-dark w-100 d-block managment-customer-account-link managment-link fw-bold ${router.pathname === "/customer-dashboard/orders" && "active"}`}
                    >
                        <LuShoppingBag className={`customer-account-managment-link-icon managment-link-icon ${i18n.language !== "ar" ? "me-3" : "ms-3"}`} />
                        <span className="customer-dashboard-link-name managment-link-name">{t("Orders")}</span>
                    </Link>
                </motion.li>
                <motion.li
                    className="managment-customer-account-link-item managment-link-item"
                    initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                >
                    <Link
                        href="/customer-dashboard/addreses"
                        className={`text-dark w-100 d-block managment-customer-account-link managment-link fw-bold ${(router.pathname === "/customer-dashboard/addreses" || router.pathname === "/customer-dashboard/addreses/billing-address" || router.pathname === "/customer-dashboard/addreses/shipping-address") && "active"}`}
                    >
                        <HiOutlineHome className={`customer-account-managment-link-icon managment-link-icon ${i18n.language !== "ar" ? "me-3" : "ms-3"}`} />
                        <span className="customer-dashboard-link-name managment-link-name">{t("Addresses")}</span>
                    </Link>
                </motion.li>
                <motion.li
                    className="managment-customer-account-link-item managment-link-item"
                    initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                >
                    <Link
                        href="/customer-dashboard/account-details"
                        className={`text-dark w-100 d-block managment-customer-account-link managment-link fw-bold ${router.pathname === "/customer-dashboard/account-details" && "active"}`}
                    >
                        <BsPerson className={`customer-account-managment-link-icon ${i18n.language !== "ar" ? "me-3" : "ms-3"}`} />
                        <span className="customer-dashboard-link-name managment-link-name">{t("Account Details")}</span>
                    </Link>
                </motion.li>
                <motion.li
                    className="managment-customer-account-link-item managment-link-item"
                    initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                >
                    <Link
                        href="/customer-dashboard/favorite-products"
                        className={`text-dark w-100 d-block managment-customer-account-link managment-link fw-bold ${router.pathname === "/customer-dashboard/favorite-products" && "active"}`}
                    >
                        <MdOutlineFavoriteBorder className={`customer-account-managment-link-icon ${i18n.language !== "ar" ? "me-3" : "ms-3"}`} />
                        <span className="customer-dashboard-link-name managment-link-name">{t("Favorite Products")}</span>
                    </Link>
                </motion.li>
                <motion.li
                    className="managment-customer-account-link-item managment-link-item"
                    initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                >
                    <Link
                        href="/customer-dashboard/wallet"
                        className={`text-dark w-100 d-block managment-customer-account-link managment-link fw-bold ${router.pathname === "/customer-dashboard/wallet" && "active"}`}
                    >
                        <IoWalletOutline className={`customer-account-managment-link-icon ${i18n.language !== "ar" ? "me-3" : "ms-3"}`} />
                        <span className="customer-dashboard-link-name managment-link-name">{t("Wallet")}</span>
                    </Link>
                </motion.li>
                <motion.li
                    className="managment-customer-account-link-item managment-link-item"
                    initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}
                    onClick={userLogout}
                >
                    <Link href="#" className="text-dark w-100 d-block managment-customer-account-link managment-link fw-bold">
                        <MdOutlineLogout className={`customer-account-managment-link-icon ${i18n.language !== "ar" ? "me-3" : "ms-3"}`} />
                        <span className="customer-dashboard-link-name managment-link-name">{t("Logout")}</span>
                    </Link>
                </motion.li>
            </ul>
        </aside>
    );
}