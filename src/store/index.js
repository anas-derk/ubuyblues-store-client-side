import { createStore } from "redux";

const initialState = {
    newProductsCountInCart: 0
}

const cartReducer = (state = initialState, action) => {
    switch(action.type) {
        case "(Add / Delete) (To / From ) Cart": {
            return {
                ...state,
                newProductsCountInCart: action.newProductsCountInCart,
            }
        }
        default: return state;
    }
}

const store = createStore(cartReducer);

export default store;