import { buffer } from "micro";
import Stripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client'

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Stripe with TypeScript typing
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const config = {
  api: {
    bodyParser: false, // Required for Stripe webhooks
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const sig = req.headers["stripe-signature"];
  
  if (!sig) {
    return res.status(400).json({ error: "Missing Stripe signature" });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody.toString(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook verification failed:", err);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    if (!session.customer_details?.email) {
      return res.status(400).json({ error: "Customer email not found" });
    }

    try {
      // Create payment record and update user verification status in a transaction
      await prisma.$transaction([
        prisma.payment.create({
          data: {
            user: { connect: { email: session.customer_details.email } },
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || 'usd',
            stripeSessionId: session.id,
            status: 'completed',
            verificationTier: 'basic' // Adjust based on your product
          }
        }),
        prisma.user.update({
          where: { email: session.customer_details.email },
          data: {
            isVerified: true,
            verifiedAt: new Date()
          }
        })
      ]);

      // Optional: Create a notification for the user
      await prisma.notification.create({
        data: {
          recipient: { connect: { email: session.customer_details.email } },
          issuer: { connect: { email: "system@yourdomain.com" } }, // Or use a system user
          type: "PAYMENT",
          content: "Your verification payment was successful!"
        }
      });

    } catch (err: any) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database operation failed" });
    }
  }

  return res.status(200).json({ received: true });
}