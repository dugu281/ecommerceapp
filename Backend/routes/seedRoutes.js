
const express = require('express');
const expressAsyncHandler = require('express-async-handler');     // async handler to manage asynchronous requests errors
const mongoose = require('mongoose');
const User = mongoose.model('User');                 // user schema imported from user model
const Product = mongoose.model('Product');           // product schema imported from product model
const data = require('../data.js');                 // seed/dummy data from data.js file
const auth = require('../middlewares/auth');                                              // authentication middleware 
const { isAdmin } = require('../middlewares/utils');                                      // admin authorization middleware 

// routes to seed dummy user and products
const seedRouter = express.Router();

seedRouter.post('/seed/',
  auth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {

    const createdProducts = await Product.insertMany(data.products);

    res.send({ createdProducts });
    // console.log("Products List: ", data.products);
  })
);

seedRouter.post('/seed/users',
  auth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {

    const createdUsers = await User.insertMany(data.users);

    res.send({ createdUsers });
    // console.log("Users List: ", data.users);
  })
);



module.exports = seedRouter;

