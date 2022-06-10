import nodemailer from 'nodemailer'
import { google } from 'googleapis'
import env from 'dotenv'

env.config()

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

const oAuth2Clint = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oAuth2Clint.setCredentials({ refresh_token: REFRESH_TOKEN })

async function sendmail(username, email, emailVerificationOtp) {
    try {
        const accessToken = await oAuth2Clint.getAccessToken()

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL,
                pass: process.env.PASS,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        })

        const mailOptions = {
            from: 'IEMlabs Paymentgateway <souviksen093@gmail.com>',
            to: email,
            subject: 'Email varification For account at IEMlabs Paymentgateway',
            html: `<div><h2>Hi ${username}!</h2>
            <p>Your verification code is <b> ${emailVerificationOtp} </b>.</p>
            <p>Enter this code in our PAYMENT GATWAY to activate your User account.If you have any questions, send us an email or send us message. </p>
           <p> We are glad you are here!</p>
            <p><b> Team IEMlabs </b></p></div>`
        }

        const result = await transporter.sendMail(mailOptions)
        return result
    } catch (error) {
        return error
    }
}

export default sendmail
