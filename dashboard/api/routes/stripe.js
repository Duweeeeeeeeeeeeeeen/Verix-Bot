import express from 'express';
import Stripe from 'stripe';
import Guild from '../../../src/models/Guild.js';
import logger from '../../../src/utils/logger.js';

const router = express.Router();

// Initialize Stripe ONLY if the key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16' // Use latest or preferred API version
    });
}

/**
 * 1. Checkout Endpoint
 * Requires express.json() to parse the body.
 */
router.post('/checkout', express.json(), async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ error: 'Stripe non configurato sul server.' });
    }

    try {
        const { guildId, planType } = req.body;
        
        if (!guildId) {
            return res.status(400).json({ error: 'guildId è richiesto' });
        }

        // Example: Map planType to Stripe Price IDs
        // You should define these in your .env or a config file
        const prices = {
            lite: process.env.STRIPE_PRICE_LITE,
            premium: process.env.STRIPE_PRICE_PREMIUM,
            platinum: process.env.STRIPE_PRICE_PLATINUM,
            lite_yearly: process.env.STRIPE_PRICE_LITE_YEARLY,
            premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
            platinum_yearly: process.env.STRIPE_PRICE_PLATINUM_YEARLY
        };

        const priceId = prices[planType || 'premium'];

        if (!priceId) {
            return res.status(400).json({ error: 'Piano non valido o non configurato.' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription', // Change to 'payment' for one-time purchases
            success_url: `${process.env.DASHBOARD_FRONTEND_URL}/config/${guildId}/premium?payment=success`,
            cancel_url: `${process.env.DASHBOARD_FRONTEND_URL}/config/${guildId}/premium?payment=cancelled`,
            client_reference_id: guildId, // This is crucial for the webhook to know which guild paid!
            metadata: {
                guildId,
                planType
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        logger.error(`[Stripe Checkout Error] ${error.message}`);
        res.status(500).json({ error: 'Errore durante la creazione della sessione di pagamento.' });
    }
});

/**
 * 2. Webhook Endpoint
 * MUST use express.raw() to verify the Stripe signature!
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !endpointSecret) {
        logger.warn('[Stripe Webhook] Received webhook but Stripe is not fully configured.');
        return res.status(400).send('Webhook Secret Not Configured');
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        logger.error(`[Stripe Webhook Error] Signature validation failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                 const session = event.data.object;
                 const guildId = session.client_reference_id || session.metadata.guildId;
                 let planType = session.metadata.planType || 'premium';
 
                 if (guildId) {
                     if (planType.endsWith('_yearly')) {
                         planType = planType.replace('_yearly', '');
                     }
                     logger.info(`[Stripe] Payment successful for guild ${guildId} (Plan: ${planType})`);
                     
                     // Update database
                     await Guild.findOneAndUpdate(
                         { guildId },
                         { 
                             isPremium: true,
                             premiumTier: planType,
                             // Optionally save the Stripe subscription ID
                             stripeSubscriptionId: session.subscription,
                             stripeCustomerId: session.customer
                         },
                         { upsert: true }
                     );
                 }
                break;
            }
            case 'customer.subscription.deleted': {
                // Handle cancellation
                const subscription = event.data.object;
                logger.info(`[Stripe] Subscription deleted: ${subscription.id}`);
                
                await Guild.findOneAndUpdate(
                    { stripeSubscriptionId: subscription.id },
                    { 
                        isPremium: false,
                        premiumTier: 'none'
                    }
                );
                break;
            }
            // Add other events as needed
            default:
                logger.debug(`[Stripe] Unhandled event type ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        res.send();
    } catch (error) {
        logger.error(`[Stripe Webhook Processing Error] ${error.message}`);
        res.status(500).send('Internal Server Error processing webhook');
    }
});

export default router;
