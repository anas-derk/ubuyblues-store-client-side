import Link from "next/link";
import { RxDashboard } from "react-icons/rx";
import { useTranslation } from "react-i18next";

export default function SubCategoriesForParentSidBar({ subCategories }) {

    const { i18n } = useTranslation();

    return (
        <aside className="sub-categories-for-parent-side-bar managment-links-side-bar bg-white">
            <ul className="managment-customer-account-link-list managment-link-list">
                {subCategories.map((category) => (
                    <li
                        className="managment-customer-account-link-item managment-link-item"
                    >
                        <Link
                            href={`/products-by-category?categoryId=${category._id}`}
                            className="text-dark w-100 d-block managment-link fw-bold"
                        >
                            <RxDashboard className={`managment-link-icon ${i18n.language !== "ar" ? "me-3" : "ms-3"}`} />
                            <span className="managment-link-name">{category.name[i18n.language]}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
}