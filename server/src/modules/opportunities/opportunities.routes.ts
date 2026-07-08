import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import * as controller from "./opportunities.controller.js";

export const opportunitiesRouter = Router();

opportunitiesRouter.get("/", asyncHandler(controller.list));
opportunitiesRouter.post("/", asyncHandler(controller.create));
opportunitiesRouter.patch("/:id", asyncHandler(controller.update));
opportunitiesRouter.delete("/:id", asyncHandler(controller.remove));
