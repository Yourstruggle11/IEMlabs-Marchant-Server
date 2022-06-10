import express from "express";
import {
    registerUser,
    loginUser,
    getUser,
    deleteUser,
    accountActivation
} from "../controller/userAccountController.js"
const route = express.Router();

route.post("/signup", registerUser)
route.post("/login", loginUser)
route.get("/", getUser)
route.delete("/:id", deleteUser)
route.put("/account-activation/:id", accountActivation)





export default route;