import { Router } from "express";
import type { Request, Response } from "express";
import { getDb } from "../lib/db.js";

const router = Router();
const SESSION_COOKIE = "dmg_session";

const DEMO_STATUSES = ["Submitted", "Under review", "Approved"];

function deterministicStatus(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return DEMO_STATUSES[Math.abs(hash) % DEMO_STATUSES.length];
}

router.get("/dashboard", (req: Request, res: Response) => {
  const userId = req.cookies?.[SESSION_COOKIE] as string | undefined;
  const db = getDb();
  const user = userId ? db.users.find(u => u.id === userId) : null;

  const items: Array<{
    id: string;
    type: string;
    title: string;
    status: string;
    createdAt: string;
    detail: string | null;
  }> = [];

  if (userId) {
    for (const app of db.eligibilityApplications.filter(a => a.userId === userId)) {
      items.push({
        id: app.id,
        type: "Eligibility Application",
        title: app.projectTitle,
        status: deterministicStatus(app.id),
        createdAt: app.submittedAt,
        detail: `${app.rebate.totalRate}% estimated rebate — AED ${app.rebate.estimatedRebateAed.toLocaleString()}`,
      });
    }

    for (const analysis of db.pitchAnalyses.filter(a => a.userId === userId)) {
      items.push({
        id: analysis.id,
        type: "Pitch Analysis",
        title: analysis.logline.substring(0, 60) + (analysis.logline.length > 60 ? "…" : ""),
        status: "Complete",
        createdAt: analysis.submittedAt,
        detail: `${analysis.genre} / ${analysis.format}`,
      });
    }

    for (const booking of db.bookings.filter(b => b.userId === userId)) {
      const venue = db.venues.find(v => v.id === booking.venueId);
      items.push({
        id: booking.id,
        type: "Venue Booking",
        title: venue?.name ?? "Venue",
        status: deterministicStatus(booking.id),
        createdAt: booking.createdAt,
        detail: `${booking.startDate} to ${booking.endDate} — ${booking.productionTitle}`,
      });
    }

    for (const hub of db.hubApplications.filter(h => h.userId === userId)) {
      items.push({
        id: hub.id,
        type: "Hub Application",
        title: hub.workspaceType.replace(/_/g, " "),
        status: deterministicStatus(hub.id),
        createdAt: hub.createdAt,
        detail: `Starting ${hub.startDate} — team of ${hub.teamSize}`,
      });
    }

    for (const sub of db.festivalSubmissions.filter(s => s.userId === userId)) {
      items.push({
        id: sub.id,
        type: "Festival Submission",
        title: sub.filmTitle,
        status: deterministicStatus(sub.id),
        createdAt: sub.submittedAt,
        detail: `${sub.submissionId} — ${sub.category}`,
      });
    }
  }

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({ items, user: user ?? null });
});

export default router;
