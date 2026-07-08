import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/api-error.js";

const rounds = 12;

export async function register(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) throw new ApiError(409, "Email is already registered");
  const passwordHash = await bcrypt.hash(password, rounds);
  return prisma.user.create({ data: { email: normalized, passwordHash }, select: { id: true, email: true } });
}

export async function login(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) throw new ApiError(401, "Invalid email or password");
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, "Invalid email or password");
  return { id: user.id, email: user.email };
}
