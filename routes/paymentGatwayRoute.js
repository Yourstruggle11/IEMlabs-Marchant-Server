import express from "express";
import {payment} from "../controller/paymentGatwayController.js"

const route = express.Router();

route.post("/paymentgetway", payment);




export default route;


