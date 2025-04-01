// import { buffer } from "micro";
// import Stripe from "stripe";
// import { Pool } from "@neondatabase/serverless";

// // Initialize Stripe
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // Initialize Neon database connection
// const pool = new Pool({
//   connectionString: process.env.NEON_DATABASE_URL,
// });

// export const config = {
//   api: {
//     bodyParser: false, // Stripe requires raw body
//   },
// };

// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     const rawBody = await buffer(req);
//     event = stripe.webhooks.constructEvent(
//       rawBody.toString(),
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle payment success event
//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;
//     const customerEmail = session.customer_details.email;

//     try {
//       // Update user in Neon database
//       const client = await pool.connect();
//       await client.query(
//         "UPDATE users SET is_verified = true WHERE email = $1",
//         [customerEmail]
//       );
//       client.release();
//     } catch (err) {
//       console.error("Database update error:", err);
//       return res.status(500).json({ error: "Database update failed" });
//     }
//   }

//   res.json({ received: true });
// }
