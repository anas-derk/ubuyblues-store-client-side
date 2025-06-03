import axios from "axios";

const getCurrencyNameByCountry = (country) => {
    switch (country) {
        case "United States Of America": {
            return "USD";
        }
        case "kuwait": {
            return "KWD";
        }
        case "germany": {
            return "EUR";
        }
        case "turkey": {
            return "TRY";
        }
        default: {
            throw Error("Sorry, Invalid Country !!");
        }
    }
}

const getBaseCurrencyPriceAgainstCurrency = async (country) => {
    try {
        if (process.env.NODE_ENV === "development") {
            switch (country) {
                case process.env.BASE_COUNTRY: {
                    return 1;
                }
                case "kuwait": {
                    return 0.31;
                }
                case "germany": {
                    return 0.83;
                }
                case "turkey": {
                    return 32;
                }
                default: {
                    throw Error("Sorry, Invalid Country !!");
                }
            }
        }
        switch (country) {
            case process.env.BASE_COUNTRY: {
                return 1;
            }
            case "kuwait": {
                return (await axios.get(`${process.env.BASE_API_URL}/currency-exchange-rates/currency-rate-agaist-base-currency?currencySymbol=KWD&baseCurrencySymbol=${getCurrencyNameByCountry("United States Of America")}`)).data.data;
            }
            case "germany": {
                return (await axios.get(`${process.env.BASE_API_URL}/currency-exchange-rates/currency-rate-agaist-base-currency?currencySymbol=EUR&baseCurrencySymbol=${getCurrencyNameByCountry("United States Of America")}`)).data.data;
            }
            case "turkey": {
                return (await axios.get(`${process.env.BASE_API_URL}/currency-exchange-rates/currency-rate-agaist-base-currency?currencySymbol=TRY&baseCurrencySymbol=${getCurrencyNameByCountry("United States Of America")}`)).data.data;
            }
            default: {
                throw Error("Sorry, Invalid Country !!");
            }
        }
    }
    catch (err) {
        throw err;
    }
}

export {
    getBaseCurrencyPriceAgainstCurrency,
    getCurrencyNameByCountry,
}