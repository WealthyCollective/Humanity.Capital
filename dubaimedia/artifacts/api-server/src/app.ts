import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { getStripeCredentialsSafe } from "./lib/stripeClient";
import { handleStripeEvent } from "./lib/stripeWebhookHandler";
import Stripe from "stripe";

const app: Express = express();

// ── Stripe webhook — MUST be registered before express.json() ─────────────
// Stripe requires the raw request body (Buffer) to verify signatures.
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) return res.status(400).json({ error: "Missing stripe-signature" });

    let event: Stripe.Event;

    try {
      const creds = await getStripeCredentialsSafe();

      if (creds?.webhookSecret) {
        // Verify signature when webhook secret is configured
        const stripeRaw = new Stripe(creds.secretKey, { apiVersion: "2025-06-30.basil" });
        event = stripeRaw.webhooks.constructEvent(
          req.body as Buffer,
          Array.isArray(signature) ? signature[0] : signature,
          creds.webhookSecret
        );
      } else {
        // No webhook secret yet — parse without verification (dev / initial setup)
        logger.warn("Stripe webhook: no webhook secret configured, skipping signature verification");
        event = JSON.parse((req.body as Buffer).toString()) as Stripe.Event;
      }

      await handleStripeEvent(event);
      return res.json({ received: true });
    } catch (err: any) {
      logger.error({ err: err.message }, "Stripe webhook error");
      return res.status(400).json({ error: "Webhook processing failed" });
    }
  }
);
// ─────────────────────────────────────────────────────────────────────────────

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
