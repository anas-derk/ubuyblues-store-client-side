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

const getAllProductsInsideThePage = async (pageNumber, pageSize, filters, sortDetails) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/products/all-products-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}&${sortDetails ? sortDetails : ""}`);
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

const getDateFormated = (date) => {
    let orderedDateInDateFormat = new Date(date);
    const year = orderedDateInDateFormat.getFullYear();
    const month = orderedDateInDateFormat.getMonth() + 1;
    const day = orderedDateInDateFormat.getDate();
    orderedDateInDateFormat = `${year} / ${month} / ${day}`;
    return orderedDateInDateFormat;
}

const getStoreDetails = async (storeId) => {
    try {
        let res;
        if (!storeId) {
            res = await axios.get(`${process.env.BASE_API_URL}/stores/main-store-details`);
        } else {
            res = await axios.get(`${process.env.BASE_API_URL}/stores/store-details/${storeId}`);
        }
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

const getCategoriesCount = async (filters) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/categories/categories-count?${filters ? filters : ""}`);
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

const getAllCategoriesInsideThePage = async (pageNumber, pageSize, filters) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/categories/all-categories-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}`);
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

const getStoresCount = async (filters) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/stores/stores-count?${filters ? filters : ""}`);
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

const getAllStoresInsideThePage = async (pageNumber, pageSize, filters) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/stores/all-stores-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}`);
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

export {
    getProductsCount,
    getAllProductsInsideThePage,
    isExistProductInsideTheCart,
    getDateFormated,
    getStoreDetails,
    getCategoriesCount,
    getAllCategoriesInsideThePage,
    getStoresCount,
    getAllStoresInsideThePage,
}