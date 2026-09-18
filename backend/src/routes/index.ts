import { Router } from "express";
import healthRouter from "./health.route.js";
import docsRouter from "./docs.route.ts";
import authRouter from "./auth.route.ts";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/docs", docsRouter)
apiRouter.use("/auth", authRouter);
