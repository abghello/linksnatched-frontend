export async function getPriceInfo(priceId: string) {
  try {
    const response = await fetch(`/api/stripe/get-price?priceId=${priceId}`);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data.price;
  } catch (error) {
    console.error('Error fetching price details:', error);
    throw error;
  }
}

export async function createSubscription(customerId: string, priceId: string) {
  const response = await fetch('/api/stripe/create-subscription', {
    method: 'POST',
    body: JSON.stringify({ customerId, priceId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create subscription');
  }

  return response.json();
}
