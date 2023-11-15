import { useEffect, useReducer, useState } from "react";
import axios from "axios";
import Product from "../components/Product";
import LoadingBox from "../components/LoadingBox";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, products: action.payload, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};


// Home page
function HomeScreen() {
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: "",
  });


  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const result = await axios.get("http://localhost:4000/api/products");
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: err.message });
      }

    };
    fetchData();
  }, []);
  return (
    <div className="shopping-cart">

      <div class="row justify-content-center">
        <div className="col-8 col-md-6 col-lg-6">
          <img src="https://www.adyogi.com/hs-fs/hubfs/Homepage%20-%20Scale%20eCommerce.png?width=6000&height=4431&name=Homepage%20-%20Scale%20eCommerce.png" class="card-img img-fluid"
            alt="Featured Image" />
        </div>
      </div>

      <h3 className="text-center fw-bold m-3 shopping-cart">All Products</h3>

      <div className="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          < div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : (
          <div className="row w-100">
            {products.map((product) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3" key={product.slug}>
                <Product product={product}></Product>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default HomeScreen;
