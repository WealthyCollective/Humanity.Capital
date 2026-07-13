import { Router } from "express";
import type { Request, Response } from "express";
import { updateDb, generateId } from "../lib/db.js";

const router = Router();
const SESSION_COOKIE = "dmg_session";

router.post("/hub", (req: Request, res: Response) => {
  const body = req.body as {
    workspaceType?: string;
    startDate?: string;
    teamSize?: number;
    projectSummary?: string;
    contactEmail?: string;
  };

  if (!body.workspaceType || !body.startDate || !body.teamSize || !body.projectSummary || !body.contactEmail) {
    return res.status(400).json({ error: "workspaceType, startDate, teamSize, projectSummary and contactEmail are required" });
  }

  const userId = req.cookies?.[SESSION_COOKIE] as string | undefined;

  const application = {
    id: generateId(),
    userId: userId ?? null,
    workspaceType: body.workspaceType,
    startDate: body.startDate,
    teamSize: Number(body.teamSize),
    projectSummary: body.projectSummary,
    contactEmail: body.contactEmail,
    status: "Under review",
    createdAt: new Date().toISOString(),
  };

  updateDb(db => { db.hubApplications.push(application); });

  return res.status(201).json({ message: "Your hub application is under review. We will respond within 5 business days." });
});

export default router;
