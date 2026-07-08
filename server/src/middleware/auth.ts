import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/api-error.js";

export const authCookieName = "sdr_session";
const ninetyDays = 90 * 24 * 60 * 60 * 1000;

export type AuthUser = {
  id: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signSession(user: AuthUser) {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: "90d" });
}

export function sessionCookieOptions() {
  const isProduction = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    secure: isProduction ? true : env.COOKIE_SECURE,
    maxAge: ninetyDays,
    path: "/"
  };
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[authCookieName];
    if (!token) throw new ApiError(401, "Authentication required");
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    const user = await prisma.user.findUnique({ where: { id: payload.id }, select: { id: true, email: true } });
    if (!user) throw new ApiError(401, "Invalid session");
    req.user = user;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid session"));
  }
}
