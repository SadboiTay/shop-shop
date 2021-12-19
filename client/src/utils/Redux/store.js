import { createStore } from 'redux'
import reducer from './reducer'

const initialState = {
    products: [],
    categories: [{ name: 'Food' }],
    currentCategory: '1',
    cart: [
        {
            _id: '1',
            name: 'Soup',
            purchaseQuantity: 1
        },
        {
            _id: '2',
            name: 'Bread',
            purchaseQuantity: 2
        }
    ],
    cartOpen: false
};

const store = createStore(reducer, initialState)

export default store