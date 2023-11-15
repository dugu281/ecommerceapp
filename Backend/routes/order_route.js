
const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');                // user schema imported from user model
const Product = mongoose.model('Product');       // product schema imported from product model
const Order = mongoose.model('Order');          // order schema imported from order model
const expressAsyncHandler = require('express-async-handler');         // async handler to manage asynchronous requests errors
const auth = require('../middlewares/auth');              // authentication middleware 
const { isAdmin } = require('../middlewares/utils');      // admin authorization middleware 

// routes to manage orders 
const orderRouter = express.Router();


// route to get list of all the orders
orderRouter.get(
  '/orders',
  auth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name');
    res.send(orders);
  })
);


// route to post an order and send the response data of order
orderRouter.post(
  '/orders',
  auth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });

    const order = await newOrder.save();
    res.status(201).send({ message: 'New Order Created', order });
  })
);


// route to get all orders details and display them on the dashboard screen
orderRouter.get(
  '/orders/summary',
  auth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
    res.send({ users, orders, dailyOrders, productCategories });
  })
);

// paypal payment route or route to send client payment ID
orderRouter.get("/keys/paypal", (req, res) => {
  res.send(process.env.PAYPAL_CLEINT_ID || "sb");
});


// get the orders list of the logged in user
orderRouter.get(
  '/orders/mine',
  auth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);


// get a single order details of the logged in user
orderRouter.get(
  '/orders/:id',
  auth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);


// get the order detail about the order delivery
orderRouter.put(
  '/orders/:id/deliver',
  auth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      res.send({ message: 'Order Delivered' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);


// get the order payment details (is order paid or not)
orderRouter.put(
  '/orders/:id/pay',
  auth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'email name'
    );
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();


      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);


// delete an order/order details
orderRouter.delete(
  '/orders/:id',
  auth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.send({ message: 'Order Deleted' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);




module.exports = orderRouter;

