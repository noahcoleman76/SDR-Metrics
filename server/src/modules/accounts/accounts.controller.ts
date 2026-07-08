import { AccountSection } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { optionalString, requiredName } from "../../utils/validation.js";
import { routeParam } from "../../utils/params.js";
import * as service from "./accounts.service.js";

const createSchema = z.object({ name: requiredName, link: optionalString, section: z.nativeEnum(AccountSection) });
const updateSchema = z.object({ name: requiredName.optional(), link: optionalString.optional(), section: z.nativeEnum(AccountSection).optional() });
const reorderSchema = z.object({ items: z.array(z.object({ id: z.string(), section: z.nativeEnum(AccountSection), position: z.number().int().min(0) })) });

export async function list(req: Request, res: Response) {
  res.json({ accounts: await service.list(req.user!.id) });
}

export async function create(req: Request, res: Response) {
  res.status(201).json({ account: await service.create(req.user!.id, createSchema.parse(req.body)) });
}

export async function update(req: Request, res: Response) {
  res.json({ account: await service.update(req.user!.id, routeParam(req, "id"), updateSchema.parse(req.body)) });
}

export async function reorder(req: Request, res: Response) {
  const body = reorderSchema.parse(req.body);
  res.json({ accounts: await service.reorder(req.user!.id, body.items) });
}

export async function remove(req: Request, res: Response) {
  await service.remove(req.user!.id, routeParam(req, "id"));
  res.status(204).send();
}
