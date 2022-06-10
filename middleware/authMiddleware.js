import jwt from 'jsonwebtoken'
import user from '../model/userAcSchema.js'
import env from 'dotenv'

env.config()

const authMiddleware = async (req, res, next) => {
    let token

    try {
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
                token = req.headers.authorization.split(' ')[1]
                let decodedId
                await jwt.verify(
                    token,
                    process.env.ACCESS_TOKEN_SECRET,
                    (err, decoded) => {
                        if (err) {
                            return res.status(403).json({
                                status: false,
                                message: err,
                            })
                        }
                        decodedId = decoded._id
                    }
                )
    
                // store Auth (- password) to req.user
                req.user = await user.findById(decodedId).select('-password')
                next()
        } else {
            res.status(401).json({
                status: false,
                message: 'Not Authorized, No token is present'
            })
        }
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({
                status: false,
                message: 'Unauthorised'
            })
        } else {
            // token expired
            res.status(404).json({
                status: false,
                message: error
            })
        }
    }
}

export default authMiddleware
