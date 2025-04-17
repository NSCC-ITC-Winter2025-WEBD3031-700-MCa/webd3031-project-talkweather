import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2023-10-16" as any,
    });

    const data = await request.json();
    const { priceId, userId } = data; // Expect userId from the client

    console.log("Received priceId:", priceId);
    console.log("Received userId:", userId);

    if (!priceId || !userId) {
      console.error("Stripe Price ID or User ID is missing!");
      return NextResponse.json({ error: "Price ID and User ID are required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      metadata: { userId }, // Pass userId for later use in the webhook
    });

    console.log("Stripe Session Created:", session);
    return NextResponse.json(session.url);
  } catch (error: any) {
    console.error("Stripe API Error:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}