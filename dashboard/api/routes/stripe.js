import express from 'express';
import Stripe from 'stripe';
import Guild from '../../../src/models/Guild.js';
import logger from '../../../src/utils/logger.js';
import { adminCheck } from '../middleware/adminCheck.js';

export const stripeCheckoutRouter = express.Router();
export const stripeWebhookRouter = express.Router();

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
stripeCheckoutRouter.post('/checkout', adminCheck, async (req, res) => {
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
            platinum_yearly: process.env.STRIPE_PRICE_PLATINUM_YEARLY,
            lite_lifetime: process.env.STRIPE_PRICE_LITE_LIFETIME,
            premium_lifetime: process.env.STRIPE_PRICE_PREMIUM_LIFETIME,
            platinum_lifetime: process.env.STRIPE_PRICE_PLATINUM_LIFETIME
        };

        const allowedPlanTypes = new Set(Object.keys(prices));
        const selectedPlanType = planType || 'premium';

        if (!allowedPlanTypes.has(selectedPlanType)) {
            return res.status(400).json({ error: 'Piano non valido.' });
        }

        const priceId = prices[selectedPlanType];

        if (!priceId) {
            return res.status(400).json({ error: 'Piano non valido o non configurato.' });
        }

        const frontendUrl = process.env.DASHBOARD_FRONTEND_URL || 'https://verixbot.com';
        const isLifetime = selectedPlanType.endsWith('_lifetime');
        const checkoutMode = isLifetime ? 'payment' : 'subscription';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: checkoutMode,
            success_url: `${frontendUrl}/config/${guildId}/premium?payment=success`,
            cancel_url: `${frontendUrl}/config/${guildId}/premium?payment=cancelled`,
            client_reference_id: guildId, // This is crucial for the webhook to know which guild paid!
            metadata: {
                guildId,
                planType: selectedPlanType
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
stripeWebhookRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
        logger.error('[Stripe Webhook Error] Stripe key or webhook secret is not configured.');
        return res.status(500).send('Stripe webhook not configured');
    }

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
                     const isLifetime = planType.endsWith('_lifetime');
                     if (planType.endsWith('_yearly')) {
                         planType = planType.replace('_yearly', '');
                     } else if (planType.endsWith('_lifetime')) {
                         planType = planType.replace('_lifetime', '');
                     }
                     logger.info(`[Stripe] Payment successful for guild ${guildId} (Plan: ${planType})`);
                     
                     // Update database
                     await Guild.findOneAndUpdate(
                         { guildId },
                         { 
                             isPremium: true,
                             premiumTier: planType,
                             stripeSubscriptionId: isLifetime ? null : session.subscription,
                             stripeCustomerId: session.customer,
                             stripePaymentMode: session.mode,
                             premiumLifetime: isLifetime
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
                        premiumTier: 'none',
                        stripeSubscriptionId: null,
                        premiumLifetime: false
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

export default stripeCheckoutRouter;
