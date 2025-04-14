import Stripe from 'stripe';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export const runtime = 'nodejs'; // important for edge compatibility

// Helper to convert ReadableStream to Buffer
async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  console.log("webhook");

  const sig = req.headers.get('stripe-signature')!;
  const buf = await buffer(req.body!); // replace rawBody with our buffer()

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isVerified: true,
          verifiedSince: new Date(),
        },
      });
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}