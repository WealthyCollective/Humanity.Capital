import { Router } from "express";
import type { Request, Response } from "express";
import { getDb, updateDb, generateId } from "../lib/db.js";
import { analyze } from "../lib/analyzer.js";

const router = Router();
const SESSION_COOKIE = "dmg_session";
const FREE_LIMIT = 1;

router.get("/feedback", (req: Request, res: Response) => {
  const userId = req.cookies?.[SESSION_COOKIE] as string | undefined;
  const db = getDb();
  const analyses = userId
    ? db.pitchAnalyses.filter(a => a.userId === userId)
    : [];
  return res.json(analyses);
});

router.post("/feedback", async (req: Request, res: Response) => {
  const body = req.body as {
    logline?: string;
    synopsis?: string;
    genre?: string;
    targetAudience?: string;
    format?: string;
  };

  if (!body.logline || !body.genre || !body.targetAudience || !body.format) {
    return res.status(400).json({ error: "logline, genre, targetAudience and format are required" });
  }

  const userId = req.cookies?.[SESSION_COOKIE] as string | undefined;
  const db = getDb();
  const user = userId ? db.users.find(u => u.id === userId) : null;

  // Check paywall: free users get 1 analysis
  if (!user || user.tier === "free") {
    const countKey = `analysis_count_${userId ?? "anon"}`;
    const existingCount = userId
      ? db.pitchAnalyses.filter(a => a.userId === userId).length
      : 0;

    if (existingCount >= FREE_LIMIT && user?.tier === "free") {
      return res.status(402).json({
        error: "Free analysis limit reached",
        upgradeRequired: "creator",
      });
    }
  }

  const result = await analyze({
    logline: body.logline,
    synopsis: body.synopsis ?? "",
    genre: body.genre,
    targetAudience: body.targetAudience,
    format: body.format,
  });

  const analysis = {
    id: generateId(),
    userId: userId ?? null,
    logline: body.logline,
    genre: body.genre,
    targetAudience: body.targetAudience,
    format: body.format,
    scores: result.scores,
    strengths: result.strengths,
    risks: result.risks,
    nextSteps: result.nextSteps,
    submittedAt: new Date().toISOString(),
  };

  updateDb(d => {
    d.pitchAnalyses.push(analysis);
    if (userId) {
      const u = d.users.find(u => u.id === userId);
      if (u) u.analysisCount += 1;
    }
  });

  return res.json(analysis);
});

export default router;
