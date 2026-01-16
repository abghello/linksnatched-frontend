import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StripePaymentElementOptions } from '@stripe/stripe-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { paths } from '@/routes/paths';
import { Loader2Icon } from 'lucide-react';

export const PaymentForm = ({
  billing,
  monthlyAmount,
  yearlyAmount,
  total,
}: {
  billing: string;
  monthlyAmount: number;
  yearlyAmount: number;
  total: number;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // const [customerName, setCustomerName] = useState('');
  const [billingType, setBillingType] = useState(
    billing === 'month' ? 'month' : 'annual'
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const cardElement = elements.getElement(PaymentElement);

    if (!cardElement) {
      setMessage('Please enter a valid card number');
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage('Payment failed');
    } else {
      setMessage('An unexpected error occurred.');
    }

    setIsLoading(false);
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    params.set('billing', billingType);
    router.replace(`${paths.checkout}?${params.toString()}`);
  }, [billingType, monthlyAmount, yearlyAmount]);

  return (
    <form id='payment-form' onSubmit={handleSubmit}>
      <div className='flex flex-row justify-center gap-4 w-full'>
        <div className='flex flex-col gap-4'>
          {/* <div className='flex flex-col gap-2'>
            <label className='text-[16px] font-bold text-gray-500'>Name</label>
            <Input
              type='text'
              autoCapitalize='none'
              autoComplete='name'
              autoCorrect='on'
              placeholder='Enter your name'
              className='h-11'
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div> */}
          <div className='flex flex-col gap-2'>
            <label className='text-[16px] font-bold text-gray-500'>
              Payment Method
            </label>
            <PaymentElement
              id='payment-element'
              options={paymentElementOptions}
            />
          </div>
        </div>

        <div className='relative w-[350px]'>
          <div className='flex flex-col gap-4 mt-4'>
            <span className='text-md text-gray-500 font-bold'>
              Subscription Details
            </span>
            <div className='flex flex-row gap-2'>
              <div
                className={cn(
                  'flex flex-col gap-2 border-2 border-gray-200 rounded-lg p-4 w-full cursor-pointer',
                  billingType === 'month' && 'border-blue-500'
                )}
                onClick={() => setBillingType('month')}
              >
                <h1 className='text-sm font-bold'>Monthly</h1>
                <h1 className='text-sm text-gray-500'>
                  ${monthlyAmount} per month
                </h1>
              </div>
              <div
                className={cn(
                  'flex flex-col gap-2 border-2 border-gray-200 rounded-lg p-4 w-full cursor-pointer',
                  billingType === 'annual' && 'border-blue-500'
                )}
                onClick={() => setBillingType('annual')}
              >
                <h1 className='text-sm font-bold'>Yearly</h1>
                <h1 className='text-sm text-gray-500'>
                  ${yearlyAmount} per month
                </h1>
              </div>
            </div>
          </div>

          <div className='absolute bottom-0 flex flex-col gap-2 w-full'>
            <div className='flex flex-col justify-between'>
              <div className='flex justify-between w-full border-b-2 border-gray-200 pb-2'>
                {billingType === 'monthly' ? (
                  <span>Monthly Subscription</span>
                ) : (
                  <span>Yearly Subscription</span>
                )}
                <span>${total}</span>
              </div>
              <div className='flex flex-row justify-between w-full pt-2'>
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>
            <Button
              type='submit'
              className='w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium'
            >
              {isLoading && <Loader2Icon className='animate-spin' />}
              Purchase
            </Button>
          </div>

          {message && <div id='payment-message'>{message}</div>}
        </div>
      </div>
    </form>
  );
};
