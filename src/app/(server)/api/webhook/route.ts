import Stripe from 'stripe';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export const runtime = 'nodejs';

async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  const body = await buffer(req.body!);

  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId || session.client_reference_id;

    if (!userId) {
      console.error("No user ID in session");
      return new Response("User ID missing", { status: 400 });
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true }
      });
    } catch (err: unknown) {
      console.error("Database update failed:", err);
      return new Response("Database error", { status: 500 });
    }
  }

  return new Response(null, { status: 200 });
}