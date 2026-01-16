'use client';

import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { Appearance, loadStripe } from '@stripe/stripe-js';
import '@/components/stripe/stripe.css';
import { PaymentForm } from '@/components/stripe/PaymentForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPriceInfo, createSubscription } from '@/actions/checkout';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [billing, setBilling] = useState<string | null>(
    searchParams.get('billing') || null
  );
  const [monthlyAmount, setMonthlyAmount] = useState<number>(0);
  const [yearlyAmount, setYearlyAmount] = useState<number>(0);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const fetchClientSecret = async () => {
      if (total === 0) return;
      const priceId =
        searchParams.get('billing') === 'month'
          ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
          : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

      const data = await createSubscription(
        searchParams.get('customerId')!,
        priceId!
      );
      setClientSecret(data.clientSecret);
    };

    fetchClientSecret();
  }, [total]);

  useEffect(() => {
    const billingParam = searchParams.get('billing');
    setBilling(billingParam || '');
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams.get('billing') || !searchParams.get('email')) {
      router.push('/');
    }

    const fetchPrice = async () => {
      const monthPrice = await getPriceInfo(
        process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!
      );
      const yearlyPrice = await getPriceInfo(
        process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID!
      );

      setMonthlyAmount(Number((monthPrice.unit_amount / 100).toFixed(2)));
      setYearlyAmount(Number((yearlyPrice.unit_amount / 100 / 12).toFixed(2)));

      if (billing === 'month') {
        setTotal(Number((monthPrice.unit_amount / 100).toFixed(2)));
      } else {
        setTotal(Number((yearlyPrice.unit_amount / 100).toFixed(2)));
      }
    };

    fetchPrice();
  }, [billing]);

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );

  const appearance: Appearance = {
    theme: 'stripe',
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{ appearance, clientSecret: clientSecret }}
          key={clientSecret}
        >
          <PaymentForm
            billing={billing || 'month'}
            monthlyAmount={monthlyAmount}
            yearlyAmount={yearlyAmount}
            total={total}
          />
        </Elements>
      )}
    </div>
  );
}
