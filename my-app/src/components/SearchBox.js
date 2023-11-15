import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


// searchbox component - search products and navigate to search page
export default function SearchBox() {
  const navigate = useNavigate();                     // for navigation
  const [query, setQuery] = useState('');
  const submitHandler = (e) => {
    e.preventDefault();
    navigate(query ? `/search/?query=${query}` : '/search');
  };

  // form with input and search button to search products
  return (

    <form class="d-flex" onSubmit={submitHandler}>
      <input class="form-control me-2 rounded-5 price"
        type="text"
        name="q"
        id="q"
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        aria-label="Search Products"
        aria-describedby="button-search"
      />
      <button class="btn btn-outline-primary rounded-5 shopping-cart" type="submit" id="button-search">Search</button>
    </form>

  );
}
