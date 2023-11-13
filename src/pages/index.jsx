import Head from "next/head";
import Header from "@/components/Header";
import Link from "next/link";
import { BsFillCartPlusFill, BsFillSuitHeartFill, BsSuitHeart, BsFillPersonFill, BsPersonVcard } from "react-icons/bs";
import { FaShoppingCart } from "react-icons/fa";
import { BiSolidCategory, BiSearchAlt } from "react-icons/bi";
import productImageTest from "../../public/images/productImageTest.jpg";
import { MdKeyboardArrowRight } from "react-icons/md";
import { AiOutlineEye, AiOutlineHome } from "react-icons/ai";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import Axios from "axios";
import { RiArrowUpDoubleFill, RiArrowDownDoubleFill } from "react-icons/ri";
import { GrFormClose } from "react-icons/gr";
import { IoIosArrowForward, IoEarth } from "react-icons/io";
import { MdOutlineLogout } from "react-icons/md";
import { useRouter } from "next/router";
import { HiMinus, HiPlus } from "react-icons/hi";

export default function Home() {
    const [userId, setUserId] = useState("");
    const [userInfo, setUserInfo] = useState("");
    const [favoriteProductsListForUser, setFavoriteProductsListForUser] = useState([]);
    const [allProductsData, setAllProductsData] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [productAddingId, setProductAddingId] = useState("");
    const [isWaitAddToCart, setIsWaitAddToCart] = useState(false);
    const [isSuccessAddToCart, setIsSuccessAddToCart] = useState(false);
    const [errorInAddToCart, setErrorInAddToCart] = useState("");
    const [favoriteProductAddingId, setFavoriteProductAddingId] = useState("");
    const [isWaitAddProductToFavoriteUserProductsList, setIsWaitAddProductToFavoriteUserProductsList] = useState(false);
    const [isSuccessAddProductToFavoriteUserProductsList, setIsSuccessAddProductToFavoriteUserProductsList] = useState(false);
    const [errorInAddProductToFavoriteUserProductsList, setErrorAddProductToFavoriteUserProductsList] = useState("");
    const [appearedNavigateIcon, setAppearedNavigateIcon] = useState("down");
    const [productIndex, setProductIndex] = useState(-1);
    const [productQuantity, setProductQuantity] = useState(1);
    const [productGalleryImageIndex, setProductGalleryImageIndex] = useState(-1);
    const router = useRouter();
    useEffect(() => {
        window.onscroll = function () { handleScrollToUpAndDown(this) };
        const userId = localStorage.getItem("asfour-store-user-id");
        setUserId(userId);
        Axios.get(`${process.env.BASE_API_URL}/products/all-products`)
            .then(async (res) => {
                setAllProductsData(res.data);
                const res1 = await Axios.get(`${process.env.BASE_API_URL}/categories/all-categories`);
                const result1 = await res1.data;
                setAllCategories(result1);
                if (userId) {
                    const res2 = await Axios.get(`${process.env.BASE_API_URL}/users/user-info/${userId}`);
                    const result2 = await res2.data;
                    setUserInfo(result2);
                    setFavoriteProductsListForUser(result2.favorite_products_list);
                }
            })
            .catch(err => console.log(err));
    }, []);

    const userLogout = () => {
        localStorage.removeItem("asfour-store-user-id");
        router.push("/auth");
    }

    const handleScrollToUpAndDown = (window) => {
        if (window.scrollY > 500) {
            setAppearedNavigateIcon("up");
        } else {
            setAppearedNavigateIcon("down");
        }
    }

    const navigateToUpOrDown = (navigateOrientation) => {
        if (navigateOrientation === "up") {
            window.scrollTo({
                behavior: "smooth",
                top: 0,
                left: 0,
            });
        } else if (navigateOrientation === "down") {
            window.scrollTo({
                behavior: "smooth",
                top: window.innerHeight,
                left: 0,
            });
        }
    }

    const getLastSevenProducts = () => {
        let lastSevenProducts = [];
        if (allProductsData.length >= 7) {
            for (let i = 0; i < 2; i++) {
                lastSevenProducts.push(allProductsData[i]);
            }
        } else {
            for (let i = 0; i < allProductsData.length; i++) {
                lastSevenProducts.push(allProductsData[i]);
            }
        }
        return lastSevenProducts;
    }

    const isFavoriteProductForUser = (favorite_products_list, productId) => {
        for (let i = 0; i < favorite_products_list.length; i++) {
            if (favorite_products_list[i]._id === productId) return true;
        }
        return false;
    }

    const addProductToFavoriteUserProducts = async (productIndex, userId) => {
        try {
            setIsWaitAddProductToFavoriteUserProductsList(true);
            setFavoriteProductAddingId(allProductsData[productIndex]._id);
            const res = await Axios.post(`${process.env.BASE_API_URL}/users/add-favorite-product?userId=${userId}&productId=${allProductsData[productIndex]._id}`);
            const result = await res.data;
            if (result === "Ok !!, Adding New Favorite Product To This User Is Successfuly !!") {
                let tempFavoriteProductsForUser = favoriteProductsListForUser;
                tempFavoriteProductsForUser.push(allProductsData[productIndex]);
                setFavoriteProductsListForUser(tempFavoriteProductsForUser);
                setIsWaitAddProductToFavoriteUserProductsList(false);
                setFavoriteProductAddingId("");
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    const deleteProductFromFavoriteUserProducts = async (productIndex, userId) => {
        try {
            setIsWaitAddProductToFavoriteUserProductsList(true);
            setFavoriteProductAddingId(allProductsData[productIndex]._id);
            const res = await Axios.delete(`${process.env.BASE_API_URL}/users/favorite-product?userId=${userId}&productId=${allProductsData[productIndex]._id}`);
            const result = await res.data;
            if (result === "Ok !!, Deleting Favorite Product From This User Is Successfuly !!") {
                setFavoriteProductsListForUser(favoriteProductsListForUser.filter((favorite_product) => favorite_product._id != allProductsData[productIndex]._id));
                setIsWaitAddProductToFavoriteUserProductsList(false);
                setFavoriteProductAddingId("");
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    const addToCart = (id, name, price, description, category, discount, imagePath) => {
        setProductAddingId(id);
        setIsWaitAddToCart(true);
        let allProductsData = JSON.parse(localStorage.getItem("asfour-store-user-cart"));
        if (allProductsData) {
            allProductsData.push({
                id,
                name,
                price,
                description,
                category,
                discount,
                imagePath,
                quantity: 1,
            });
            localStorage.setItem("asfour-store-user-cart", JSON.stringify(allProductsData));
            setIsWaitAddToCart(false);
            setIsSuccessAddToCart(true);
            let successAddToCartTimeout = setTimeout(() => {
                setIsSuccessAddToCart(false);
                clearTimeout(successAddToCartTimeout);
            }, 1500);
        } else {
            let allProductsData = [];
            allProductsData.push({
                id,
                name,
                price,
                description,
                category,
                discount,
                imagePath,
                quantity: 1,
            });
            localStorage.setItem("asfour-store-user-cart", JSON.stringify(allProductsData));
            setIsWaitAddToCart(false);
            setIsSuccessAddToCart(true);
            let successAddToCartTimeout = setTimeout(() => {
                setIsSuccessAddToCart(false);
                clearTimeout(successAddToCartTimeout);
            }, 1500);
        }
        setProductAddingId("");
    }
    return (
        <div className="home">
            <Head>
                <title>Asfour Store - Home</title>
            </Head>
            <Header />
            <div className="navigate-to-up-button">
                {appearedNavigateIcon === "up" && <RiArrowUpDoubleFill className="arrow-up arrow-icon" onClick={() => navigateToUpOrDown("up")} />}
                {appearedNavigateIcon === "down" && <RiArrowDownDoubleFill className="arrow-down arrow-icon" onClick={() => navigateToUpOrDown("down")} />}
            </div>
            {productIndex > -1 && <div className="overlay">
                <div className="content p-4 text-white">
                    <GrFormClose className="close-overlay-icon" onClick={() => setProductIndex(-1)} />
                    <header className="overlay-header mb-4">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <h6 className="product-name-and-category">
                                    <span className="me-2">Main</span>
                                    <IoIosArrowForward className="me-2" />
                                    <span className="me-2 product-category-name">{allProductsData[productIndex].category}</span>
                                    <IoIosArrowForward className="me-2" />
                                    <span className="product-name">{allProductsData[productIndex].name}</span>
                                </h6>
                            </div>
                            <div className="col-md-6">
                                <div className="navigate-links p-3 text-end">
                                    <Link href="/" className="navigate-link me-5">
                                        <AiOutlineHome className="home-icon overlay-header-icon" />
                                    </Link>
                                    {!userId ? <Link href="/auth" className="navigate-link me-5">
                                        <BsFillPersonFill className="auth-icon overlay-header-icon" />
                                    </Link> : <>
                                        <Link href="#" className="navigate-link me-5" onClick={userLogout}>
                                            <MdOutlineLogout className="logout-icon overlay-header-icon" />
                                        </Link>
                                        <Link href="/customer-dashboard" className="navigate-link">
                                            <BsPersonVcard className="user-account-icon overlay-header-icon" />
                                        </Link>
                                    </>}
                                </div>
                            </div>
                        </div>
                    </header>
                    <div className="product-details-box">
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <div className="product-images-box">
                                    <div className="main-product-image-box mb-3">
                                        <img
                                            src={productGalleryImageIndex < 0 ? `${process.env.BASE_API_URL}/${allProductsData[productIndex].imagePath}` : `${process.env.BASE_API_URL}/${allProductsData[productIndex].galleryImagesPaths[productGalleryImageIndex]}`}
                                            alt="product image !!"
                                            className="w-100 product-image h-100"
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div
                                                className={`product-image-box ${productGalleryImageIndex === -1 ? "selection" : ""}`}
                                                onClick={() => setProductGalleryImageIndex(-1)}
                                            >
                                                <img
                                                    src={`${process.env.BASE_API_URL}/${allProductsData[productIndex].imagePath}`}
                                                    className="w-100 h-100 product-gallery-image"
                                                />
                                            </div>
                                        </div>
                                        {allProductsData[productIndex].galleryImagesPaths.map((path, pathIndex) => (
                                            <div className="col-md-3" key={pathIndex} onClick={() => setProductGalleryImageIndex(pathIndex)}>
                                                <div className={`gallery-image-box ${productGalleryImageIndex === pathIndex ? "selection" : ""}`} onClick={() => setProductGalleryImageIndex(pathIndex)}>
                                                    <img
                                                        src={`${process.env.BASE_API_URL}/${path}`}
                                                        alt="product image !!"
                                                        className="w-100 h-100"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="product-price-and-quantity me-3 mb-4 border-bottom border-2">
                                    <h2 className="product-name fw-bold mb-4">{allProductsData[productIndex].name}</h2>
                                    <h5 className={`product-price ${allProductsData[productIndex].discount != 0 ? "text-decoration-line-through" : "mb-4"}`}>{allProductsData[productIndex].price} $</h5>
                                    {allProductsData[productIndex].discount != 0 && <h4 className="product-after-discount mb-4">{allProductsData[productIndex].price - allProductsData[productIndex].discount} $</h4>}
                                    <h5 className="product-quantity">1 Product Available In Store</h5>
                                </div>
                                <div className="add-to-wish-list-or-cart text-center me-3 border-bottom border-2 mb-3">
                                    {userInfo && isFavoriteProductForUser(favoriteProductsListForUser, allProductsData[productIndex]._id) ? <BsFillSuitHeartFill
                                        className="product-managment-icon mb-3"
                                        onClick={() => deleteProductFromFavoriteUserProducts(productIndex, userId)}
                                    /> : <BsSuitHeart
                                        className="product-managment-icon mb-3"
                                        onClick={() => addProductToFavoriteUserProducts(productIndex, userId)}
                                    />}
                                    <div className="add-to-cart row align-items-center me-3 mb-4">
                                        <div className="add-to-cart-managment-btns-box col-md-8">
                                            {!isWaitAddToCart && !errorInAddToCart && !isSuccessAddToCart && <button className="add-to-cart-btn p-3 d-block w-100" onClick={() => addToCart(product._id, product.name, product.price, product.description, product.category, product.discount, product.imagePath)}>Add To Cart</button>}
                                            {isWaitAddToCart && <button className="wait-to-cart-btn p-3 d-block w-100" disabled>Waiting In Add To Cart ...</button>}
                                            {errorInAddToCart && <button className="error-to-cart-btn p-3 d-block w-100" disabled>Sorry, Something Went Wrong !!</button>}
                                            {isSuccessAddToCart && <Link href="/cart" className="success-to-cart-btn p-2 btn btn-success d-block w-100" disabled>Display Your Cart</Link>}
                                        </div>
                                        <div className="select-product-quantity-box p-3 col-md-4">
                                            <HiMinus className="select-product-quantity-icon"
                                                onClick={() => setProductQuantity((previousProductQuantity) => previousProductQuantity - 1)}
                                            />
                                            <span className="ms-3 me-3">{productQuantity}</span>
                                            <HiPlus className="select-product-quantity-icon"
                                                onClick={() => setProductQuantity((previousProductQuantity) => previousProductQuantity + 1)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <h5 className="product-category-name">
                                    <span className="fw-bold">Category: </span>
                                    <span>{allProductsData[productIndex].category}</span>
                                </h5>
                            </div>
                        </div>
                        <Footer />
                    </div>
                </div>
            </div>}
            {/* End Overlay */}
            <div className="page-content">
                <section className="links-and-logo bg-white pt-3 pb-3 text-center">
                    <div className="links-box">
                        <Link href="/">
                            <FaShoppingCart className="cart-icon link-icon me-5" />
                        </Link>
                        <Link href="/customer-dashboard/wish-list">
                            <BsFillSuitHeartFill className="cart-icon link-icon me-5" />
                        </Link>
                        <Link href="/cart">
                            <BsFillCartPlusFill className="cart-icon link-icon me-5" />
                        </Link>
                    </div>
                    <div className="logo-box m-0 d-flex align-items-center justify-content-center">
                        <BsFillCartPlusFill className="logo-icon" style={{ fontSize: 100 }} />
                    </div>
                </section>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-3">
                            <aside className="side-bar bg-white p-3 fw-bold">Sale Products</aside>
                        </div>
                        <div className="col-md-9">
                            <section className="navigate-link-for-display-products bg-white p-2 d-flex justify-content-center mb-5">
                                <Link href="#categories" className="display-product-link me-5 text-center">
                                    <BiSolidCategory className="icon mb-2" />
                                    <h5 className="link-name">Category</h5>
                                </Link>
                                <Link href="#latest-added-products" className="display-product-link me-5 text-center">
                                    <BiSolidCategory className="icon mb-2" />
                                    <h5 className="link-name">Last Added</h5>
                                </Link>
                                <Link href="#best-seller" className="display-product-link me-5 text-center">
                                    <BiSolidCategory className="icon mb-2" />
                                    <h5 className="link-name">Best</h5>
                                </Link>
                            </section>
                        </div>
                    </div>
                    <section className="search mb-5 text-end">
                        <BiSearchAlt className="search-icon p-2" />
                    </section>
                    <section className="ads mb-5">
                        <h1 className="text-white text-center">At Asfour we offer many great products for you</h1>
                    </section>
                    <section className="some-of-products mb-5">
                        <div className="row">
                            {allProductsData.length > 0 && getLastSevenProducts().map((product, index) => (
                                <div className="col-md-3" key={product._id}>
                                    <div className="product-details p-3 text-center">
                                        <img src={`${process.env.BASE_API_URL}/${product.imagePath}`} alt="product image !!" className="mb-3" />
                                        <div className="details">
                                            <h4 className="product-name">{product.name}</h4>
                                            <h5 className="product-category">{product.category}</h5>
                                            <h5 className={`product-price ${product.discount != 0 ? "text-decoration-line-through" : ""}`}>{product.price} $</h5>
                                            {product.discount != 0 && <h4 className="product-after-discount">{product.price - product.discount} $</h4>}
                                            <div className="product-managment-buttons-box">
                                                {userInfo && isFavoriteProductForUser(favoriteProductsListForUser, product._id) ? <BsFillSuitHeartFill
                                                    className="product-managment-icon me-2"
                                                    onClick={() => deleteProductFromFavoriteUserProducts(index, userId)}
                                                /> : <BsSuitHeart
                                                    className="product-managment-icon me-2"
                                                    onClick={() => addProductToFavoriteUserProducts(index, userId)}
                                                />}
                                                <AiOutlineEye className="me-2 eye-icon product-managment-icon" onClick={() => setProductIndex(index)} />
                                                {!isWaitAddToCart && !errorInAddToCart && !isSuccessAddToCart && product._id !== productAddingId && <button className="add-to-cart-btn p-2" onClick={() => addToCart(product._id, product.name, product.price, product.description, product.category, product.discount, product.imagePath)}>Add To Cart</button>}
                                                {isWaitAddToCart && product._id == productAddingId && <button className="wait-to-cart-btn p-2" disabled>Waiting In Add To Cart ...</button>}
                                                {errorInAddToCart && product._id == productAddingId && <button className="error-to-cart-btn p-2" disabled>Sorry, Something Went Wrong !!</button>}
                                                {isSuccessAddToCart && product._id == productAddingId && <Link href="/cart" className="success-to-cart-btn p-2 btn btn-success" disabled>Display Your Cart</Link>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section className="categories mb-5" id="categories">
                        <h2 className="section-name text-center mb-4 text-white">Categories</h2>
                        <div className="row">
                            {allCategories.map((category) => (
                                <div className="col-md-3" key={category._id}>
                                    <div className="category-details p-3">
                                        <Link href={`/categories/${category._id}`} className="product-by-category-link text-dark">
                                            <h5 className="cateogory-name mb-3">{category.name}</h5>
                                            <MdKeyboardArrowRight className="forward-arrow-icon" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    {/* <h2 className="section-name text-center text-white mb-4" id="latest-added-products">Recently added products</h2>
          <section className="latest-added-products mb-5 bg-white p-3">
            <div className="row">
              {allProductsData.length > 0 && getLastSevenProducts().map((product) => (
                <div className="col-md-3" key={product._id}>
                  <div className="product-details p-3 text-center">
                    <img src={`${process.env.BASE_API_URL}/${product.imagePath}`} alt="product image !!" className="mb-3" />
                    <div className="details">
                      <h4 className="product-name">{product.name}</h4>
                      <h4>{product.price} $</h4>
                      <div className="product-managment-buttons-box">
                        <BsFillSuitHeartFill className="product-managment-icon me-2" />
                        <button className="add-to-cart-btn p-2">Add To Cart</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section> */}
                    <section className="best-group mb-5 p-3 text-white">
                        <h2 className="section-name text-center mb-4">Best Group</h2>
                        <div className="row">
                            <div className="col-md-3">
                                <div className="product-details p-3 text-center">
                                    <img src={productImageTest.src} alt="product image !!" className="mb-3" />
                                    <div className="details">
                                        <h4 className="product-name">Product Name</h4>
                                        <h4>Price: $</h4>
                                        {!isWaitAddToCart && !errorInAddToCart && !isSuccessAddToCart && <button className="add-to-cart-btn p-2">Add To Cart</button>}
                                        {isWaitAddToCart && <button className="wait-to-cart-btn p-2" disabled>Waiting In Add To Cart ...</button>}
                                        {errorInAddToCart && <button className="error-to-cart-btn p-2" disabled>Sorry, Something Went Wrong !!</button>}
                                        {isSuccessAddToCart && <button className="success-to-cart-btn p-2 btn-success" disabled>Display Your Cart</button>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* <h2 className="section-name text-center text-white mb-4" id="best-seller">Best Seller</h2>
          <section className="best-seller mb-5 bg-white p-3">
            <div className="row">
              <div className="col-md-3">
                <div className="product-details p-3 text-center">
                  <img src={productImageTest.src} alt="product image !!" className="mb-3" />
                  <div className="details">
                    <h4 className="product-name">Product Name</h4>
                    <h4>Price: $</h4>
                    <div className="product-managment-buttons-box">
                      <BsFillSuitHeartFill className="product-managment-icon me-2" />
                      <button className="add-to-cart-btn p-2">Add To Cart</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="product-details p-3 text-center">
                  <img src={productImageTest.src} alt="product image !!" className="mb-3" />
                  <div className="details">
                    <h4 className="product-name">Product Name</h4>
                    <h4>Price: $</h4>
                    <div className="product-managment-buttons-box">
                      <BsFillSuitHeartFill className="product-managment-icon me-2" />
                      <AiFillEye className="product-managment-icon me-2" />
                      <button className="add-to-cart-btn p-2">Add To Cart</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="product-details p-3 text-center">
                  <img src={productImageTest.src} alt="product image !!" className="mb-3" />
                  <div className="details">
                    <h4 className="product-name">Product Name</h4>
                    <h4>Price: $</h4>
                    <div className="product-managment-buttons-box">
                      <BsFillSuitHeartFill className="product-managment-icon me-2" />
                      <AiFillEye className="product-managment-icon me-2" />
                      <button className="add-to-cart-btn p-2">Add To Cart</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="product-details p-3 text-center">
                  <img src={productImageTest.src} alt="product image !!" className="mb-3" />
                  <div className="details">
                    <h4 className="product-name">Product Name</h4>
                    <h4>Price: $</h4>
                    <div className="product-managment-buttons-box">
                      <BsFillSuitHeartFill className="product-managment-icon me-2" />
                      <AiFillEye className="product-managment-icon me-2" />
                      <button className="add-to-cart-btn p-2">Add To Cart</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section> */}
                </div>
                <Footer />
            </div>
        </div>
    );
}