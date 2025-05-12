import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../services/paymentService';
import PaymentForm from './PaymentForm';

interface StripeProviderProps {
  amount?: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  isDirectDebit?: boolean;
  clientSecret?: string;
}

const StripeProvider: React.FC<StripeProviderProps> = (props) => {
  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripeProvider; 