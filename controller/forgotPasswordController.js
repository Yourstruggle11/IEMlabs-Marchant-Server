import userAccount from '../model/userAcSchema.js'
import bcrypt from 'bcrypt'
import env from 'dotenv'

import forgotPasswordMailer from '../mailer/forgotPasswordMailer.js'

env.config()

/**
 *
 * @description Send email to user to reset password
 * @route POST /user/forgot-password/sendmail
 * @params { email } from body
 * @access Public
 *
 */
export const sendRecoveryMail = async (req, res) => {
    const { email } = req.body

    const checkEmail = await userAccount.findOne({ email: email })
    if (checkEmail) {
        //creatin random four digit number for emailVerificationOtp
        const emailVerificationOtp = Math.floor(1000 + Math.random() * 9000)
        res.json({
            _id: checkEmail._id,
            name: checkEmail.username,
            email: checkEmail.email,
            emailVerificationOtp: emailVerificationOtp
        })

        //sending verification email to user

        forgotPasswordMailer(
            checkEmail.username,
            checkEmail.email,
            emailVerificationOtp
        )
            .then((result) => console.log('email sent..', result))
            .catch((error) => console.log(error.message))
    } else {
        res.status(404).json({
            status: false,
            message: 'No user account found with this email address!'
        })
    }
}

/**
 *
 * @description Update user password
 * @route POST /user/forgot-password/update-password/:id
 * @params { id } from body
 * @access Public
 *
 */
export const updatePassword = async (req, res, next) => {
    const { id } = req.params
    const { password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const upadatePassword = await userAccount.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        {
            new: true
        }
    )
    res.json(upadatePassword)
}
