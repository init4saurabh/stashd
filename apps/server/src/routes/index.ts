import { Router, type IRouter } from "express";
import healthRouter from "./health";
import linksRouter from "./links";
import collectionsRouter from "./collections";
import tagsRouter from "./tags";
import { requireAuth } from "../middleware/require-auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(requireAuth);
router.use(linksRouter);
router.use(collectionsRouter);
router.use(tagsRouter);

export default router;