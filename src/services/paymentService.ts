import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

export interface SetupIntent {
  id: string;
  status: string;
  client_secret: string;
}

export const createPaymentIntent = async (amount: number, currency: string = 'gbp'): Promise<PaymentIntent> => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const createSetupIntent = async (): Promise<SetupIntent> => {
  try {
    const response = await fetch('/api/create-setup-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create setup intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw error;
  }
};

export const confirmPayment = async (paymentIntentId: string, paymentMethodId: string) => {
  try {
    const response = await fetch('/api/confirm-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentIntentId, paymentMethodId }),
    });

    if (!response.ok) {
      throw new Error('Failed to confirm payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

export const getStripe = () => stripePromise; 