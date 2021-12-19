import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { QUERY_CATEGORIES } from '../../utils/queries';
import { useStoreContext } from "../../utils/GlobalState";
import { UPDATE_CATEGORIES, UPDATE_CURRENT_CATEGORY } from '../../utils/actions';
import { idbPromise } from '../../utils/helpers';

// REDUX
import { useSelector, useDispatch } from 'react-redux'
import store from '../../utils/Redux/store';

function CategoryMenu() {
  const [state, dispatch] = useStoreContext();

  // const { categories } = state;

  const { loading, data: categoryData } = useQuery(QUERY_CATEGORIES);

  // REDUX
  const rState = store.getState();
  const rCategories = useSelector(rState => rState.categories)
  const rDispatch = useDispatch();
  // console.log('redux state: ', rState)

  useEffect(() => {
    if (categoryData) {
      dispatch({
        type: UPDATE_CATEGORIES,
        categories: categoryData.categories
      });
      categoryData.categories.forEach(category => {
        idbPromise('categories', 'put', category);
      });

      // REDUX
      rDispatch({
        type: UPDATE_CATEGORIES,
        categories: categoryData.categories
      });

    } else if (!loading) {
      idbPromise('categories', 'get').then(categories => {
        dispatch({
          type: UPDATE_CATEGORIES,
          categories: categories
        });
        
        // REDUX
        rDispatch({
          type: UPDATE_CATEGORIES,
          categories: categories
        });
      });
    }
  }, [categoryData, loading, dispatch]);

  const handleClick = id => {
    dispatch({
      type: UPDATE_CURRENT_CATEGORY,
      currentCategory: id
    });

    // REDUX
    rDispatch({
      type: UPDATE_CURRENT_CATEGORY,
      currentCategory: id
    });
  };

  return (
    <div>
      <h2>Choose a Category:</h2>
      {rCategories.map(item => (
        <button
          key={item._id}
          onClick={() => {
            handleClick(item._id);
          }}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryMenu;
