import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

export interface Subscription {
  id: string;
  status: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      price: {
        id: string;
        product: string;
        unit_amount: number;
        currency: string;
        recurring: {
          interval: string;
        };
      };
    }>;
  };
}

export const createCustomer = async (email: string, name: string) => {
  try {
    const response = await fetch('/api/create-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    });

    if (!response.ok) {
      throw new Error('Failed to create customer');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const createSubscription = async (customerId: string, priceId: string) => {
  try {
    const response = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId, priceId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const getSubscription = async (subscriptionId: string): Promise<Subscription> => {
  try {
    const response = await fetch(`/api/subscription/${subscriptionId}`);

    if (!response.ok) {
      throw new Error('Failed to get subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

export const updateSubscription = async (subscriptionId: string, newPriceId: string) => {
  try {
    const response = await fetch('/api/update-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId, newPriceId }),
    });

    if (!response.ok) {
      throw new Error('Failed to update subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const getStripe = () => stripePromise; 