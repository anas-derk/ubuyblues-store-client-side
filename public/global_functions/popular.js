import axios from "axios";

const getFlashProductsCount = async (filters) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/products/flash-products-count?${filters ? filters : ""}`);
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

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

const getAllFlashProductsInsideThePage = async (pageNumber, pageSize, filters, sortDetails) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/products/all-flash-products-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}&${sortDetails ? sortDetails : ""}`);
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

const getAllProductsInsideThePage = async (pageNumber, pageSize, filters, sortDetails) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/products/all-products-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}&${sortDetails ? sortDetails : ""}`);
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

const isExistProductInsideTheCart = (productId) => {
    const userCart = JSON.parse(localStorage.getItem("asfour-store-customer-cart"));
    if (Array.isArray(userCart)) {
        return userCart.findIndex((product) => product._id === productId) > -1 ? true : false;
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

const getProductQuantity = (productId) => {
    return JSON.parse(localStorage.getItem("asfour-store-customer-cart")).find((product) => product._id === productId).quantity;
}

const calcTotalOrderPriceBeforeDiscount = (allProductsData) => {
    let tempTotalPriceBeforeDiscount = 0;
    allProductsData.forEach((product) => {
        tempTotalPriceBeforeDiscount += product.price * getProductQuantity(product._id);
    });
    return tempTotalPriceBeforeDiscount;
}

const calcTotalOrderDiscount = (allProductsData) => {
    let tempTotalDiscount = 0;
    allProductsData.forEach((product) => {
        tempTotalDiscount += product.discount * getProductQuantity(product._id);
    });
    return tempTotalDiscount;
}

const calcTotalOrderPriceAfterDiscount = (totalPriceBeforeDiscount, totalDiscount) => {
    return totalPriceBeforeDiscount - totalDiscount;
}

const calcTotalPrices = (allProductsData) => {
    const totalPriceBeforeDiscount = calcTotalOrderPriceBeforeDiscount(allProductsData);
    const totalDiscount = calcTotalOrderDiscount(allProductsData);
    return {
        totalPriceBeforeDiscount,
        totalDiscount,
        totalPriceAfterDiscount: calcTotalOrderPriceAfterDiscount(totalPriceBeforeDiscount, totalDiscount)
    };
}

const getTimeAndDateByLocalTime = (dateAndTimeAsString) => {
    const UTCDateAndTime = new Date(dateAndTimeAsString);
    const DateAndTimeByLocalTime = new Date(UTCDateAndTime.getTime() - UTCDateAndTime.getTimezoneOffset() * 60 * 1000);
    return DateAndTimeByLocalTime.toISOString().substring(0, 19);
}

const getRemainingTime = (milliSecondsCount) => {
    const days = Math.floor(milliSecondsCount / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliSecondsCount % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliSecondsCount % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliSecondsCount % (1000 * 60)) / 1000);
    return {
        days,
        hours,
        minutes,
        seconds,
    }
}

const getDateInUTCFormat = (localTimeAndDateAsString) => {
    const date = new Date(localTimeAndDateAsString);
    const diffBetweenLocalTimeAndUTC = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() + diffBetweenLocalTimeAndUTC);
    return date;
}

export {
    getFlashProductsCount,
    getProductsCount,
    getAllProductsInsideThePage,
    getAllFlashProductsInsideThePage,
    isExistProductInsideTheCart,
    getDateFormated,
    getStoreDetails,
    getCategoriesCount,
    getAllCategoriesInsideThePage,
    getStoresCount,
    getAllStoresInsideThePage,
    getProductQuantity,
    calcTotalPrices,
    getTimeAndDateByLocalTime,
    getRemainingTime,
    getDateInUTCFormat
}