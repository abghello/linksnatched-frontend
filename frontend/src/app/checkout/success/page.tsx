import { stripe } from '@/lib/stripe';
import React, { startTransition } from 'react';
import { redirect } from 'next/navigation';
import { SuccessClient } from './success-client';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined | any }>;
}) {
  const { payment_intent: paymentIntentId } = await searchParams;

  if (!paymentIntentId) redirect('/');

  const paymentIntent = await stripe.paymentIntents.retrieve(
    paymentIntentId as string
  );
  if (!paymentIntent) redirect('/');

  const { status } = paymentIntent;

  if (status === 'succeeded') {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <SuccessClient status={status} />
      </div>
    );
  }
  return <div>Loading...</div>;
}
