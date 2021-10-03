import userAccount from "../model/userAcSchema.js"
import bcrypt from "bcrypt";
import nodemailer from "nodemailer"
import { google } from "googleapis"
import env from "dotenv";

env.config();
export const sendRecoveryMail = async (req, res, next) => {
    const { email } = req.body;

    const checkEmail = await userAccount.findOne({ email: email });
    if (checkEmail) {
        //creatin random four digit number for emailVerificationOtp
        const emailVerificationOtp = Math.floor(1000 + Math.random() * 9000);
        res.json({
            _id: checkEmail._id,
            name: checkEmail.username,
            email: checkEmail.email,
            emailVerificationOtp: emailVerificationOtp
        });
        //sending verification email to user
        const CLIENT_ID =  process.env.CLIENT_ID
        const CLIENT_SECRET = process.env.CLIENT_SECRET
        const REDIReCT_URI = process.env.REDIReCT_URI
        const REFRESH_TOKEN = process.env.REFRESH_TOKEN

        const oAuth2Clint = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIReCT_URI)
        oAuth2Clint.setCredentials({ refresh_token: REFRESH_TOKEN })



        async function sendmail() {
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
                        refreshToken: REFRESH_TOKEN,
                        accessToken: accessToken
                    }
                });

                const mailOptions = {
                    from: 'IEMlabs Paymentgateway <souviksen093@gmail.com>',
                    to: checkEmail.email,
                    subject: `${checkEmail.username}, here's your PIN`,
                    html: `<h2>Hi ${checkEmail.username}, </h2>
                            <p>We received a request to reset the password on your <span style="color:#7D7D7D;">PAYMENT</span> <span style="color:#23AFDB;">GATWAY</span> Account.</p>
                            <h1>${emailVerificationOtp}</h1>
                            <p> Enter this code to complete the reset.</p>
                            <p> Thanks for helping us keep your account secure.
                             Team IEMlabs</p>`


                };

                const result = await transporter.sendMail(mailOptions)
                return result
            } catch (error) {
                return error
            }
        }

        sendmail().then(result => console.log("email sent..", result)).catch(error => console.log(error.message))
    }
    else {
        res.status(404);
        const err = new Error("No user account found with this email address!");
        next(err);
    }

}

export const updatePassword = async (req, res, next) => {
    const {id} = req.params;
    const {password} = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const upadatePassword = await userAccount.findByIdAndUpdate(id,{"password":hashedPassword},{
        new:true,
    })
    res.json(upadatePassword);
}