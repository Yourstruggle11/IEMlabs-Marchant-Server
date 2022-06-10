import express from "express";
import {payment} from "../controller/paymentGatwayController.js"
    import  authMiddleware from "../middleware/authMiddleware.js"

const route = express.Router();

route.post("/paymentgateway", authMiddleware, payment);




export default route;


