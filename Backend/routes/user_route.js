const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');                         // user schema imported from user model
const expressAsyncHandler = require('express-async-handler');      // async handler to manage asynchronous requests errors
const bcryptjs = require("bcryptjs");                    // password encryption and decryption (hash and compare)
const jwt = require('jsonwebtoken');                   // token based authentication (jwt token authentication)
const auth = require('../middlewares/auth');           // authentication middleware 
const { isAdmin } = require('../middlewares/utils');    // admin authorization middleware 

require('dotenv').config();        // to configure environment variables

// user routes
const router = express.Router();

// Signup route
router.post('/users/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'One or more mandatory fields are empty!' });
    }

    // checking weather user exists in database or not (if exists user already through error) and (if not exists save user in database)
    User.findOne({ email: email })  // here first email is from user_model.js and second email is from req.body above
        .then((userInDB) => {       // if successful
            if (userInDB) {
                return res.status(500).json({ message: 'User with this email or username already exists!', result: { email: email } });
            }
            bcryptjs.hash(password, 16)
                .then((hashedpassword) => {
                    const user = new User({ name, email, password: hashedpassword });
                    const jwtToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);
                    user.save()
                        .then((newUser) => {

                            res.send({
                                _id: user._id,
                                name: user.name,
                                email: user.email,
                                isAdmin: user.isAdmin,
                                image: user.image,
                                token: jwtToken,
                                result: 'User signed up successfully!'
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                })
                .catch((error) => {
                    console.log(error);
                })
        })
        .catch((error) => {                // if error
            console.log(error);
        })


})



// Login route with JWT token authentication
router.post('/users/signin', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'One or more mandatory fields are empty!' });
    }

    // checking weather user exists in database or not
    User.findOne({ email: email })  // find if email already in database
        .then((userInDB) => {       // if successful
            if (!userInDB) {
                return res.status(401).json({ message: 'Invalid Credentials! User not found.' });   // unauthorized access or user (status 401) - if email is not in database
            }
            bcryptjs.compare(password, userInDB.password)      // change hash to "compare" to compare the password with encrypted password 
                .then((didMatch) => {
                    if (didMatch) {
                        const jwtToken = jwt.sign({ _id: userInDB._id }, process.env.JWT_SECRET_KEY);  // _id from user in database

                        res.send({
                            _id: userInDB._id,
                            name: userInDB.name,
                            email: userInDB.email,
                            isAdmin: userInDB.isAdmin,
                            image: userInDB.image,
                            token: jwtToken
                        });

                    }
                    else {
                        return res.status(401).json({ message: 'Invalid credentials! Incorrect password!' });   // if not matched password
                    }
                })
                .catch((error) => {          // if error in comparing password
                    console.log(error);
                })
        })
        .catch((error) => {                // if error
            console.log(error);
        })

})



// route to get all user details
router.get(
    '/users',
    auth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const users = await User.find({});
        res.send(users);
    })
);


// route to get a single user details
router.get(
    '/users/:id',
    auth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);
        if (user) {
            res.send(user);
        } else {
            res.status(404).send({ message: 'User Not Found' });
        }
    })
);


// route to update logged in user's profile
router.put(
    '/users/profile',
    auth,
    expressAsyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.image = req.body.image || user.image;
            if (req.body.password) {
                user.password = bcryptjs.hashSync(req.body.password, 8);
            }
            const jwtToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);

            const updatedUser = await user.save();
            res.send({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                phone: updatedUser.phone,
                address: updatedUser.address,
                image: updatedUser.image,
                token: jwtToken
            });
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    })
);


// route to update user's details (admin only)
router.put(
    '/users/:id',
    auth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.isAdmin = Boolean(req.body.isAdmin);
            const updatedUser = await user.save();
            res.send({ message: 'User Updated', user: updatedUser });
        } else {
            res.status(404).send({ message: 'User Not Found' });
        }
    })
);


// route to delete a single user by its id
router.delete(
    '/users/:id',
    auth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.email === 'admin@example.com') {
                res.status(400).send({ message: 'Can Not Delete Admin User' });
                return;
            }
            await user.deleteOne();
            res.send({ message: 'User Deleted' });
        } else {
            res.status(404).send({ message: 'User Not Found' });
        }
    })
);




module.exports = router;



/*


+ output of signin route :

1. token - JWT Token (String)

2. User's information (object)


*/
