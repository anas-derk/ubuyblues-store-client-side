import axios from "axios";

const getProductsCount = async () => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/products/products-count`);
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

const getAllProductsInsideThePage = async (pageNumber, pageSize) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/products/all-products-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}`);
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

export {
    getProductsCount,
    getAllProductsInsideThePage,
}