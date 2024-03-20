import axios from "axios";

const getUSDPriceAgainstCurrency = async (country) => {
    try {
        const res = await axios.get(`https://api.currencyapi.com/v3/latest?base_currency=USD&currencies=EUR,KWD,TRY`, {
            headers: {
                "apiKey": "cur_live_AeqmPRub8bYXk9M1QsqYgaMGQLPlnZMLWVQhESph",
            },
        });
        const data = res.data.data;
        switch (country) {
            case "kuwait": {
                return data["KWD"].value.toFixed(2);
            }
            case "germany": {
                return data["EUR"].value.toFixed(2);;
            }
            case "turkey": {
                return data["TRY"].value.toFixed(2);;
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

export default {
    getUSDPriceAgainstCurrency,
}