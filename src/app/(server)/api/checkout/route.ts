import { NextRequest } from "next/server";
import Stripe from "stripe";
import { validateRequest } from "@/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(req: NextRequest) {
  const { user } = await validateRequest();
  
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{
        price: body.priceId,
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      metadata: {
        userId: user.id  // Critical for webhook
      },
      client_reference_id: user.id  // Backup identifier
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return new Response("Payment failed", { status: 500 });
  }
}