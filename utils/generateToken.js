import jwt from 'jsonwebtoken'
import env from 'dotenv'

env.config()

export const generateToken = (id) => {
    return jwt.sign({ _id: id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1s'
    })
}
