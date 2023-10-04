import Logo from "../../../public/images/Logo-ASFOUR-White-footer.png";

export default function AdminDashboardSideBar() {
    return (
        <aside className="admin-dashboard-side-bar pt-3">
            <img src={Logo.src} alt="logo" width="100" height="100" className="d-block mx-auto logo-img" />
            <hr className="mb-0" />
            <ul className="managment-links-list">
                <li className="p-3 managment-link">Products</li>
                <li className="p-3 managment-link">Orders</li>
            </ul>
        </aside>
    );
}