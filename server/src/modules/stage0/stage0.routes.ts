import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import * as controller from "./stage0.controller.js";

export const stage0Router = Router();

stage0Router.get("/", asyncHandler(controller.list));
stage0Router.post("/", asyncHandler(controller.create));
stage0Router.patch("/:id", asyncHandler(controller.update));
stage0Router.post("/:id/move", asyncHandler(controller.move));
stage0Router.delete("/:id", asyncHandler(controller.remove));
