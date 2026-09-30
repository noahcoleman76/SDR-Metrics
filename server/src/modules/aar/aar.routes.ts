import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import * as controller from "./aar.controller.js";

export const aarRouter = Router();

aarRouter.get("/", asyncHandler(controller.getQuarter));
aarRouter.patch("/months/:year/:month", asyncHandler(controller.updateMonth));
aarRouter.patch("/goals/:year/:quarter", asyncHandler(controller.updateGoals));
