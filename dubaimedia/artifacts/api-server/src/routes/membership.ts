import { Router } from "express";
import type { Request, Response } from "express";
import { getDb, updateDb } from "../lib/db.js";

const router = Router();
const SESSION_COOKIE = "dmg_session";

router.post("/membership", (req: Request, res: Response) => {
  const { tier, name, email } = req.body as { tier?: string; name?: string; email?: string };

  if (!tier || !["creator", "studio"].includes(tier)) {
    return res.status(400).json({ error: "Valid tier required: creator or studio" });
  }

  const userId = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!userId) {
    return res.status(401).json({ error: "Sign in required" });
  }

  const db = getDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: "Session not found" });
  }

  updateDb(d => {
    const u = d.users.find(u => u.id === userId);
    if (u) {
      u.tier = tier as "creator" | "studio";
      if (name) u.name = name;
    }
  });

  const updated = getDb().users.find(u => u.id === userId)!;
  return res.json({ user: updated });
});

export default router;
