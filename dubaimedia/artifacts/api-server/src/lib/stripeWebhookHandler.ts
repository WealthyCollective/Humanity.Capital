import Stripe from 'stripe';
import { getDb, updateDb } from './db.js';
import { logger } from './logger.js';
import { syncUserSubscription } from '../routes/stripe.js';

/**
 * Handle Stripe webhook events and update the JSON database.
 */
export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  logger.info({ type: event.type }, 'Stripe webhook received');

  switch (event.type) {

    // ── Payment link / checkout completed ────────────────────────────────
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId     = session.client_reference_id;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

      if (userId && customerId) {
        // Link Stripe customer to user
        updateDb(d => {
          const u = d.users.find(u => u.id === userId);
          if (u) u.stripeCustomerId = customerId;
        });
        // Sync subscription tier
        await syncUserSubscription(userId);
        logger.info({ userId, customerId }, 'checkout.session.completed: user linked and tier synced');
      } else if (customerId) {
        // No client_reference_id — match by email
        const db = getDb();
        const customerEmail = session.customer_details?.email?.toLowerCase().trim();
        if (customerEmail) {
          const user = db.users.find(u => u.email === customerEmail);
          if (user) {
            updateDb(d => {
              const u = d.users.find(u => u.email === customerEmail);
              if (u) u.stripeCustomerId = customerId;
            });
            await syncUserSubscription(user.id);
            logger.info({ email: customerEmail, customerId }, 'checkout.session.completed: matched by email');
          }
        }
      }
      break;
    }

    // ── Subscription activated or upgraded ───────────────────────────────
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

      const db = getDb();
      const user = db.users.find(u => u.stripeCustomerId === customerId);
      if (user) {
        await syncUserSubscription(user.id);
      }
      break;
    }

    // ── Subscription cancelled ───────────────────────────────────────────
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

      const db = getDb();
      const user = db.users.find(u => u.stripeCustomerId === customerId);
      if (user) {
        updateDb(d => {
          const u = d.users.find(u => u.stripeCustomerId === customerId);
          if (u) u.tier = 'free';
        });
        logger.info({ userId: user.id }, 'customer.subscription.deleted: downgraded to free');
      }
      break;
    }

    default:
      // Unhandled event type — ignore silently
      break;
  }
}
