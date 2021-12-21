import { createStore } from 'redux'
import {reducer} from './reducer'

const initialState = {
    products: [],
    categories: [],
    currentCategory: null,
    cart: [],
    cartOpen: false
};

const store = createStore(reducer, initialState)

export default store