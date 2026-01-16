import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const email = body.email;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const customer = await stripe.customers.create({
    email: email,
  });

  return NextResponse.json({ customer });
};
