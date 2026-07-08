import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as controller from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(controller.register));
authRouter.post("/login", asyncHandler(controller.login));
authRouter.get("/me", requireAuth, asyncHandler(controller.me));
authRouter.post("/logout", requireAuth, asyncHandler(controller.logout));
