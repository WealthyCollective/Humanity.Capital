import { Router } from "express";
import type { Request, Response } from "express";
import { updateDb, generateId } from "../lib/db.js";

const router = Router();
const SESSION_COOKIE = "dmg_session";

router.post("/festival", (req: Request, res: Response) => {
  const body = req.body as {
    filmTitle?: string;
    runtime?: number;
    category?: string;
    premiereStatus?: string;
    screenerUrl?: string;
    directorName?: string;
    contactEmail?: string;
  };

  const required = ["filmTitle", "runtime", "category", "premiereStatus", "screenerUrl", "directorName", "contactEmail"];
  for (const field of required) {
    if (!body[field as keyof typeof body]) {
      return res.status(400).json({ error: `${field} is required` });
    }
  }

  const userId = req.cookies?.[SESSION_COOKIE] as string | undefined;

  let counter = 42;
  updateDb(db => {
    db.festivalCounter = (db.festivalCounter ?? 42) + 1;
    counter = db.festivalCounter;
  });

  const submissionId = `DIFF-2026-${String(counter).padStart(4, "0")}`;

  const submission = {
    id: generateId(),
    userId: userId ?? null,
    submissionId,
    filmTitle: body.filmTitle!,
    runtime: Number(body.runtime),
    category: body.category!,
    premiereStatus: body.premiereStatus!,
    screenerUrl: body.screenerUrl!,
    directorName: body.directorName!,
    contactEmail: body.contactEmail!,
    status: "Submitted",
    submittedAt: new Date().toISOString(),
  };

  updateDb(db => { db.festivalSubmissions.push(submission); });

  return res.status(201).json(submission);
});

export default router;
