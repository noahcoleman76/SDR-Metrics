import type { Request, Response } from "express";
import { z } from "zod";
import { authCookieName, sessionCookieOptions, signSession } from "../../middleware/auth.js";
import * as authService from "./auth.service.js";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export async function register(req: Request, res: Response) {
  const body = credentialsSchema.parse(req.body);
  const user = await authService.register(body.email, body.password);
  res.cookie(authCookieName, signSession(user), sessionCookieOptions());
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const body = credentialsSchema.parse(req.body);
  const user = await authService.login(body.email, body.password);
  res.cookie(authCookieName, signSession(user), sessionCookieOptions());
  res.json({ user });
}

export async function me(req: Request, res: Response) {
  res.json({ user: req.user });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(authCookieName, { path: "/" });
  res.status(204).send();
}
