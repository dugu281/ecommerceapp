import { useContext } from 'react';
import { Store } from '../Store';

import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';


// Cart Page
export default function CartScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  // function to increment or decrement the cart items
  const updateCartHandler = async (item, quantity) => {
    const { data } = await axios.get(`http://localhost:4000/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };

  // function to remove item from cart
  const removeItemHandler = (item) => {
    ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  // function to checkout and navigate to checkout steps
  const checkoutHandler = () => {
    navigate('/signin?redirect=/shipping');
  };

  return (
    <div className='shopping-cart'>
      <h3 className='text-center fw-bold mb-5'>Shopping Cart</h3>
      <div className='row'>
        <div className='col-12 col-md-8'>
          {cartItems.length === 0 ? (
            <div className='mb-5 text-center'>
              <h4 className='pb-2'>Cart is empty</h4>
              <Link to="/" className='text-decoration-none text-light py-3 px-3 border-0 ' style={{ background: "rgb(98 84 243)" }}>GO SHOPPING</Link>
            </div>
          ) : (
            <div>
              <ul>
                <li className="row align-items-center">
                  <div className='col col-md-5 fw-semibold'>ITEM</div>
                  <div className='col col-md-2 fw-semibold'>PRICE</div>
                  <div className='col col-md-3 fw-semibold'>QUANTITY</div>
                  <div className='col col-md-2 fw-semibold'>REMOVE</div>
                </li>
              </ul>
              {cartItems.map((item) => (
                <ul key={item._id}>

                  <li className="row align-items-center">
                    <div className='col col-md-5'>

                      <Link to={`/product/${item.slug}`} className='text-decoration-none'><img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid rounded img-thumbnail border-dark p-0"
                      ></img>{' '}
                        <span className='text-wrap w-50 text-center'>{item.name}</span></Link>
                    </div>

                    <div className='col col-md-2'>${item.price}</div>

                    <div className='col col-md-3'>

                      <button
                        onClick={() =>
                          updateCartHandler(item, item.quantity - 1)
                        }
                        disabled={item.quantity === 1}
                        className='border-0 rounded-2 bg-transparent p-2'>
                        <i class="fa-solid fa-minus fs-5 "></i>
                      </button>


                      <span className='mx-2'>{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateCartHandler(item, item.quantity + 1)
                        }
                        disabled={item.quantity === item.countInStock}
                        className='border-0 rounded-2 bg-transparent p-2'>
                        <i class="fa-solid fa-plus fs-5"></i>
                      </button>

                    </div>

                    <div className='col col-md-2'>
                      <button onClick={() => removeItemHandler(item)}
                        className='bg-transparent border-0 rounded-2 p-2'>
                        <i class="fa-solid fa-trash text-danger fs-5"></i>
                      </button>
                    </div>
                  </li>
                  <hr />
                </ul>
              ))}
            </div>
          )}
        </div>


        {/* Checkout component */}
        <div className='col-12 col-md-4'>
          <div class="card mb-3 rounded-0 border-2 border-success">
            <div class="card-header text-center">
              <h5 className='fw-semibold'>Checkout</h5>
            </div>
            <ul class="list-group list-group-flush list-unstyled">
              <li className="list-group-item d-flex justify-content-between">
                <span>
                  Total:
                </span>
                <span>
                  ${cartItems.reduce((a, c) => a + c.price * c.quantity, 0)}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>
                  Items:
                </span>
                <span>
                  {cartItems.reduce((a, c) => a + c.quantity, 0)}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>
                  Shipping Fee:
                </span>
                <span className='text-success'>
                  Free
                </span>
              </li>
              <li className='p-2'>
                <div className="d-flex justify-content-center p-2">

                  <button
                    type="button"
                    className='btn btn-success rounded-0'
                    onClick={checkoutHandler}
                    disabled={cartItems.length === 0}
                  >
                    PROCEED CHECKOUT
                  </button>
                </div>

              </li>
            </ul>
          </div>


        </div>
      </div>
    </div>
  );
}
