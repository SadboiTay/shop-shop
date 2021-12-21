import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import { QUERY_PRODUCTS } from '../utils/queries';
import spinner from '../assets/spinner.gif';

// import { useStoreContext } from "../utils/GlobalState";
import {
  REMOVE_FROM_CART,
  UPDATE_CART_QUANTITY,
  ADD_TO_CART,
  UPDATE_PRODUCTS,
} from '../utils/actions';

import Cart from '../components/Cart';

import { idbPromise } from "../utils/helpers";

// REDUX IMPORTS
import { useSelector, useDispatch } from 'react-redux'

function Detail() {
  // const [state, dispatch] = useStoreContext();
  const { id } = useParams();

  const [currentProduct, setCurrentProduct] = useState({})

  const { loading, data } = useQuery(QUERY_PRODUCTS);

  // const { products, cart } = state;

  // REDUX VARIABLES
  const rDispatch = useDispatch();
  const rCart = useSelector(state => state.cart);
  const rProducts = useSelector(state => state.products);

  const addToCart = () => {
    const itemInCart = rCart.find((cartItem) => cartItem._id === id)

    if (itemInCart) {
      // dispatch({
      //   type: UPDATE_CART_QUANTITY,
      //   _id: id,
      //   purchaseQuantity: parseInt(itemInCart.purchaseQuantity) + 1
      // });

      // REDUX DISPATCH
      rDispatch({
        type: UPDATE_CART_QUANTITY,
        _id: id,
        purchaseQuantity: parseInt(itemInCart.purchaseQuantity) + 1
      });
      // if we're updating quantity, use existing item data and increment purchaseQuantity value by one
      idbPromise('cart', 'put', {
        ...itemInCart,
        purchaseQuantity: parseInt(itemInCart.purchaseQuantity) + 1
      });
    } else {
      // dispatch({
      //   type: ADD_TO_CART,
      //   product: { ...currentProduct, purchaseQuantity: 1 }
      // });

      // REDUX DISPATCH
      rDispatch({
        type: ADD_TO_CART,
        product: { ...currentProduct, purchaseQuantity: 1 }
      });
      // if product isn't in the cart yet, add it to the current shopping cart in IndexedDB
      idbPromise('cart', 'put', { ...currentProduct, purchaseQuantity: 1 });
    }
  }

  const removeFromCart = () => {
    // dispatch({
    //   type: REMOVE_FROM_CART,
    //   _id: currentProduct._id
    // });

    // REDUX DISPATCH
    rDispatch({
      type: REMOVE_FROM_CART,
      _id: currentProduct._id
    });

    // upon removal from cart, delete the item from IndexedDB using the `currentProduct._id` to locate what to remove
    idbPromise('cart', 'delete', { ...currentProduct });
  };

  useEffect(() => {
    // already in global store
    if (rProducts.length) {
      setCurrentProduct(rProducts.find(product => product._id === id));
    }
    // retrieved from server
    else if (data) {
      // dispatch({
      //   type: UPDATE_PRODUCTS,
      //   products: data.products
      // });

      // REDUX DISPATCH
      rDispatch({
        type: UPDATE_PRODUCTS,
        products: data.products
      });

      data.products.forEach((product) => {
        idbPromise('products', 'put', product);
      });
    }
    // get cache from idb
    else if (!loading) {
      idbPromise('products', 'get').then((indexedProducts) => {
        // dispatch({
        //   type: UPDATE_PRODUCTS,
        //   products: indexedProducts
        // });

        // REDUX DISPATCH
        rDispatch({
          type: UPDATE_PRODUCTS,
          products: indexedProducts
        });
      });
    }
  }, [rProducts, data, loading, rDispatch, id]);

  return (
    <>
      {currentProduct ? (
        <div className="container my-1">
          <Link to="/">← Back to Products</Link>

          <h2>{currentProduct.name}</h2>

          <p>{currentProduct.description}</p>

          <p>
            <strong>Price:</strong>${currentProduct.price}{' '}
            <button onClick={addToCart}>Add to Cart</button>
            <button
              disabled={!rCart.find(p => p._id === currentProduct._id)}
              onClick={removeFromCart}
            >
              Remove from Cart
            </button>
          </p>

          <img
            src={`/images/${currentProduct.image}`}
            alt={currentProduct.name}
          />
        </div>
      ) : null}
      {loading ? <img src={spinner} alt="loading" /> : null}
      <Cart />
    </>
  );
}

export default Detail;
