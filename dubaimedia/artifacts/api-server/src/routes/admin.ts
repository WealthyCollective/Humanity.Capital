import { Router } from "express";
import type { Request, Response } from "express";
import { getDb } from "../lib/db.js";

const router = Router();

// Simulated traffic / analytics (no real tracker; realistic demo values)
const TRAFFIC = {
  totalPageViews: 184320,
  uniqueVisitors: 41870,
  avgSessionSec: 214,
  bounceRate: 34,
  byPage: [
    { page: "Eligibility Calculator", views: 52410, pct: 28 },
    { page: "Talent Registry", views: 38760, pct: 21 },
    { page: "Venues & Locations", views: 29640, pct: 16 },
    { page: "AI Pitch Feedback", views: 22190, pct: 12 },
    { page: "Festival", views: 18330, pct: 10 },
    { page: "Investor Network", views: 12840, pct: 7 },
    { page: "The Gateway Hub", views: 10150, pct: 6 },
  ],
  byRegion: [
    { region: "United Arab Emirates", pct: 38 },
    { region: "United Kingdom", pct: 14 },
    { region: "United States", pct: 11 },
    { region: "Saudi Arabia", pct: 9 },
    { region: "France", pct: 6 },
    { region: "India", pct: 6 },
    { region: "Other", pct: 16 },
  ],
  byDevice: [
    { device: "Desktop", pct: 54 },
    { device: "Mobile", pct: 38 },
    { device: "Tablet", pct: 8 },
  ],
};

// Simulated disbursements ledger (would connect to ENBD API in production)
const SIMULATED_DISBURSEMENTS = [
  { id: "D-2026-001", projectTitle: "Daughters of the Creek", applicant: "Al Noor Productions LLC", amountAed: 1860000, status: "disbursed", submittedAt: "2026-01-14", releasedAt: "2026-02-28", bank: "ENBD" },
  { id: "D-2026-002", projectTitle: "Sand & Signal", applicant: "Mirage Film Group", amountAed: 840000, status: "disbursed", submittedAt: "2026-02-02", releasedAt: "2026-03-15", bank: "ENBD" },
  { id: "D-2026-003", projectTitle: "Midnight in Deira", applicant: "Creek Media FZ-LLC", amountAed: 2730000, status: "bank_transfer", submittedAt: "2026-03-18", releasedAt: null, bank: "ENBD" },
  { id: "D-2026-004", projectTitle: "The Last Abra", applicant: "Gulf Coast Films Ltd", amountAed: 1320000, status: "processing", submittedAt: "2026-04-09", releasedAt: null, bank: "ENBD" },
  { id: "D-2026-005", projectTitle: "Blue Hour", applicant: "Aziz & Moreau Productions", amountAed: 1980000, status: "processing", submittedAt: "2026-04-22", releasedAt: null, bank: "ENBD" },
  { id: "D-2026-006", projectTitle: "Gulf Bloc", applicant: "Image Nation Joint Venture", amountAed: 6600000, status: "pending", submittedAt: "2026-05-11", releasedAt: null, bank: "ENBD" },
  { id: "D-2026-007", projectTitle: "Neon Mirage", applicant: "Visionary Pictures DMCC", amountAed: 9300000, status: "pending", submittedAt: "2026-06-03", releasedAt: null, bank: "ENBD" },
  { id: "D-2026-008", projectTitle: "The Falcon's Descent", applicant: "Falcona Films LLC", amountAed: 4440000, status: "pending", submittedAt: "2026-06-28", releasedAt: null, bank: "ENBD" },
];

router.get("/admin/stats", (_req: Request, res: Response) => {
  const db = getDb();

  // ── KPIs from live DB ──────────────────────────────────────────────────────
  const totalUsers = db.users.length;
  const eligibilityApps = db.eligibilityApplications;
  const totalApplications = eligibilityApps.length;

  // Sum of potential incentive value from eligibility quotes
  const totalPotentialRebateAed = eligibilityApps.reduce(
    (sum, a) => sum + (a.rebate?.estimatedRebateAed ?? 0),
    0
  );
  const totalQualifyingSpendAed = eligibilityApps.reduce(
    (sum, a) => sum + (a.rebate?.qualifyingSpendAed ?? 0),
    0
  );

  const allTalent = db.talent;
  const talentRegistered = allTalent.filter(t => t.status === "active").length;
  const mentorsRegistered = allTalent.filter(t => (t as any).category === "Mentor").length;

  const pitchAnalyses = db.pitchAnalyses.length;
  const festivalSubmissions = db.festivalSubmissions.length;
  const hubApplications = db.hubApplications.length;

  // Registered films = eligibility apps that are approved/submitted (treat all as "registered")
  const filmsRegistered = eligibilityApps.length;

  // Add historical KPI totals for display alongside live
  const historicalKpi = db.kpiHistory.reduce(
    (acc, m) => {
      acc.applications += m.applications;
      acc.rebatesCommittedAed += m.rebatesCommittedAed;
      acc.emiratiRegistered += m.emiratiRegistered;
      acc.festivalSubmissions += m.festivalSubmissions;
      return acc;
    },
    { applications: 0, rebatesCommittedAed: 0, emiratiRegistered: 0, festivalSubmissions: 0 }
  );

  // Nationality demographics from talent
  const nationalityMap: Record<string, number> = {};
  allTalent.forEach(t => {
    nationalityMap[t.nationality] = (nationalityMap[t.nationality] ?? 0) + 1;
  });
  const demographics = Object.entries(nationalityMap)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));

  // Recent applications (last 10)
  const recentApplications = [...eligibilityApps]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 10)
    .map(a => ({
      id: a.id,
      projectTitle: a.projectTitle,
      projectType: a.projectType,
      budgetAed: a.budgetAed,
      estimatedRebateAed: a.rebate?.estimatedRebateAed ?? 0,
      status: a.status,
      submittedAt: a.submittedAt,
    }));

  // Disbursement totals
  const disbursedTotal = SIMULATED_DISBURSEMENTS
    .filter(d => d.status === "disbursed")
    .reduce((s, d) => s + d.amountAed, 0);
  const pendingTotal = SIMULATED_DISBURSEMENTS
    .filter(d => d.status !== "disbursed")
    .reduce((s, d) => s + d.amountAed, 0);

  return res.json({
    kpis: {
      totalUsers: totalUsers + 1840,         // add seed offset for demo
      totalApplications: historicalKpi.applications + totalApplications,
      totalPotentialRebateAed: historicalKpi.rebatesCommittedAed + totalPotentialRebateAed,
      totalQualifyingSpendAed: totalQualifyingSpendAed,
      filmsRegistered: historicalKpi.applications + filmsRegistered,
      talentRegistered: talentRegistered + 178,
      mentorsRegistered: mentorsRegistered + 12,
      pitchAnalyses: pitchAnalyses + 340,
      festivalSubmissions: historicalKpi.festivalSubmissions + festivalSubmissions,
      hubApplications: hubApplications + 89,
    },
    disbursements: SIMULATED_DISBURSEMENTS,
    disbursementSummary: {
      disbursedAed: disbursedTotal,
      pendingAed: pendingTotal,
      totalAed: disbursedTotal + pendingTotal,
      disbursedCount: SIMULATED_DISBURSEMENTS.filter(d => d.status === "disbursed").length,
      pendingCount: SIMULATED_DISBURSEMENTS.filter(d => d.status !== "disbursed").length,
    },
    monthly: db.kpiHistory,
    traffic: TRAFFIC,
    demographics,
    recentApplications,
  });
});

export default router;
