import Head from "next/head";
import Header from "@/components/Header";
import Link from "next/link";
import { BsFillCartPlusFill, BsFillSuitHeartFill } from "react-icons/bs";
import { FaShoppingCart } from "react-icons/fa";
import { BiSolidCategory, BiSearchAlt } from "react-icons/bi";
import productImageTest from "../../public/images/productImageTest.jpg";
import { MdKeyboardArrowRight } from "react-icons/md";
import { AiFillEye } from "react-icons/ai";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="home">
      <Head>
        <title>Asfour Store - Home</title>
      </Head>
      <Header />
      <div className="page-content">
        <section className="links-and-logo bg-white pt-3 pb-3 text-center">
          <div className="links-box">
            <Link href="/shop">
              <FaShoppingCart className="cart-icon link-icon me-5" />
            </Link>
            <Link href="/wish-list">
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
                <Link href="/" className="display-product-link me-5 text-center">
                  <BiSolidCategory className="icon mb-2" />
                  <h5 className="link-name">Category</h5>
                </Link>
                <Link href="/" className="display-product-link me-5 text-center">
                  <BiSolidCategory className="icon mb-2" />
                  <h5 className="link-name">Last Added</h5>
                </Link>
                <Link href="/" className="display-product-link me-5 text-center">
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
              <div className="col-md-3">
                <div className="product-details p-3 text-center">
                  <img src={productImageTest.src} alt="product image !!" className="mb-3" />
                  <div className="details">
                    <h4 className="product-name">Product Name</h4>
                    <h5 className="product-category">Product Category</h5>
                    <h4>Price: $</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="product-details p-3 text-center">
                  <img src={productImageTest.src} alt="product image !!" className="mb-3" />
                  <div className="details">
                    <h4 className="product-name">Product Name</h4>
                    <h5 className="product-category">Product Category</h5>
                    <h4>Price: $</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="product-details p-3 text-center">
                  <img src={productImageTest.src} alt="product image !!" className="mb-3" />
                  <div className="details">
                    <h4 className="product-name">Product Name</h4>
                    <h5 className="product-category">Product Category</h5>
                    <h4>Price: $</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="product-details p-3 text-center">
                  <img src={productImageTest.src} alt="product image !!" className="mb-3" />
                  <div className="details">
                    <h4 className="product-name">Product Name</h4>
                    <h5 className="product-category">Product Category</h5>
                    <h4>Price: $</h4>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="categories mb-5">
            <h2 className="section-name text-center text-white mb-4">Categories</h2>
            <div className="row">
              <div className="col-md-3">
                <div className="category-details p-3">
                  <h5 className="cateogory-name mb-3">Category Name</h5>
                  <h6 className="products-count mb-3">Products Count</h6>
                  <MdKeyboardArrowRight className="forward-arrow-icon" />
                </div>
              </div>
              <div className="col-md-3">
                <div className="category-details p-3">
                  <h5 className="cateogory-name mb-3">Category Name</h5>
                  <h6 className="products-count mb-3">Products Count</h6>
                  <MdKeyboardArrowRight className="forward-arrow-icon" />
                </div>
              </div>
              <div className="col-md-3">
                <div className="category-details p-3">
                  <h5 className="cateogory-name mb-3">Category Name</h5>
                  <h6 className="products-count mb-3">Products Count</h6>
                  <MdKeyboardArrowRight className="forward-arrow-icon" />
                </div>
              </div>
              <div className="col-md-3">
                <div className="category-details p-3">
                  <h5 className="cateogory-name mb-3">Category Name</h5>
                  <h6 className="products-count mb-3">Products Count</h6>
                  <MdKeyboardArrowRight className="forward-arrow-icon" />
                </div>
              </div>
            </div>
          </section>
          <h2 className="section-name text-center text-white mb-4">Recently added products</h2>
          <section className="latest-added-products mb-5 bg-white p-3">
            <div className="row">
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
          </section>
          <section className="best-group mb-5 p-3 text-white">
            <h2 className="section-name text-center mb-4">Best Group</h2>
            <div className="row">
              <div className="col-md-3">
                <div className="product-details p-3 text-center">
                  <img src={productImageTest.src} alt="product image !!" className="mb-3" />
                  <div className="details">
                    <h4 className="product-name">Product Name</h4>
                    <h4>Price: $</h4>
                    <button className="add-to-cart-btn p-2">Add To Cart</button>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="product-details p-3 text-center">
                  <img src={productImageTest.src} alt="product image !!" className="mb-3" />
                  <div className="details">
                    <h4 className="product-name">Product Name</h4>
                    <h4>Price: $</h4>
                    <button className="add-to-cart-btn p-2">Add To Cart</button>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="product-details p-3 text-center">
                  <img src={productImageTest.src} alt="product image !!" className="mb-3" />
                  <div className="details">
                    <h4 className="product-name">Product Name</h4>
                    <h4>Price: $</h4>
                    <button className="add-to-cart-btn p-2">Add To Cart</button>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="product-details p-3 text-center">
                  <img src={productImageTest.src} alt="product image !!" className="mb-3" />
                  <div className="details">
                    <h4 className="product-name">Product Name</h4>
                    <h4>Price: $</h4>
                    <button className="add-to-cart-btn p-2">Add To Cart</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <h2 className="section-name text-center text-white mb-4">Best Seller</h2>
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
          </section>
        </div>
        <Footer />
      </div>
    </div>
  );
}
