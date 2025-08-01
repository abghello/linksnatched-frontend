import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import { paths } from '@/routes/paths';
import { CONFIG } from '@/config-global';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  let event: Stripe.Event;
  const supabase = await createClient();

  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = await stripe.checkout.sessions.retrieve(
          (event.data.object as Stripe.Checkout.Session).id,
          {
            expand: ['line_items'],
          }
        );
        // const customerId = session.customer as string;
        const customerDetails = session.customer_details;

        // if (customerDetails?.email) {
        //   const { data: user, error } = await supabase
        //     .from('users')
        //     .select('*')
        //     .eq('email', customerDetails.email)
        //     .single();
        //   if (error) throw error;

        //   if (!user.customerId) {
        //     await supabase
        //       .from('users')
        //       .update({
        //         customer_id: session.customer as string,
        //       })
        //       .eq('id', user.id);
        //   }

        //   const lineItems = session.line_items?.data || [];

        //   for (const item of lineItems) {
        //     const priceId = item.price?.id;
        //     const isSubscription = item.price?.type === 'recurring';

        //     if (isSubscription) {
        //       let endDate = new Date();
        //       if (priceId === process.env.STRIPE_YEARLY_PRICE_ID!) {
        //         endDate.setFullYear(endDate.getFullYear() + 1); // 1 year from now
        //       } else if (priceId === process.env.STRIPE_MONTHLY_PRICE_ID!) {
        //         endDate.setMonth(endDate.getMonth() + 1); // 1 month from now
        //       } else {
        //         throw new Error('Invalid priceId');
        //       }
        //       // it is gonna create the subscription if it does not exist already, but if it exists it will update it
        //       await supabase.from('subscriptions').upsert(
        //         {
        //           user_id: user.id,
        //           start_date: new Date(),
        //           end_date: endDate,
        //           plan: 'premium',
        //           period:
        //             priceId === process.env.STRIPE_YEARLY_PRICE_ID!
        //               ? 'yearly'
        //               : 'monthly',
        //           status: 'success',
        //         },
        //         {
        //           onConflict: 'user_id',
        //         }
        //       );

        //       await supabase
        //         .from('users')
        //         .update({
        //           plan: 'premium',
        //         })
        //         .eq('id', user.id);
        //     } else {
        //       // one_time_purchase
        //       await supabase
        //         .from('users')
        //         .update({
        //           plan: 'premium',
        //         })
        //         .eq('id', user.id);
        //     }
        //   }
        // }
        break;
      case 'customer.subscription.deleted': {
        const subscription = await stripe.subscriptions.retrieve(
          (event.data.object as Stripe.Subscription).id
        );

        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('customer_id', subscription.customer as string)
          .single();

        if (user) {
          await supabase
            .from('users')
            .update({
              plan: 'free',
            })
            .eq('id', user.id);
        } else {
          console.error('User not found for the subscription deleted event.');
          throw new Error('User not found for the subscription deleted event.');
        }

        break;
      }
      case 'invoice.paid': {
        try {
          const invoice = await stripe.invoices.retrieve(event.data.object.id!);
          const customerId = invoice.customer as string;
          const name = invoice.customer_name as string;
          const email = invoice.customer_email as string;

          await supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: true,
              emailRedirectTo: `${CONFIG.prodUrl}${paths.root}`,
            },
          });

          const { data: user, error } = await supabase
            .from('users')
            .update({
              name: name,
              plan: 'premium',
              customer_id: customerId,
            })
            .eq('email', email)
            .select()
            .single();

          const total = invoice.total / 100;
          const period = total === 19.99 ? 'month' : 'annual';

          const endDate = new Date(invoice.period_end * 1000);
          if (total === 19.99) {
            endDate.setMonth(endDate.getMonth() + 1);
          } else {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }

          const { data: newSubscription, error: subscriptionError } =
            await supabase
              .from('subscriptions')
              .insert({
                user_id: user?.id,
                start_date: new Date(invoice.period_start * 1000),
                end_date: endDate,
                plan: 'premium',
                period: period,
                status: 'success',
              })
              .select()
              .single();

          console.log('newSubscription->', newSubscription);
          console.log('subscriptionError->', subscriptionError);
        } catch (error) {
          console.error('Error retrieving invoice', error);
        }
        break;
      }
      case 'invoice.payment_failed': {
        console.log('invoice payment failed');
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error('Error handling event', error);
    return new Response('Webhook Error', { status: 400 });
  }

  return new Response('Webhook received', { status: 200 });
}
