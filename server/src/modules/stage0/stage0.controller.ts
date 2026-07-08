import type { Request, Response } from "express";
import { z } from "zod";
import { optionalDate, optionalString, requiredName } from "../../utils/validation.js";
import { routeParam } from "../../utils/params.js";
import * as service from "./stage0.service.js";

const baseSchema = z.object({
  accountName: requiredName,
  opportunityNumber: optionalString,
  link: optionalString,
  createdDate: optionalDate,
  accountExecutive: optionalString,
  nextStep: optionalString
});

const updateSchema = baseSchema.partial();

export async function list(req: Request, res: Response) {
  res.json({ records: await service.list(req.user!.id) });
}

export async function create(req: Request, res: Response) {
  res.status(201).json({ record: await service.create(req.user!.id, baseSchema.parse(req.body)) });
}

export async function update(req: Request, res: Response) {
  res.json({ record: await service.update(req.user!.id, routeParam(req, "id"), updateSchema.parse(req.body)) });
}

export async function move(req: Request, res: Response) {
  res.status(201).json({ opportunity: await service.moveToOpportunity(req.user!.id, routeParam(req, "id")) });
}

export async function remove(req: Request, res: Response) {
  await service.remove(req.user!.id, routeParam(req, "id"));
  res.status(204).send();
}
