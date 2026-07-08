import { z } from "zod";

export const optionalDate = z
  .union([z.string().date(), z.literal(""), z.null(), z.undefined()])
  .transform((value) => (value ? new Date(`${value}T00:00:00`) : null));

export const optionalString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    const trimmed = typeof value === "string" ? value.trim() : "";
    return trimmed.length ? trimmed : null;
  });

export const requiredName = z.string().trim().min(1, "Account name is required");
