import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import beaconRouter from "./beacon";
import nimbusRouter from "./nimbus";
import zeusRouter from "./zeus";
import incaRouter from "./inca";
import dreameraRouter from "./dreamera";
import rosieRouter from "./rosie";
import alloyRouter from "./alloy";
import agentsRouter from "./agents";
import monitoringRouter from "./monitoring";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(beaconRouter);
router.use(nimbusRouter);
router.use(zeusRouter);
router.use(incaRouter);
router.use(dreameraRouter);
router.use(rosieRouter);
router.use(alloyRouter);
router.use(agentsRouter);
router.use(monitoringRouter);

export default router;
