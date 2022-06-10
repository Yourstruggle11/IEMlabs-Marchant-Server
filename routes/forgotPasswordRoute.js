import express from 'express'
import {
    updatePassword,
    sendRecoveryMail
} from '../controller/forgotPasswordController.js'

const route = express.Router()

route.post('/sendmail', sendRecoveryMail)
route.put('/update-password/:id', updatePassword)

export default route
