import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();
dotenv.config({ path: "server/.env" });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z
    .string()
    .url()
    .default("http://localhost:5173")
    .transform((value) => value.replace(/\/+$/, "")),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development")
});

export const env = envSchema.parse(process.env);
