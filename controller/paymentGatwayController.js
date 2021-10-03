import env from "dotenv";
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";

env.config();

const stripe = new Stripe(process.env.SECRET_KEY);

export const payment = async (req, res) => {
  // const {product, token} = req.body;

  try {
    const { product, token } = req.body;
    // const idempontencyKey = uuidv4();

    const creatCustomer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });
    if (creatCustomer) {
      const createCharge = await stripe.charges.create({
        amount: product.price * 100,
        currency: "INR",
        customer: creatCustomer.id,
        receipt_email: token.email,
        description: product.name,
        shipping: {
          name: token.card.name,
          address: {
            country: token.card.address_country,
          },
        },
      });
      if (createCharge === "Your card was declined.") {
        console.log(createCharge);
        return res.status(200).json(createCharge);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
