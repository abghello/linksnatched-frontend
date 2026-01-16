import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const priceId = searchParams.get('priceId');

  if (!priceId) {
    return NextResponse.json(
      { error: 'Price ID is required' },
      { status: 400 }
    );
  }

  try {
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product'],
    });

    console.log('price->', price);

    return NextResponse.json({ price });
  } catch (error) {
    console.error('Error fetching price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price details' },
      { status: 500 }
    );
  }
};
