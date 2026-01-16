import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const amount = body.amount;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { client_secret: clientSecret } = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return NextResponse.json({ clientSecret });
};
