import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import * as controller from "./accounts.controller.js";

export const accountsRouter = Router();

accountsRouter.get("/", asyncHandler(controller.list));
accountsRouter.post("/", asyncHandler(controller.create));
accountsRouter.patch("/reorder", asyncHandler(controller.reorder));
accountsRouter.patch("/:id", asyncHandler(controller.update));
accountsRouter.delete("/:id", asyncHandler(controller.remove));
