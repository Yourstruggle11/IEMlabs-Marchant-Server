import userAccount from "../model/userAcSchema.js"
import bcrypt from "bcrypt";
import env from "dotenv";

import forgotPasswordController from "../mailer/forgotPasswordMailer.js"

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


        forgotPasswordController(checkEmail.username,checkEmail.email, emailVerificationOtp).then(result => console.log("email sent..", result)).catch(error => console.log(error.message))
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