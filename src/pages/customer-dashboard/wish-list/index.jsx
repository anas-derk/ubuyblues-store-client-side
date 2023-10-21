import Head from "next/head";
import Header from "@/components/Header";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import { useEffect, useState } from "react";
import Axios from "axios";
import { BsTrash } from "react-icons/bs";

export default function CustomerWishList() {
    const [favoriteProductsListForUser, setFavoriteProductsListForUser] = useState([]);
    useEffect(() => {
        const userId = localStorage.getItem("asfour-store-user-id");
        if (userId) {
            Axios.get(`${process.env.BASE_API_URL}/users/favorite-products/${userId}`)
                .then((res) => {
                    setFavoriteProductsListForUser(res.data);
                });
        }
    }, []);
    return (
        <div className="customer-wish-list">
            <Head>
                <title>Asfour Store - Customer Wish List</title>
            </Head>
            <Header />
            <div className="page-content d-flex align-items-center">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-3">
                            <CustomerDashboardSideBar />
                        </div>
                        <div className="col-md-9">
                            {favoriteProductsListForUser.length > 0 && <section className="favorite-products-list-for-user text-center">
                                <table className="favorite-products-table-for-user w-100">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Unit Price</th>
                                            <th>Stock Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {favoriteProductsListForUser.map((favoriteProduct) => (
                                            <tr>
                                                <td>
                                                    <img
                                                        src={`${process.env.BASE_API_URL}/${favoriteProduct.imagePath}`}
                                                        alt="favorite product image"
                                                        className="favorite-product-image d-block mx-auto mb-3"
                                                        width="100"
                                                        height="100"
                                                    />
                                                    <h5>{ favoriteProduct.name }</h5>
                                                </td>
                                                <td>{ favoriteProduct.price - favoriteProduct.discount } $</td>
                                                <td>Stock Status</td>
                                                <td>
                                                    <BsTrash className="delete-product-from-favorite-user-list-icon" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}