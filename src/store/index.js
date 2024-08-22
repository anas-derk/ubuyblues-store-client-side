import { createStore } from "redux";

const initialState = {
    productsCountInCart: 0,
    productsCountInFavorite: 0,
}

const cartReducer = (state = initialState, action) => {
    switch(action.type) {
        case "(Add / Delete) (To / From ) Cart": {
            return {
                ...state,
                productsCountInCart: action.productsCountInCart,
            }
        }
        case "(Add / Delete) (To / From ) Favorite": {
            return {
                ...state,
                productsCountInFavorite: action.productsCountInFavorite,
            }
        }
        default: return state;
    }
}

const store = createStore(cartReducer);

export default store;