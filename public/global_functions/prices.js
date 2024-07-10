import axios from "axios";

const getUSDPriceAgainstCurrency = async (country) => {
    try {
        if(process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
            switch (country) {
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
        const res = await axios.get(`https://api.currencyapi.com/v3/latest?base_currency=USD&currencies=EUR,KWD,TRY`, {
            headers: {
                "apiKey": "cur_live_AeqmPRub8bYXk9M1QsqYgaMGQLPlnZMLWVQhESph",
            },
        });
        const data = res.data.data;
        switch (country) {
            case "kuwait": {
                return data["KWD"].value;
            }
            case "germany": {
                return data["EUR"].value;
            }
            case "turkey": {
                return data["TRY"].value;
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