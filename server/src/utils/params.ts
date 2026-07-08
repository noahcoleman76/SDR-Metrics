import type { Request } from "express";
import { ApiError } from "./api-error.js";

export function routeParam(req: Request, name: string) {
  const value = req.params[name];
  if (!value || Array.isArray(value)) throw new ApiError(400, `Missing route parameter: ${name}`);
  return value;
}
