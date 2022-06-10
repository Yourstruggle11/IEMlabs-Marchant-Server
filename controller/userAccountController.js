import userAccount from '../model/userAcSchema.js'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import env from 'dotenv'
import { generateToken } from '../utils/generateToken.js'
import userAccountConfirmationMailer from '../mailer/userAccountConfirmationMailer.js'

env.config()

/**
 *
 * @description Create new user
 * @route POST /user/signup
 * @params {username, email, password} from body
 * @access Public
 *
 */
export const registerUser = async (req, res) => {
    const { username, email, password } = req.body

    const userExist = await userAccount.findOne({ email: email })
    if (userExist) {
        res.status(404).json({
            status: false,
            message: 'User with this same email already exist!'
        })
    } else {
        //creatin random four digit number for emailVerificationOtp
        const emailVerificationOtp = Math.floor(1000 + Math.random() * 9000)
        const createUserAccount = await userAccount.create({
            username,
            email,
            password
        })
        if (createUserAccount) {
            res.json({
                _id: createUserAccount._id,
                name: createUserAccount.username,
                email: createUserAccount.email,
                emailVerificationOtp: emailVerificationOtp
            })

            //sending verification email to user using google api and nodemailer
            userAccountConfirmationMailer(
                createUserAccount.username,
                createUserAccount.email,
                emailVerificationOtp
            )
                .then((result) => console.log('email sent..', result))
                .catch((error) => console.log(error.message))
        } else {
            res.status(404).json({
                status: false,
                message: 'Invalid Data!'
            })
        }
    }
}

/**
 *
 * @description Login user
 * @route POST /user/login
 * @params { email, password} from body
 * @access Public
 *
 */
export const loginUser = async (req, res) => {
    const { email, password } = req.body

    const checkEmail = await userAccount.findOne({ email: email })

    if (checkEmail) {
        const checkActivation = await userAccount.find({
            email: { $eq: email },
            status: { $eq: true }
        })
        function isEmpty(obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) return false
            }
            return true
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
            } else {
                res.status(401).json({
                    status: false,
                    message: 'Invalid password!'
                })
            }
        } else {
            res.status(401).json({
                status: false,
                message: 'Opps seems your account is not activate yet!'
            })
        }
    } else {
        res.status(404).json({
            status: false,
            message: 'No user available with this email!'
        })
    }
}

/**
 *
 * @description Get all user account from DB
 * @route GET /user/
 * @params N/A
 * @access Admin
 *
 */
export const getUser = async (req, res) => {
    try {
        const getUserAccount = await userAccount.find()
        res.status(200).json(getUserAccount)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

/**
 *
 * @description DELETE a single user
 * @route DELETE /user/:id
 * @params { id} from params
 * @access Admin
 *
 */
export const deleteUser = async (req, res) => {
    const { id: id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).send('no user found!')
    } else {
        try {
            await userAccount.findByIdAndDelete(id)
            res.status(200).json({ message: 'user account deleted successfully..' })
        } catch (error) {
            res.status(404).json({ message: error.message })
        }
    }
}

/**
 *
 * @description Activate user account
 * @route PUT /user/account-activation/:id
 * @params { id} from params
 * @access Public
 *
 */
export const accountActivation = async (req, res) => {
    const { id: id } = req.params
    const activeUserAccount = await userAccount.findByIdAndUpdate(
        id,
        { status: true },
        {
            new: true
        }
    )
    if (activeUserAccount) {
        res.json({
            status: true,
            message: 'Account activated successfully..',
            data: activeUserAccount
        })
    } else {
        res.status(404).josn({
            status: false,
            message: 'Something went wrong!',
        })
    }
}
