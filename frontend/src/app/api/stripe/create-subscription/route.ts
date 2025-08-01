import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const customerId = body.customerId;
  const priceId = body.priceId;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [
      {
        price: priceId,
      },
    ],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    // billing_mode: 'flexible',
    expand: ['latest_invoice.confirmation_secret'],
  });

  return NextResponse.json({
    subscriptionId: subscription.id,
    clientSecret: (subscription.latest_invoice as Stripe.Invoice)
      .confirmation_secret?.client_secret,
  });
};
