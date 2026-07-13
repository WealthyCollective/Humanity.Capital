import Stripe from 'stripe';
import { logger } from './logger.js';

interface StripeCredentials {
  secretKey: string;
  webhookSecret?: string;
}

/**
 * Fetches Stripe credentials from the Replit connector API.
 * Not cached — tokens can rotate, so fetch fresh each time.
 */
async function getStripeCredentials(): Promise<StripeCredentials> {
  const hostname = process.env['REPLIT_CONNECTORS_HOSTNAME'];
  const xReplitToken = process.env['REPL_IDENTITY']
    ? 'repl ' + process.env['REPL_IDENTITY']
    : process.env['WEB_REPL_RENEWAL']
      ? 'depl ' + process.env['WEB_REPL_RENEWAL']
      : null;

  if (!hostname || !xReplitToken) {
    throw new Error(
      'Stripe integration not connected. ' +
      'Connect Stripe via the Integrations tab.'
    );
  }

  const resp = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connection_id=conn_stripe_01KXCSC3FBMRCMHFMC5ZW0Y1RD`,
    {
      headers: { Accept: 'application/json', 'X-Replit-Token': xReplitToken },
      signal: AbortSignal.timeout(10_000),
    }
  );

  if (!resp.ok) {
    throw new Error(`Failed to fetch Stripe credentials: ${resp.status} ${resp.statusText}`);
  }

  const data = await resp.json();
  const settings = data.items?.[0]?.settings;

  if (!settings?.secret_key) {
    throw new Error(
      'Stripe integration missing secret key. Connect Stripe via the Integrations tab.'
    );
  }

  return {
    secretKey: settings.secret_key,
    webhookSecret: settings.webhook_secret,
  };
}

/**
 * Returns a fresh authenticated Stripe client.
 * Not cached — fetches credentials on every call so rotated keys are picked up.
 */
export async function getUncachableStripeClient(): Promise<Stripe> {
  const { secretKey } = await getStripeCredentials();
  return new Stripe(secretKey, { apiVersion: '2025-06-30.basil' });
}

/**
 * Returns Stripe credentials including the webhook secret.
 */
export async function getStripeCredentialsSafe(): Promise<StripeCredentials | null> {
  try {
    return await getStripeCredentials();
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Stripe integration not available');
    return null;
  }
}
