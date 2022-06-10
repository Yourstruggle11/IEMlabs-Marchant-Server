import nodemailer from "nodemailer"
import {google} from "googleapis"
import env from "dotenv";

env.config();
        
        
        const CLIENT_ID =  process.env.CLIENT_ID
        const CLIENT_SECRET = process.env.CLIENT_SECRET
        const REDIRECT_URI = process.env.REDIRECT_URI
        const REFRESH_TOKEN = process.env.REFRESH_TOKEN

        const oAuth2Clint = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
        oAuth2Clint.setCredentials({ refresh_token: REFRESH_TOKEN })



        async function sendmail(username, email,emailVerificationOtp) {
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
                    to: email,
                    subject: `${username}, here's your PIN`,
                    html: `<h2>Hi ${username}, </h2>
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