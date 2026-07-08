import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ApiError } from "../utils/api-error.js";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, "Route not found"));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: "Validation failed", issues: error.issues });
  }
  if (error instanceof ApiError) {
    return res.status(error.status).json({ message: error.message, details: error.details });
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({ message: "Database is unavailable. Make sure PostgreSQL is running and DATABASE_URL is correct." });
  }
  console.error(error);
  return res.status(500).json({ message: "Unexpected server error" });
}
