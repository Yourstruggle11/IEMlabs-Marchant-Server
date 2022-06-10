import  express  from "express";

const route = express.Router();


const time = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })

route.get('/', function (req, res) {
    res.json({
        message: 'IEMlabs Merchant Main server',
        Note: 'This is an interview assignment, This has nothing to do with iemlabs, I am not bracking any copyright law',
        deployTime: time,
      })
})


export default route;