import { Router } from "express";
import type { Request, Response } from "express";
import { getDb, updateDb, generateId } from "../lib/db.js";

const router = Router();
const SESSION_COOKIE = "dmg_session";

router.get("/talent", (req: Request, res: Response) => {
  const db = getDb();
  let talent = [...db.talent];

  const { department, minRating, emiratiOnly } = req.query;

  if (department && typeof department === "string") {
    talent = talent.filter(t => t.department.toLowerCase() === department.toLowerCase());
  }

  if (minRating) {
    const min = parseFloat(minRating as string);
    if (!isNaN(min)) {
      talent = talent.filter(t => t.rating >= min);
    }
  }

  if (emiratiOnly === "true") {
    talent = talent.filter(t => t.isEmirati);
  }

  return res.json(talent);
});

router.post("/talent", (req: Request, res: Response) => {
  const body = req.body as {
    name?: string;
    nationality?: string;
    department?: string;
    yearsExperience?: number;
    portfolioUrl?: string;
    bio?: string;
  };

  if (!body.name || !body.nationality || !body.department || body.yearsExperience === undefined) {
    return res.status(400).json({ error: "name, nationality, department and yearsExperience are required" });
  }

  const isEmirati = ["uae", "emirati"].includes(body.nationality.toLowerCase());

  const profile = {
    id: generateId(),
    name: body.name,
    nationality: body.nationality,
    department: body.department,
    yearsExperience: Number(body.yearsExperience),
    rating: 0,
    isVerified: false,
    isEmirati,
    portfolioUrl: body.portfolioUrl ?? null,
    bio: body.bio ?? null,
    status: "pending" as const,
  };

  updateDb(db => { db.talent.push(profile); });

  return res.status(201).json(profile);
});

export default router;
