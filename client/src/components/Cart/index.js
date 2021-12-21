import React, { useEffect } from "react";
import CartItem from '../CartItem';
import Auth from '../../utils/auth';
import './style.css';
import { useStoreContext } from '../../utils/GlobalState';
import { TOGGLE_CART, ADD_MULTIPLE_TO_CART } from "../../utils/actions";
import { idbPromise } from "../../utils/helpers";
import { QUERY_CHECKOUT } from '../../utils/queries';
import { loadStripe } from '@stripe/stripe-js';
import { useLazyQuery } from '@apollo/client';

// REDUX IMPORTS
import { useSelector, useDispatch } from 'react-redux'

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const Cart = () => {
    // const [state, dispatch] = useStoreContext();
    const [getCheckout, { data }] = useLazyQuery(QUERY_CHECKOUT);

    // REDUX VARIABLES
    const rDispatch = useDispatch();
    const rCart = useSelector(state => state.cart)
    const rCartOpen = useSelector(state => state.cartOpen)
    const rState = useSelector(state => state);
    console.log('Redux Store: ', rState)

    useEffect(() => {
        async function getCart() {
            const cart = await idbPromise('cart', 'get');
            // dispatch({ type: ADD_MULTIPLE_TO_CART, products: [...cart] });

            // REDUX DISPATCH
            rDispatch({ type: ADD_MULTIPLE_TO_CART, products: [...cart] });
        };

        if (!rCart.length) {
            getCart();
        }
    }, [rCart.length, rDispatch]);

    useEffect(() => {
        if (data) {
            stripePromise.then((res) => {
                res.redirectToCheckout({ sessionId: data.checkout.session });
            });
        }
    }, [data]);

    function toggleCart() {
        // dispatch({ type: TOGGLE_CART });

        // REDUX DISPATCH
        rDispatch({ type: TOGGLE_CART });
    }

    function calculateTotal() {
        let sum = 0;
        rCart.forEach(item => {
            sum += item.price * item.purchaseQuantity;
        });
        return sum.toFixed(2);
    }

    function submitCheckout() {
        const productIds = [];

        rCart.forEach((item) => {
            for (let i = 0; i < item.purchaseQuantity; i++) {
                productIds.push(item._id);
            }
        });

        getCheckout({
            variables: { products: productIds }
        });
    }

    if (!rCartOpen) {
        return (
            <div className="cart-closed" onClick={toggleCart}>
                <span
                    role="img"
                    aria-label="trash">🛒</span>
            </div>
        );
    }

    // console.log(state)

    return (
        <div className="cart">
            <div className="close" onClick={toggleCart}>[close]</div>
            <h2>Shopping Cart</h2>
            {rCart.length ? (
                <div>
                    {rCart.map(item => (
                        <CartItem key={item._id} item={item} />
                    ))}
                    <div className="flex-row space-between">
                        <strong>Total: ${calculateTotal()}</strong>
                        {
                            Auth.loggedIn() ?
                                <button onClick={submitCheckout}>
                                    Checkout
                                </button>
                                :
                                <span>(log in to check out)</span>
                        }
                    </div>
                </div>
            ) : (
                <h3>
                    <span role="img" aria-label="shocked">
                        😱
                    </span>
                    You haven't added anything to your cart yet!
                </h3>
            )}
        </div>
    );
};

export default Cart;