import userAccount from "../model/userAcSchema.js"
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer"
import {google} from "googleapis"
import env from "dotenv";
import {generateToken} from "../utils/generateToken.js"

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

            const CLIENT_ID =  process.env.CLIENT_ID
            const CLIENT_SECRET = process.env.CLIENT_SECRET
            const REDIReCT_URI = process.env.REDIReCT_URI
            const REFRESH_TOKEN = process.env.REFRESH_TOKEN

            const oAuth2Clint = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIReCT_URI)
            oAuth2Clint.setCredentials({refresh_token: REFRESH_TOKEN})



            async function sendmail(){
                try {
                    const accessToken = await oAuth2Clint.getAccessToken()

                    const transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            type: "OAuth2", 
                            user: process.env.EMAIL,
                            pass: process.env.PASS,
                            clientId: CLIENT_ID,
                            clientSecret: CLIENT_SECRET,
                            refreshToken:REFRESH_TOKEN,
                            accessToken: accessToken
                        }
                    });

                    const mailOptions = {
                        from: 'IEMlabs Paymentgateway <souviksen093@gmail.com>',
                        to: createUserAccount.email,
                        subject: 'Email varification For account at IEMlabs Paymentgateway',
                        html: `<div><h2>Hi ${createUserAccount.username}!</h2>
                        <p>Your verification code is <b> ${emailVerificationOtp} </b>.</p>
                        <p>Enter this code in our PAYMENT GATWAY to activate your User account.If you have any questions, send us an email or send us message. </p>
                       <p> We are glad you are here!</p>
                        <p><b> Team IEMlabs </b></p></div>`
                        
                    };

                    const result = await transporter.sendMail(mailOptions)
                    return result
                } catch (error) {
                    return error
                }
            }

            sendmail().then(result=> console.log("email sent..", result)).catch(error => console.log(error.message))
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