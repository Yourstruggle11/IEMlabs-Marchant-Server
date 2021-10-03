import express from "express";
import env from "dotenv";
import cors from "cors";
import morgan from "morgan";
import dbConnection from "./config/DB.js";
import bodyParser from "body-parser";


//import routes
import homeRoute from "./routes/homeRoute.js"
import userAccount from './routes/userAccountRoute.js'
import forgotPassword from "./routes/forgotPasswordRoute.js"
import paymentGatway from "./routes/paymentGatwayRoute.js"



const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
env.config();

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));
app.use(morgan('dev'));
app.use(cors());


//connect to the database
dbConnection();

//home routes for testing
app.use("/", homeRoute);

//userAccount account route
app.use("/useAccount", userAccount)

//forgot password route
app.use("/user/forgotpassword", forgotPassword)

//Stripe payment route
app.use("/payment", paymentGatway)



// making the port dynamic
const PORT = process.env.PORT || 5000


//starting the server
app.listen(PORT, function () {
    console.log(`server has started at port no ${PORT}`);
})