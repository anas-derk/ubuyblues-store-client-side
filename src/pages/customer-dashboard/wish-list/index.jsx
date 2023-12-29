import Head from "next/head";
import Header from "@/components/Header";
import CustomerDashboardSideBar from "@/components/CustomerDashboardSideBar";
import { useEffect, useState } from "react";
import axios from "axios";
import { BsTrash, BsClock } from "react-icons/bs";
import { FaCheck } from 'react-icons/fa';
import { useRouter } from "next/router";
import LoaderPage from "@/components/LoaderPage";
import { PiSmileySad } from "react-icons/pi";

export default function CustomerWishList() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [windowInnerWidth, setWindowInnerWidth] = useState(0);

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
            axios.get(`${process.env.BASE_API_URL}/users/user-info/${userId}`)
                .then(async (res) => {
                    const result = res.data;
                    if (result !== "Sorry, The User Is Not Exist !!, Please Enter Another User Id ..") {
                        setUserId(userId);
                        const res1 = await axios.get(`${process.env.BASE_API_URL}/users/favorite-products/${userId}`)
                        setFavoriteProductsListForUser(await res1.data);
                        setIsLoadingPage(false);
                        setWindowInnerWidth(window.innerWidth);
                        window.addEventListener("resize", () => {
                            setWindowInnerWidth(window.innerWidth);
                        });
                    } else router.push("/auth");
                })
                .catch((err) => console.log(err));
        } else {
            router.push("/auth");
        }
    }, []);

    const deleteProductFromFavoriteUserProducts = async (userId, favoriteProductIndex) => {
        try {
            setDeletingFavoriteProductIndex(favoriteProductIndex);
            setIsDeletingFavoriteProduct(true);
            const res = await axios.delete(`${process.env.BASE_API_URL}/users/favorite-product?userId=${userId}&productId=${favoriteProductsListForUser[favoriteProductIndex]._id}`)
            const result = await res.data;
            setIsDeletingFavoriteProduct(false);
            setIsSuccessDeletingFavoriteProduct(true);
            let successDeletingFavoriteProductMsgTimeOut = setTimeout(() => {
                setFavoriteProductsListForUser(result.newFavoriteProductsList);
                setIsSuccessDeletingFavoriteProduct(false);
                setDeletingFavoriteProductIndex(-1);
                clearTimeout(successDeletingFavoriteProductMsgTimeOut);
            }, 1500);
        }
        catch (err) {
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
        <div className="customer-wish-list customer-dashboard">
            <Head>
                <title>Asfour Store - Customer Wish List</title>
            </Head>
            {!isLoadingPage ? <>
                <Header />
                <div className="page-content d-flex align-items-center">
                    <div className="container-fluid">
                        <div className="row align-items-center">
                            <div className="col-xl-3">
                                <CustomerDashboardSideBar />
                            </div>
                            <div className="col-xl-9">
                                {favoriteProductsListForUser.length > 0 ? <section className="favorite-products-list-for-user text-center">
                                    {windowInnerWidth > 991 ? <table className="favorite-products-table-for-user w-100">
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
                                                        <h6>{favoriteProduct.name}</h6>
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
                                    </table> : <div className="favorite-products-for-user">
                                        {favoriteProductsListForUser.map((favoriteProduct, favoriteProductIndex) => (
                                            <div className="favorite-product mb-5" key={favoriteProductIndex}>
                                                <h4 className="mb-3 text-white">Favorite Product # {favoriteProductIndex + 1}</h4>
                                                <table className="favorite-products-table-for-user w-100">
                                                    <tbody>
                                                        <tr>
                                                            <th>Product</th>
                                                            <td>
                                                                <img
                                                                    src={`${process.env.BASE_API_URL}/${favoriteProduct.imagePath}`}
                                                                    alt="favorite product image"
                                                                    className="favorite-product-image d-block mx-auto mb-3"
                                                                    width="100"
                                                                    height="100"
                                                                />
                                                                <h6>{favoriteProduct.name}</h6>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>Unit Price</th>
                                                            <td>{favoriteProduct.price - favoriteProduct.discount} $</td>
                                                        </tr>
                                                        <tr>
                                                            <th>Stock Status</th>
                                                            <td>Stock Status</td>
                                                        </tr>
                                                        <tr>
                                                            <th>Action</th>
                                                            <td>
                                                                {!isDeletingFavoriteProduct && !isSuccessDeletingFavoriteProduct && !errorMsgOnDeletingFavoriteProduct && deletingFavoriteProductIndex !== favoriteProductIndex && <BsTrash className="delete-product-from-favorite-user-list-icon managment-favorite-products-icon" onClick={() => deleteProductFromFavoriteUserProducts(userId, favoriteProductIndex)} />}
                                                                {isDeletingFavoriteProduct && deletingFavoriteProductIndex === favoriteProductIndex && <BsClock className="wait-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
                                                                {!isSuccessDeletingFavoriteProduct && deletingFavoriteProductIndex === favoriteProductIndex && <FaCheck className="success-delete-product-from-favorite-user-list-icon managment-favorite-products-icon" />}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>}
                                </section> : <section className="not-found-any-favorite-products-for-user text-center">
                                    <PiSmileySad className="sorry-icon mb-5" />
                                    <h1 className="h4">Sorry, Can't Find Any Favorite Products For You !!</h1>
                                </section>}
                            </div>
                        </div>
                    </div>
                </div>
            </> : <LoaderPage />}
        </div>
    );
}