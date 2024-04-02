import Link from "next/link";
import { MdOutlineLogout } from "react-icons/md";
import { useRouter } from "next/router.js";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

export default function AdminPanelHeader() {

    const router = useRouter();

    const adminLogout = async () => {
        localStorage.removeItem("asfour-store-admin-user-token");
        await router.push("/admin-dashboard/login");
    }

    return (
        <header className="admin-panel-header">
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container fluid>
                    <Navbar.Brand href="/admin-dashboard" as={Link}>Ubuyblues Dashboard</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav>
                            <NavDropdown title="Stores" id="brands-nav-dropdown">
                                <NavDropdown.Item href="/admin-dashboard/stores-managment" as={Link}>All Stores</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Global" id="brands-nav-dropdown">
                                <NavDropdown.Item href="/admin-dashboard/show-and-hide-sections-managment" as={Link}>Show / Hide Sections</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/admin-dashboard/change-bussiness-email-password" as={Link}>
                                    Change Bussiness Email Password
                                </NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Products" id="products-nav-dropdown">
                                <NavDropdown.Item href="/admin-dashboard/add-new-product" as={Link}>Add New</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/admin-dashboard/update-and-delete-products" as={Link}>
                                    Update / Delete
                                </NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Categories" id="categories-nav-dropdown">
                                <NavDropdown.Item href="/admin-dashboard/add-new-category" as={Link}>Add New</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/admin-dashboard/update-and-delete-categories" as={Link}>
                                    Update / Delete
                                </NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Orders" id="orders-nav-dropdown">
                                <NavDropdown.Item href="/admin-dashboard/orders-managment" as={Link}>All Orders</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Brands" id="brands-nav-dropdown">
                                <NavDropdown.Item href="/admin-dashboard/add-new-brand" as={Link}>Add New</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/admin-dashboard/update-and-delete-brands" as={Link}>
                                    Update / Delete
                                </NavDropdown.Item>
                            </NavDropdown>
                            <button className="btn btn-danger logout-btn" onClick={adminLogout}>
                                <MdOutlineLogout className="me-2" />
                                <span>Logout</span>
                            </button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}