import axios from "axios";

const getProductsCount = async (filters) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/products/products-count?${filters ? filters : ""}`);
        const result = await res.data;
        return result;
    }
    catch (err) {
        throw Error(err);
    }
}

const getAllProductsInsideThePage = async (pageNumber, pageSize, filters) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/products/all-products-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}`);
        return await res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

const isExistProductInsideTheCart = (productId) => {
    const userCart = JSON.parse(localStorage.getItem("asfour-store-user-cart"));
    if (Array.isArray(userCart)) {
        return userCart.findIndex((product) => product.id === productId) > -1 ? true : false;
    }
    return false;
}

export {
    getProductsCount,
    getAllProductsInsideThePage,
    isExistProductInsideTheCart,
}