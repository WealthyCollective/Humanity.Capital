import { Router } from "express";
import type { Request, Response } from "express";
import { getDb, updateDb, generateId } from "../lib/db.js";
import type { RebateBreakdown } from "../lib/db.js";

const router = Router();
const SESSION_COOKIE = "dmg_session";

function calculateRebate(params: {
  budgetAed: number;
  dubaiSpendPercent: number;
  shootDays: number;
  emiratiCrewPercent: number;
  usesDubaiStudioCity: boolean;
  featuresDubaiLocations: boolean;
}): RebateBreakdown {
  const {
    budgetAed,
    dubaiSpendPercent,
    shootDays,
    emiratiCrewPercent,
    usesDubaiStudioCity,
    featuresDubaiLocations,
  } = params;

  const qualifyingSpendAed = (budgetAed * dubaiSpendPercent) / 100;
  const meetsMinimum = qualifyingSpendAed >= 1_000_000 && shootDays >= 5;

  const baseRate = 30;
  const emiratiBonus = emiratiCrewPercent >= 50 ? 4 : emiratiCrewPercent >= 30 ? 2 : 0;
  const studioBonus = usesDubaiStudioCity ? 3 : 0;
  const locationBonus = featuresDubaiLocations ? 3 : 0;
  const totalRate = Math.min(40, baseRate + emiratiBonus + studioBonus + locationBonus);
  const estimatedRebateAed = meetsMinimum ? Math.round((qualifyingSpendAed * totalRate) / 100) : 0;

  return {
    baseRate,
    emiratiBonus,
    studioBonus,
    locationBonus,
    totalRate,
    estimatedRebateAed,
    qualifyingSpendAed,
    meetsMinimum,
  };
}

const STATUSES = ["Under review", "Submitted", "Approved"];

router.get("/eligibility", (req: Request, res: Response) => {
  const userId = req.cookies?.[SESSION_COOKIE] as string | undefined;
  const db = getDb();
  const apps = userId
    ? db.eligibilityApplications.filter(a => a.userId === userId)
    : [];
  return res.json(apps);
});

router.post("/eligibility", (req: Request, res: Response) => {
  const body = req.body as {
    projectType?: string;
    projectTitle?: string;
    logline?: string;
    budgetAed?: number;
    dubaiSpendPercent?: number;
    shootDays?: number;
    emiratiCrewPercent?: number;
    usesDubaiStudioCity?: boolean;
    featuresDubaiLocations?: boolean;
    scriptFilename?: string;
    scriptFileSize?: number;
  };

  const required = ["projectType", "projectTitle", "logline", "budgetAed", "dubaiSpendPercent", "shootDays", "emiratiCrewPercent"];
  for (const field of required) {
    if (body[field as keyof typeof body] === undefined || body[field as keyof typeof body] === null) {
      return res.status(400).json({ error: `${field} is required` });
    }
  }

  const rebate = calculateRebate({
    budgetAed: Number(body.budgetAed),
    dubaiSpendPercent: Number(body.dubaiSpendPercent),
    shootDays: Number(body.shootDays),
    emiratiCrewPercent: Number(body.emiratiCrewPercent),
    usesDubaiStudioCity: Boolean(body.usesDubaiStudioCity),
    featuresDubaiLocations: Boolean(body.featuresDubaiLocations),
  });

  const userId = req.cookies?.[SESSION_COOKIE] as string | undefined;

  const application = {
    id: generateId(),
    userId: userId ?? null,
    projectType: body.projectType!,
    projectTitle: body.projectTitle!,
    logline: body.logline!,
    budgetAed: Number(body.budgetAed),
    dubaiSpendPercent: Number(body.dubaiSpendPercent),
    shootDays: Number(body.shootDays),
    emiratiCrewPercent: Number(body.emiratiCrewPercent),
    usesDubaiStudioCity: Boolean(body.usesDubaiStudioCity),
    featuresDubaiLocations: Boolean(body.featuresDubaiLocations),
    scriptFilename: body.scriptFilename ?? null,
    rebate,
    status: "Submitted",
    submittedAt: new Date().toISOString(),
  };

  updateDb(db => { db.eligibilityApplications.push(application); });

  return res.status(201).json(application);
});

export default router;
