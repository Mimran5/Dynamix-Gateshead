import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import stripeRoutes from './routes/stripe';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

// Use stripe routes
app.use('/api/stripe', stripeRoutes);

// Create a customer
app.post('/api/create-customer', async (req, res) => {
  try {
    const { email, name } = req.body;
    const customer = await stripe.customers.create({
      email,
      name,
    });
    res.json({ customerId: customer.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a subscription
app.post('/api/create-subscription', async (req, res) => {
  try {
    const { customerId, priceId } = req.body;

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscription status
app.get('/api/subscription/:subscriptionId', async (req, res) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(req.params.subscriptionId);
    res.json(subscription);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
app.post('/api/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    res.json(subscription);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update subscription
app.post('/api/update-subscription', async (req, res) => {
  try {
    const { subscriptionId, newPriceId } = req.body;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
    });

    res.json(updatedSubscription);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'gbp' } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.json({
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
      const subscriptionCreated = event.data.object;
      // Handle subscription created
      break;
    case 'customer.subscription.updated':
      const subscriptionUpdated = event.data.object;
      // Handle subscription updated
      break;
    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object;
      // Handle subscription deleted
      break;
    case 'invoice.payment_succeeded':
      const invoicePaymentSucceeded = event.data.object;
      // Handle successful payment
      break;
    case 'invoice.payment_failed':
      const invoicePaymentFailed = event.data.object;
      // Handle failed payment
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 