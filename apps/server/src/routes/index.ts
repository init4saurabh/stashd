import { Router, type IRouter } from "express";
import healthRouter from "./health";
import linksRouter from "./links";
import collectionsRouter from "./collections";
import tagsRouter from "./tags";

const router: IRouter = Router();

router.use(healthRouter);
router.use(linksRouter);
router.use(collectionsRouter);
router.use(tagsRouter);

export default router;