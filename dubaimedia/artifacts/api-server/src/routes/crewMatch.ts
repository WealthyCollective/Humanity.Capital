import { Router } from "express";
import type { Request, Response } from "express";
import { getDb, updateDb, generateId } from "../lib/db.js";
import type { TalentProfile } from "../lib/db.js";

const router = Router();
const SESSION_COOKIE = "dmg_session";

router.post("/crew-match", (req: Request, res: Response) => {
  const body = req.body as {
    projectType?: string;
    departments?: string[];
    shootWindow?: string;
  };

  if (!body.projectType || !body.departments || !body.shootWindow) {
    return res.status(400).json({ error: "projectType, departments and shootWindow are required" });
  }

  const db = getDb();
  const activeTalent = db.talent.filter(t => t.status === "active");

  const team = body.departments.map((dept: string) => {
    const candidates = activeTalent.filter(t =>
      t.department.toLowerCase() === dept.toLowerCase()
    );
    candidates.sort((a, b) => b.rating - a.rating);
    const profile = candidates[0] ?? null;

    return {
      department: dept,
      profile: profile as TalentProfile | null,
      isPlaceholder: !profile,
      placeholderLabel: !profile ? "Knowledge transfer lead assigned by hobb studios" : null,
    };
  });

  // Add one international HOD placeholder per team
  team.push({
    department: "International Head of Department",
    profile: null,
    isPlaceholder: true,
    placeholderLabel: "Knowledge transfer lead assigned by hobb studios",
  });

  return res.json({
    projectType: body.projectType,
    shootWindow: body.shootWindow,
    team,
  });
});

router.post("/crew-match/request", (req: Request, res: Response) => {
  const body = req.body as {
    projectType?: string;
    departments?: string[];
    shootWindow?: string;
  };

  const userId = req.cookies?.[SESSION_COOKIE] as string | undefined;

  const request = {
    id: generateId(),
    userId: userId ?? null,
    projectType: body.projectType ?? "Unknown",
    departments: body.departments ?? [],
    shootWindow: body.shootWindow ?? "",
    createdAt: new Date().toISOString(),
  };

  updateDb(db => { db.crewRequests.push(request); });

  return res.status(201).json({ message: "Team request submitted. A coordinator will contact you within 5 business days." });
});

export default router;
