const getUSDPriceAgainstCurrency = (country) => {
    switch(country) {
        case "kuwait": {
            return 1 * 3.25;
        }
        case "germany": {
            return 1 * 1.2;
        }
        case "turkey": {
            return 1 / 30;

        }
        default: {
            throw Error("Sorry, Invalid Country !!");
        }
    }
}

export default {
    getUSDPriceAgainstCurrency,
}