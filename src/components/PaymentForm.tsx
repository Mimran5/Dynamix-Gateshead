import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, createSetupIntent, confirmPayment } from '../services/paymentService';

interface PaymentFormProps {
  amount?: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  isDirectDebit?: boolean;
  clientSecret?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onSuccess,
  onError,
  isDirectDebit = false,
  clientSecret,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      if (clientSecret) {
        // Handle subscription payment
        const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                // Add billing details if needed
              },
            },
          }
        );

        if (paymentError) {
          throw new Error(paymentError.message);
        }

        if (paymentIntent.status === 'succeeded') {
          onSuccess();
        }
      } else if (isDirectDebit) {
        // Handle direct debit setup
        const setupIntent = await createSetupIntent();
        const { error: setupError, setupIntent: confirmedSetupIntent } = await stripe.confirmCardSetup(
          setupIntent.client_secret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                // Add billing details if needed
              },
            },
          }
        );

        if (setupError) {
          throw new Error(setupError.message);
        }

        // Store the payment method ID for future use
        console.log('Payment method set up:', confirmedSetupIntent.payment_method);
        onSuccess();
      } else {
        // Handle one-time payment
        if (!amount) {
          throw new Error('Amount is required for one-time payment');
        }
        const paymentIntent = await createPaymentIntent(amount);
        const { error: paymentError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
          paymentIntent.clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                // Add billing details if needed
              },
            },
          }
        );

        if (paymentError) {
          throw new Error(paymentError.message);
        }

        if (confirmedPaymentIntent.status === 'succeeded') {
          await confirmPayment(paymentIntent.id, confirmedPaymentIntent.payment_method as string);
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message);
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {isDirectDebit ? 'Set Up Direct Debit' : 'Payment Details'}
        </h2>
        {amount && !isDirectDebit && !clientSecret && (
          <p className="text-gray-600 mb-4">
            Amount to pay: £{(amount / 100).toFixed(2)}
          </p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Card Details
        </label>
        <div className="p-3 border border-gray-300 rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-teal-600 hover:bg-teal-700'
        }`}
      >
        {loading ? 'Processing...' : isDirectDebit ? 'Set Up Direct Debit' : 'Pay Now'}
      </button>
    </form>
  );
};

export default PaymentForm; 