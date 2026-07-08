import { Router } from "express";
import { requireAuth } from "./middleware/auth.js";
import { accountsRouter } from "./modules/accounts/accounts.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { opportunitiesRouter } from "./modules/opportunities/opportunities.routes.js";
import { stage0Router } from "./modules/stage0/stage0.routes.js";
import { tasksRouter } from "./modules/tasks/tasks.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/tasks", requireAuth, tasksRouter);
apiRouter.use("/accounts", requireAuth, accountsRouter);
apiRouter.use("/opportunities", requireAuth, opportunitiesRouter);
apiRouter.use("/stage0", requireAuth, stage0Router);
