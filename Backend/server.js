const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');   // importing mongoose
const app = express();


// Schemas
require('./models/user_model');
require('./models/product_model');
require('./models/order_model');

// routes
const userRoutes = require("./routes/user_route");
const fileRoutes = require("./routes/file_route");
const productRoutes = require("./routes/product_route");
const orderRoutes = require("./routes/order_route");
const seedRoutes = require("./routes/seedRoutes");

require('dotenv').config();

const PORT = 4000;          // listening on port number 8080

const DB = process.env.DB            // database to connect to

// add global variable to get or path
global.__basedir = __dirname;            // __basedir - will hold the path of the base(backend) folder 

// connecting to MONGODB database
mongoose.connect(DB);  // connect to database

// checking connection
mongoose.connection.on('connected', () => {
    console.log('Connection established to MongoDB');
})
// if error in connection
mongoose.connection.on('error', (error) => {
    console.log('connection error: ' + error);
})

// using cors (middleware)
// app.use(cors());

app.use(cors(
    {
        origin: ["https://ecom-five-ivory.vercel.app"],
        methods: ["POST", "GET", "PUT", "DELETE"],
        credentials: true
    }
));


// middleware for formating json responses
app.use(express.json());


app.use("/", userRoutes);
app.use("/", fileRoutes);
app.use("/", productRoutes);
app.use("/", orderRoutes);
app.use("/", seedRoutes);


// listen on port 4000
app.listen(PORT, (req, res) => {
    console.log(`Server Started on port ${PORT}`);
})





/*


PORT = 4000

Database name - MyEcommerceApp

MONGO_URL - 'mongodb://127.0.0.1:27017/MyEcommerceApp'


*/

