import React from 'react';

// function to display checkout steps
export default function CheckoutSteps(props) {
  return (
    <div className="row checkout-steps">
      <div className={props.step1 ? 'active col' : 'col'}>Sign-In</div>
      <div className={props.step2 ? 'active col' : 'col'}>Shipping</div>
      <div className={props.step3 ? 'active col' : 'col'}>Payment</div>
      <div className={props.step4 ? 'active col' : 'col'}>Place Order</div>
    </div>
  );
}
