import { Router } from "express";
import type { Request, Response } from "express";
import { getDb, updateDb, generateId } from "../lib/db.js";
import { syncUserSubscription } from "./stripe.js";

const router = Router();
const SESSION_COOKIE = "dmg_session";
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

router.get("/session", (req: Request, res: Response) => {
  const userId = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!userId) {
    return res.json({ user: null });
  }
  const db = getDb();
  const user = db.users.find(u => u.id === userId) ?? null;
  return res.json({ user });
});

router.post("/session", (req: Request, res: Response) => {
  const { email, name } = req.body as { email?: string; name?: string };
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "email is required" });
  }

  const db = getDb();
  let user = db.users.find(u => u.email === email.toLowerCase().trim());

  if (!user) {
    user = {
      id: generateId(),
      email: email.toLowerCase().trim(),
      name: name ?? null,
      tier: "free",
      analysisCount: 0,
      createdAt: new Date().toISOString(),
    };
    updateDb(d => { d.users.push(user!); });
  }

  res.cookie(SESSION_COOKIE, user.id, {
    httpOnly: true,
    maxAge: MAX_AGE,
    sameSite: "lax",
  });

  // Async subscription sync — fire and don't await so login is fast.
  // The webhook keeps tiers current in real time; this is a safety net on login.
  if (user.stripeCustomerId) {
    syncUserSubscription(user.id).catch(() => {/* best-effort */});
  }

  return res.json({ user });
});

router.delete("/session", (req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE);
  return res.json({ message: "Signed out" });
});

export default router;
