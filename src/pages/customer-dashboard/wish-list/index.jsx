import Head from "next/head";
import Header from "@/components/Header";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import { useEffect, useState } from "react";
import Axios from "axios";
import { BsTrash, BsClock } from "react-icons/bs";
import { FaCheck } from 'react-icons/fa';
import { useRouter } from "next/router";

export default function CustomerWishList() {
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [userId, setUserId] = useState("");
    const [favoriteProductsListForUser, setFavoriteProductsListForUser] = useState([]);
    const [deletingFavoriteProductIndex, setDeletingFavoriteProductIndex] = useState(-1);
    const [isDeletingFavoriteProduct, setIsDeletingFavoriteProduct] = useState(false);
    const [isSuccessDeletingFavoriteProduct, setIsSuccessDeletingFavoriteProduct] = useState(false);
    const [errorMsgOnDeletingFavoriteProduct, setErrorMsgOnDeletingFavoriteProduct] = useState(false);
    const router = useRouter();
    useEffect(() => {
        const userId = localStorage.getItem("asfour-store-user-id");
        if (userId) {
            setUserId(userId);
            Axios.get(`${process.env.BASE_API_URL}/users/favorite-products/${userId}`)
                .then((res) => {
                    const result = res.data;
                    if (result.length === 0) {
                        router.push("/auth");
                    } else {
                        setFavoriteProductsListForUser(result);
                    }
                });
            setIsLoadingPage(false);
        } else {
            router.push("/auth");
        }
    }, []);
    const deleteProductFromFavoriteUserProducts = async (userId, favoriteProductIndex) => {
        try {
            setDeletingFavoriteProductIndex(favoriteProductIndex);
            setIsDeletingFavoriteProduct(true);
            const res = await Axios.delete(`${process.env.BASE_API_URL}/users/favorite-product?userId=${userId}&productId=${favoriteProductsListForUser[favoriteProductIndex]._id}`)
            const result = await res.data;
            setIsDeletingFavoriteProduct(false);
            setIsSuccessDeletingFavoriteProduct(true);
            let successDeletingFavoriteProductMsgTimeOut = setTimeout(() => {
                setIsSuccessDeletingFavoriteProduct(false);
                setDeletingFavoriteProductIndex(-1);
                setFavoriteProductsListForUser(result.newFavoriteProductsList);
                clearTimeout(successDeletingFavoriteProductMsgTimeOut);
            }, 1500);
        }
        catch (err) {
            console.log(err);
            setIsDeletingFavoriteProduct(false);
            setErrorMsgOnDeletingFavoriteProduct("Sorry, Someting Went Wrong, Please Repeate The Proccess !!");
            setDeletingFavoriteProductIndex(-1);
            let successDeletingFavoriteProductMsgTimeOut = setTimeout(() => {
                setErrorMsgOnDeletingFavoriteProduct("");
                clearTimeout(successDeletingFavoriteProductMsgTimeOut);
            }, 1500);
        }
    }
    return (
        <div className="customer-wish-list">
            <Head>
                <title>Asfour Store - Customer Wish List</title>
            </Head>
            {!isLoadingPage ? <>
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
                                            {favoriteProductsListForUser.map((favoriteProduct, favoriteProductIndex) => (
                                                <tr key={favoriteProduct._id}>
                                                    <td>
                                                        <img
                                                            src={`${process.env.BASE_API_URL}/${favoriteProduct.imagePath}`}
                                                            alt="favorite product image"
                                                            className="favorite-product-image d-block mx-auto mb-3"
                                                            width="100"
                                                            height="100"
                                                        />
                                                        <h5>{favoriteProduct.name}</h5>
                                                    </td>
                                                    <td>{favoriteProduct.price - favoriteProduct.discount} $</td>
                                                    <td>Stock Status</td>
                                                    <td>
                                                        {!isDeletingFavoriteProduct && !isSuccessDeletingFavoriteProduct && !errorMsgOnDeletingFavoriteProduct && deletingFavoriteProductIndex !== favoriteProductIndex && <BsTrash className="delete-product-from-favorite-user-list-icon managment-favorite-products-icon" onClick={() => deleteProductFromFavoriteUserProducts(userId, favoriteProductIndex)} />}
                                                        {isDeletingFavoriteProduct && deletingFavoriteProductIndex === favoriteProductIndex && <BsClock className="wait-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
                                                        {!isSuccessDeletingFavoriteProduct && deletingFavoriteProductIndex === favoriteProductIndex && <FaCheck className="success-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
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
            </> : <div className="loading-box d-flex justify-content-center align-items-center">
                <span className="loader"></span>
            </div>}
        </div>
    );
}