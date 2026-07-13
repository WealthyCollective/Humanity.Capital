import { Router } from "express";
import type { Request, Response } from "express";
import { getDb } from "../lib/db.js";

const router = Router();

router.get("/partner", (_req: Request, res: Response) => {
  const db = getDb();

  // Sum live data on top of seeded history
  const liveApplications = db.eligibilityApplications.length;
  const liveRebates = db.eligibilityApplications.reduce(
    (sum, a) => sum + (a.rebate.estimatedRebateAed ?? 0),
    0
  );
  const liveEmirati = db.talent.filter(t => t.isEmirati && t.status === "active").length;
  const liveMatched = db.crewRequests.length;
  const liveFestival = db.festivalSubmissions.length;

  const historicalTotals = db.kpiHistory.reduce(
    (acc, m) => {
      acc.applications += m.applications;
      acc.rebatesCommittedAed += m.rebatesCommittedAed;
      acc.emiratiRegistered += m.emiratiRegistered;
      acc.productionsMatched += m.productionsMatched;
      acc.festivalSubmissions += m.festivalSubmissions;
      return acc;
    },
    {
      applications: 0,
      rebatesCommittedAed: 0,
      emiratiRegistered: 0,
      productionsMatched: 0,
      festivalSubmissions: 0,
    }
  );

  return res.json({
    totals: {
      applications: historicalTotals.applications + liveApplications,
      rebatesCommittedAed: historicalTotals.rebatesCommittedAed + liveRebates,
      emiratiRegistered: historicalTotals.emiratiRegistered + liveEmirati,
      productionsMatched: historicalTotals.productionsMatched + liveMatched,
      festivalSubmissions: historicalTotals.festivalSubmissions + liveFestival,
    },
    monthly: db.kpiHistory,
  });
});

export default router;
