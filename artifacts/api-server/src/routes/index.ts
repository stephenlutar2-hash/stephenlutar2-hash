import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import beaconRouter from "./beacon";
import nimbusRouter from "./nimbus";
import zeusRouter from "./zeus";
import dreameraRouter from "./dreamera";
import rosieRouter from "./rosie";
import alloyRouter from "./alloy";
import agentsRouter from "./agents";
import monitoringRouter from "./monitoring";
import stripeRouter from "./stripe";
import plaidRouter from "./plaid";
import socialRouter from "./social";
import firestormRouter from "./firestorm";
import vesselsRouter from "./vessels";
import incaRouter from "./inca";
import carlotaJoRouter from "./carlota-jo";
import lyteRouter from "./lyte";
import { auditMiddleware } from "../lib/audit";
import { requireDatabase } from "../lib/dbGuard";

const router: IRouter = Router();

router.use(auditMiddleware());
router.use(healthRouter);

router.use("/auth", requireDatabase);
router.use("/beacon", requireDatabase);
router.use("/nimbus", requireDatabase);
router.use("/zeus", requireDatabase);
router.use("/dreamera", requireDatabase);
router.use("/rosie", requireDatabase);
router.use("/alloy", requireDatabase);
router.use("/monitoring", requireDatabase);
router.use("/inca", requireDatabase);

router.use(authRouter);
router.use(beaconRouter);
router.use(nimbusRouter);
router.use(zeusRouter);
router.use(dreameraRouter);
router.use(rosieRouter);
router.use(alloyRouter);
router.use(agentsRouter);
router.use(monitoringRouter);
router.use(stripeRouter);
router.use(plaidRouter);
router.use(socialRouter);
router.use(firestormRouter);
router.use(vesselsRouter);
router.use(incaRouter);
router.use(carlotaJoRouter);
router.use(lyteRouter);

export default router;
