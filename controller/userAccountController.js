import userAccount from "../model/userAcSchema.js"
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import env from "dotenv";
import {generateToken} from "../utils/generateToken.js"
import userAccountConfirmationMailer from "../mailer/userAccountConfirmationMailer.js"

env.config();


//@route: POST /user/signup
//@purpose: : post routes for create user account
export const registerUser = async (req, res, next) => {
    const { username, email, password } = req.body;

    const userExist = await userAccount.findOne({ email: email });
    if (userExist) {
        res.status(404);
        const err = new Error("User with this same email already exist!");
        next(err);
    }
    else {
        //creatin random four digit number for emailVerificationOtp
        const emailVerificationOtp = Math.floor(1000 + Math.random() * 9000);
        const createUserAccount = await userAccount.create({
            username,
            email,
            password,
        });
        if (createUserAccount) {
            res.json({
                _id: createUserAccount._id,
                name: createUserAccount.username,
                email: createUserAccount.email,
                emailVerificationOtp: emailVerificationOtp

            });


            //sending verification email to user using google api and nodemailer
            userAccountConfirmationMailer(createUserAccount.username,createUserAccount.email,emailVerificationOtp).then(result=> console.log("email sent..", result)).catch(error => console.log(error.message))
            
        }
        else {
            res.status(404);
            const err = new Error("invalid data!");
            next(err);
        }
    }

}

//@route: POST /user/login
//@purpose: : post routes for help user to login
export const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    const checkEmail = await userAccount.findOne({ email: email });

    if (checkEmail) {
        const checkActivation = await userAccount.find({
            email: { $eq: email },
            status: { $eq: true }
        });
        function isEmpty(obj) {
            for(var key in obj) {
                if(obj.hasOwnProperty(key))
                    return false;
            }
            return true;
        }
        if (!isEmpty(checkActivation)) {
            const checkPassword = await bcrypt.compare(password, checkEmail.password)
            if (checkPassword) {
                res.json({
                    _id: checkEmail._id,
                    name: checkEmail.username,
                    email: checkEmail.email,
                    token: generateToken(checkEmail._id)
                })
            }
            else {
                res.status(401);
                const err = new Error("Invalid password!");
                next(err)
            }
        }
        else {
            res.status(401);
            const err = new Error("Opps seems your account is not activated yet!");
            next(err)
        }
    }
    else {
        res.status(404);
        const err = new Error("No user available with this email!");
        next(err)
    }

}


//@route: GET /user/
//@purpose: : get routes for get all user account
export const getUser = async (req, res, next) => {

    try {
        const getUserAccount = await userAccount.find();
        res.status(200).json(getUserAccount);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}


//@route: DELETE /user/
//@purpose: : delete routes for delete user account
export const deleteUser = async (req, res, next) => {
    const { id: id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).send("no user found!")
    }
    else {
        try {
            await userAccount.findByIdAndDelete(id);
            res.status(200).json({ message: "user account deleted successfully.." })
        } catch (error) {
            res.status(404).json({ message: error.message })

        }
    }
}


//@route: PUT /user/accountActivation
//@purpose: : update routes for activate user account
export const accountActivation = async (req, res, next) => {
    const { id: id } = req.params;
    const activeUserAccount = await userAccount.findByIdAndUpdate(id, { "status": true }, {
        new: true,
    })
    if (activeUserAccount) {
        res.json(activeUserAccount);

    }
    else {
        res.status(404);
        const err = new Error("Something went wrong!");
        next(err)
    }
}