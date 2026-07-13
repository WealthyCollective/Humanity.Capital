import { Router } from "express";
import type { Request, Response } from "express";
import { getDb, updateDb, generateId } from "../lib/db.js";

const router = Router();
const SESSION_COOKIE = "dmg_session";

router.get("/investors", (req: Request, res: Response) => {
  const userId = req.cookies?.[SESSION_COOKIE] as string | undefined;
  const db = getDb();
  const user = userId ? db.users.find(u => u.id === userId) : null;

  if (!user || user.tier !== "studio") {
    return res.status(403).json({
      error: "Studio membership required to access investor matching",
      upgradeRequired: "studio",
    });
  }

  // Hydrate interestExpressed from investorInterests
  const interests = db.investorInterests.filter(i => i.userId === userId);
  const interestedIds = new Set(interests.map(i => i.projectId));

  const projects = db.investorProjects.map(p => ({
    ...p,
    interestExpressed: interestedIds.has(p.id),
  }));

  return res.json(projects);
});

router.post("/investors/:id/interest", (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.cookies?.[SESSION_COOKIE] as string | undefined;

  const db = getDb();
  const project = db.investorProjects.find(p => p.id === id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const alreadyExpressed = db.investorInterests.some(
    i => i.userId === (userId ?? null) && i.projectId === id
  );

  if (!alreadyExpressed) {
    updateDb(d => {
      d.investorInterests.push({
        id: generateId(),
        userId: userId ?? null,
        projectId: id,
        createdAt: new Date().toISOString(),
      });
    });
  }

  return res.json({ message: "Introduction requested. Our investment team will contact you within 3 business days." });
});

export default router;
