import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import { Store } from '../Store';
import { getError } from '../utils';
import { toast } from 'react-toastify';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false };

    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false };
    case 'DELIVER_RESET':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };
    default:
      return state;
  }
}
export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingDeliver,
      successDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
    successPay: false,
    loadingPay: false,
  });

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' });
        const { data } = await axios.put(
          `http://localhost:4000/api/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: 'PAY_SUCCESS', payload: data });
        toast.success('Order is paid');
      } catch (err) {
        dispatch({ type: 'PAY_FAIL', payload: getError(err) });
        toast.error(getError(err));
      }
    });
  }
  function onError(err) {
    toast.error(getError(err));
  }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`http://localhost:4000/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate('/login');
    }
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get('http://localhost:4000/api/keys/paypal', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'USD',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      loadPaypalScript();
    }
  }, [
    order,
    userInfo,
    orderId,
    navigate,
    paypalDispatch,
    successPay,
    successDeliver,
  ]);

  async function deliverOrderHandler() {
    try {
      dispatch({ type: 'DELIVER_REQUEST' });
      const { data } = await axios.put(
        `http://localhost:4000/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'DELIVER_SUCCESS', payload: data });
      toast.success('Order is delivered');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'DELIVER_FAIL' });
    }
  }

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <div className="alert alert-danger shopping-cart" role="alert">
      {error}
    </div>
  ) : (
    <div className='shopping-cart'>

      <h3 className="my-3">Order {orderId}</h3>
      <div className="row">
        <div className="col" md={8}>


          <div class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">Shipping</h5>
              <p><span className='fw-semibold'>Username:  </span>{order.shippingAddress.fullName}</p>
              <p>
                <span className='fw-semibold'>Address: </span>
                {order.shippingAddress.address},
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                ,{order.shippingAddress.country}
              </p>

              {order.isDelivered ? (
                <div className="alert alert-success w-75" role="alert">
                  Delivered at {order.deliveredAt}
                </div>

              ) : (
                <div className="alert alert-danger w-75" role="alert">
                  Not Delivered
                </div>
              )}
            </div>
          </div>


          <div class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">Payment</h5>
              <p><span className='fw-semibold'>Method:  </span>{order.paymentMethod}</p>

              {order.isPaid ? (
                <div className="alert alert-success w-75" role="alert">
                  Paid at {order.paidAt}
                </div>
              ) : (
                <div className="alert alert-danger w-75" role="alert">
                  Not Paid
                </div>
              )}
            </div>
          </div>




          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Items</h5>
              {/* <hr /> */}
              <div class="card border-0">
                <ul class="list-group list-group-flush list-unstyled">
                  {order.orderItems.map((item) => (
                    <li key={item._id} className='mb-2'>
                      <div className="row align-items-center">
                        <div className="col-12 col-md-6">
                          <Link to={`/product/${item.slug}`} className='text-decoration-none'>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="img-fluid rounded-0 p-0 img-thumbnail"
                            />
                            {' '}
                            {item.name}
                          </Link>
                        </div>
                        <div className="col-12 col-md-3">
                          <span>{item.quantity}</span>
                        </div>
                        <div className="col-12 col-md-3">${item.price}</div>
                      </div>
                      <hr />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>



        <div className="col-12 col-md-4">

          <div class="card mb-3 rounded-0 border-2 border-success">
            <div class="card-header text-center">
              <h5 className='fw-semibold'>Order Summary</h5>
            </div>
            <ul class="list-group list-group-flush list-unstyled">
              <li className="list-group-item d-flex justify-content-between">
                <span>
                  Subtotal:
                </span>
                <span>
                  ${order.itemsPrice.toFixed(2)}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>
                  Shipping:
                </span>
                <span className='text-success'>
                  Free
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>
                  Tax:
                </span>
                <span>
                  ${order.taxPrice.toFixed(2)}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between fw-bold">
                <span>
                  Total:
                </span>
                <span>
                  ${order.totalPrice.toFixed(2)}
                </span>
              </li>
              <li className='p-2'>
                {!order.isPaid && (
                  <div>
                    {isPending ? (
                      <LoadingBox />
                    ) : (
                      <div>
                        <PayPalButtons
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                        ></PayPalButtons>
                      </div>
                    )}
                    {loadingPay && <LoadingBox></LoadingBox>}
                  </div>
                )}

                {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                  <div>
                    {loadingDeliver && <LoadingBox></LoadingBox>}
                    <div className="d-flex justify-content-center p-2">
                      <button className='btn btn-success text-light rounded-0' type="button" onClick={deliverOrderHandler}>
                        Deliver Order
                      </button>
                    </div>
                  </div>
                )}
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
