const getProductPriceByCountry = (price, country) => {
    switch(country) {
        case "kuwait": {
            return price * 3.25;
        }
        case "germany": {
            return price * 1.2;
        }
        case "turkey": {
            return price / 30;

        }
        default: {
            throw Error("Sorry, Invalid Country !!");
        }
    }
}

export default {
    getProductPriceByCountry,
}