import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import sessionRouter from "./session.js";
import membershipRouter from "./membership.js";
import stripeRouter from "./stripe.js";
import eligibilityRouter from "./eligibility.js";
import feedbackRouter from "./feedback.js";
import talentRouter from "./talent.js";
import crewMatchRouter from "./crewMatch.js";
import venuesRouter from "./venues.js";
import hubRouter from "./hub.js";
import investorsRouter from "./investors.js";
import festivalRouter from "./festival.js";
import dashboardRouter from "./dashboard.js";
import partnerRouter from "./partner.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sessionRouter);
router.use(membershipRouter);
router.use(stripeRouter);
router.use(eligibilityRouter);
router.use(feedbackRouter);
router.use(talentRouter);
router.use(crewMatchRouter);
router.use(venuesRouter);
router.use(hubRouter);
router.use(investorsRouter);
router.use(festivalRouter);
router.use(dashboardRouter);
router.use(partnerRouter);
router.use(adminRouter);

export default router;
