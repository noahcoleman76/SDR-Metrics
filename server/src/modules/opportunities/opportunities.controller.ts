import { IcmStatus, OpportunityStatus } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { optionalDate, optionalString, requiredName } from "../../utils/validation.js";
import { routeParam } from "../../utils/params.js";
import * as service from "./opportunities.service.js";

const baseSchema = z.object({
  accountName: requiredName,
  opportunityNumber: optionalString,
  link: optionalString,
  createdDate: optionalDate,
  approvedDate: optionalDate,
  accountExecutive: optionalString,
  status: z.nativeEnum(OpportunityStatus).default("STAGE_1_PENDING"),
  inIcm: z.nativeEnum(IcmStatus).default("PENDING")
});

const updateSchema = baseSchema.partial();

export async function list(req: Request, res: Response) {
  res.json({ opportunities: await service.list(req.user!.id) });
}

export async function create(req: Request, res: Response) {
  res.status(201).json({ opportunity: await service.create(req.user!.id, baseSchema.parse(req.body)) });
}

export async function update(req: Request, res: Response) {
  res.json({ opportunity: await service.update(req.user!.id, routeParam(req, "id"), updateSchema.parse(req.body)) });
}

export async function remove(req: Request, res: Response) {
  await service.remove(req.user!.id, routeParam(req, "id"));
  res.status(204).send();
}
