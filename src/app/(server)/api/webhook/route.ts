import Stripe from 'stripe';

import { NextRequest } from 'next/server';

import prisma from '@/lib/prisma';



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {

  apiVersion: '2025-03-31.basil',

});



export const runtime = 'nodejs';



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

  const sig = req.headers.get('stripe-signature')!;

  const buf = await buffer(req.body!);



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



   if (!userId) {

     console.error("No user ID found in session");

     return new Response('User ID not found', { status: 400 });

   }



   try {

     await prisma.user.update({

       where: { id: userId },

       data: {

         isVerified: true,

         verifiedSince: new Date(),

       },

     });



     const apiResponse = await fetch(`https://webd3031-project-talkweather.vercel.app/api/users/${userId}/verify`, {

       method: 'PATCH',

       headers: {

         'Content-Type': 'application/json',

       },

     });



     if (!apiResponse.ok) {

       throw new Error(`API request failed with status ${apiResponse.status}`);

     }



     console.log(`User ${userId} successfully verified`);

     return new Response(JSON.stringify({ success: true }), { status: 200 });



   } catch (error) {

     console.error("Error verifying user:", error);

     return new Response('Error verifying user', { status: 500 });

   }

  }



  return new Response(JSON.stringify({ received: true }), { status: 200 });

}
