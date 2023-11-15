import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import CheckoutSteps from '../components/CheckoutSteps';

export default function ShippingAddressScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    fullBox,
    userInfo,
    cart: { shippingAddress },
  } = state;
  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ''
  );
  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=/shipping');
    }
  }, [userInfo, navigate]);
  const [country, setCountry] = useState(shippingAddress.country || '');
  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        address,
        city,
        postalCode,
        country,
        location: shippingAddress.location,
      },
    });
    localStorage.setItem(
      'shippingAddress',
      JSON.stringify({
        fullName,
        address,
        city,
        postalCode,
        country,
        location: shippingAddress.location,
      })
    );
    navigate('/payment');
  };

  useEffect(() => {
    ctxDispatch({ type: 'SET_FULLBOX_OFF' });
  }, [ctxDispatch, fullBox]);

  return (
    <div className='shopping-cart'>

      <CheckoutSteps step1 step2></CheckoutSteps>
      <div className="container small-container">
        <h3 className="my-3 text-center fw-bold">Shipping Address</h3>
        <form onSubmit={submitHandler}>


          <div class="mb-3">
            <label>Full Name</label>
            <input
              class="form-control bg-light"
              placeholder="full name"
              aria-label="full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>


          <div class="mb-3">
            <label>Address</label>
            <input
              class="form-control bg-light"
              placeholder="address"
              aria-label="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>



          <div class="mb-3">
            <label>City</label>
            <input
              class="form-control bg-light"
              placeholder="city"
              aria-label="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>




          <div class="mb-3">
            <label>Postal Code</label>
            <input
              class="form-control bg-light"
              placeholder="postal code"
              aria-label="postal code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </div>




          <div class="mb-3">
            <label>Country</label>
            <input
              class="form-control bg-light"
              placeholder="country"
              aria-label="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>


          <div className="mb-3">
            <button className='btn btn-success' type="submit">
              Continue
            </button>
          </div>


        </form>
      </div>
    </div>
  );
}
