import { Router, type IRouter } from "express";
import healthRouter from "./health";
import beaconRouter from "./beacon";
import nimbusRouter from "./nimbus";
import zeusRouter from "./zeus";
import incaRouter from "./inca";
import dreameraRouter from "./dreamera";

const router: IRouter = Router();

router.use(healthRouter);
router.use(beaconRouter);
router.use(nimbusRouter);
router.use(zeusRouter);
router.use(incaRouter);
router.use(dreameraRouter);

export default router;
