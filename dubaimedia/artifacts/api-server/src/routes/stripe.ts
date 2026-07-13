import { Router } from 'express';
import type { Request, Response } from 'express';
import { getDb, updateDb } from '../lib/db.js';
import { getUncachableStripeClient } from '../lib/stripeClient.js';
import { logger } from '../lib/logger.js';

const router = Router();
const SESSION_COOKIE = 'dmg_session';

// ─── Tier detection from subscription ──────────────────────────────────────

const CREATOR_LINK = 'https://buy.stripe.com/8x2eVe2nOgpw9kXcH04gg0w';
const STUDIO_LINK  = 'https://buy.stripe.com/5kQbJ22nO0qy7cPcH04gg0x';

/**
 * Determine membership tier from a Stripe subscription's unit_amount.
 * Studio is the higher-priced plan; creator the lower.
 * Threshold: if amount >= 50000 cents ($500), it's studio.
 */
function tierFromAmount(amountCents: number | null): 'creator' | 'studio' {
  if (!amountCents) return 'creator';
  return amountCents >= 50_000 ? 'studio' : 'creator';
}

/**
 * Sync a user's tier against their Stripe subscriptions.
 * Called from webhook and /api/stripe/sync.
 */
export async function syncUserSubscription(userId: string): Promise<void> {
  const db = getDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) return;

  try {
    const stripe = await getUncachableStripeClient();

    if (!user.stripeCustomerId) {
      // Look up by email
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (!customers.data.length) {
        // No Stripe customer → keep current tier (don't downgrade if already elevated)
        return;
      }
      const customerId = customers.data[0].id;
      updateDb(d => {
        const u = d.users.find(u => u.id === userId);
        if (u) u.stripeCustomerId = customerId;
      });
      user.stripeCustomerId = customerId;
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 5,
    });

    if (!subscriptions.data.length) {
      // No active subscriptions — downgrade to free
      updateDb(d => {
        const u = d.users.find(u => u.id === userId);
        if (u && u.tier !== 'free') {
          logger.info({ userId }, 'Stripe sync: no active subscription, downgrading to free');
          u.tier = 'free';
        }
      });
      return;
    }

    // Use the highest-value active subscription to determine tier
    let maxAmount = 0;
    for (const sub of subscriptions.data) {
      const amount = sub.items.data[0]?.price?.unit_amount ?? 0;
      if (amount > maxAmount) maxAmount = amount;
    }

    const tier = tierFromAmount(maxAmount);
    updateDb(d => {
      const u = d.users.find(u => u.id === userId);
      if (u && u.tier !== tier) {
        logger.info({ userId, tier }, 'Stripe sync: updating tier');
        u.tier = tier;
      }
    });
  } catch (err: any) {
    logger.error({ err: err.message, userId }, 'Error syncing Stripe subscription');
  }
}

// ─── POST /api/stripe/sync — force-sync current user's subscription ────────
router.post('/stripe/sync', async (req: Request, res: Response) => {
  const userId = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!userId) return res.status(401).json({ error: 'Not signed in' });

  await syncUserSubscription(userId);

  const db = getDb();
  const user = db.users.find(u => u.id === userId) ?? null;
  return res.json({ user });
});

// ─── GET /api/stripe/portal — Stripe Customer Portal URL ──────────────────
router.get('/stripe/portal', async (req: Request, res: Response) => {
  const userId = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!userId) return res.status(401).json({ error: 'Not signed in' });

  const db = getDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(401).json({ error: 'Session not found' });
  if (!user.stripeCustomerId) return res.status(400).json({ error: 'No Stripe customer linked' });

  try {
    const stripe = await getUncachableStripeClient();
    const origin = req.headers.origin ?? `https://${req.headers.host}`;
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/membership`,
    });
    return res.json({ url: session.url });
  } catch (err: any) {
    logger.error({ err: err.message }, 'Error creating portal session');
    return res.status(500).json({ error: 'Could not create portal session' });
  }
});

// ─── GET /api/stripe/payment-links — return payment link URLs for frontend ─
router.get('/stripe/payment-links', (_req: Request, res: Response) => {
  return res.json({
    creator: CREATOR_LINK,
    studio:  STUDIO_LINK,
  });
});

export default router;
