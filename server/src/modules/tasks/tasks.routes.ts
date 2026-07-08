import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import * as controller from "./tasks.controller.js";

export const tasksRouter = Router();

tasksRouter.get("/", asyncHandler(controller.list));
tasksRouter.post("/", asyncHandler(controller.create));
tasksRouter.patch("/reorder", asyncHandler(controller.reorder));
tasksRouter.patch("/:id", asyncHandler(controller.update));
tasksRouter.post("/:id/complete", asyncHandler(controller.complete));
tasksRouter.delete("/:id", asyncHandler(controller.remove));
