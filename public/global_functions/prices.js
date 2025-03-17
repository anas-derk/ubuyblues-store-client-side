import axios from "axios";

const getUSDPriceAgainstCurrency = async (country) => {
    try {
        // if(process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
        //     switch (country) {
        //         case "kuwait": {
        //             return 0.31;
        //         }
        //         case "germany": {
        //             return 0.83;
        //         }
        //         case "turkey": {
        //             return 32;
        //         }
        //         default: {
        //             throw Error("Sorry, Invalid Country !!");
        //         }
        //     }
        // }
        switch (country) {
            case "kuwait": {
                return (await axios.get(`${process.env.BASE_API_URL}/currency-exchange-rates/currency-rate-agaist-usd?currencySymbol=KWD`)).data.data;
            }
            case "germany": {
                return (await axios.get(`${process.env.BASE_API_URL}/currency-exchange-rates/currency-rate-agaist-usd?currencySymbol=EUR`)).data.data;
            }
            case "turkey": {
                return (await axios.get(`${process.env.BASE_API_URL}/currency-exchange-rates/currency-rate-agaist-usd?currencySymbol=TRY`)).data.data;
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

const getCurrencyNameByCountry = (country) => {
    switch (country) {
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

export {
    getUSDPriceAgainstCurrency,
    getCurrencyNameByCountry,
}