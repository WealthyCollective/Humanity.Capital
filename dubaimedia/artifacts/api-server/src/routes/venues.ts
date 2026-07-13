import { Router } from "express";
import type { Request, Response } from "express";
import { getDb, updateDb, generateId } from "../lib/db.js";

const router = Router();
const SESSION_COOKIE = "dmg_session";

router.get("/venues", (_req: Request, res: Response) => {
  const db = getDb();
  return res.json(db.venues);
});

router.post("/venues/:id/booking", (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as {
    startDate?: string;
    endDate?: string;
    productionTitle?: string;
    contactEmail?: string;
    notes?: string;
  };

  if (!body.startDate || !body.endDate || !body.productionTitle || !body.contactEmail) {
    return res.status(400).json({ error: "startDate, endDate, productionTitle and contactEmail are required" });
  }

  const db = getDb();
  const venue = db.venues.find(v => v.id === id);
  if (!venue) {
    return res.status(404).json({ error: "Venue not found" });
  }

  const userId = req.cookies?.[SESSION_COOKIE] as string | undefined;

  const booking = {
    id: generateId(),
    userId: userId ?? null,
    venueId: id,
    startDate: body.startDate,
    endDate: body.endDate,
    productionTitle: body.productionTitle,
    contactEmail: body.contactEmail,
    notes: body.notes ?? null,
    status: "Under review",
    createdAt: new Date().toISOString(),
  };

  updateDb(d => { d.bookings.push(booking); });

  return res.status(201).json({ message: `Booking request received for ${venue.name}. The venues team will confirm availability within 3 business days.` });
});

export default router;
