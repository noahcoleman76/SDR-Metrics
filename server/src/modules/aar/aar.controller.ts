import type { Request, Response } from "express";
import { z } from "zod";
import { routeParam } from "../../utils/params.js";
import * as service from "./aar.service.js";

const yearSchema = z.coerce.number().int().min(2000).max(2100);
const quarterSchema = z.coerce.number().int().min(1).max(4);
const monthSchema = z.coerce.number().int().min(1).max(12);
const count = z.number().int().min(0).max(1_000_000_000).nullable();

const monthValuesSchema = z.object({
  workingDays: z.number().int().min(0).max(31).nullable(),
  calls: count,
  emails: count,
  connects: count,
  prospectsAdded: count,
  accountsWorked: count,
  overdueTasks: count,
  hvas: count,
  discosBooked: count,
  discosHeld: count,
  stage1s: count
});

const monthInputSchema = monthValuesSchema.partial().refine((data) => Object.keys(data).length > 0, "Provide at least one monthly value");

const goalValuesSchema = z.object({ hvas: count, discosBooked: count, discosHeld: count, stage1s: count });
const goalInputSchema = goalValuesSchema.partial().refine((data) => Object.keys(data).length > 0, "Provide at least one goal");

export async function getQuarter(req: Request, res: Response) {
  const { year, quarter } = z.object({ year: yearSchema, quarter: quarterSchema }).parse(req.query);
  res.json(await service.getQuarter(req.user!.id, year, quarter));
}

export async function updateMonth(req: Request, res: Response) {
  const year = yearSchema.parse(routeParam(req, "year"));
  const month = monthSchema.parse(routeParam(req, "month"));
  const data = monthInputSchema.parse(req.body);
  res.json({ month: await service.updateMonth(req.user!.id, year, month, data) });
}

export async function updateGoals(req: Request, res: Response) {
  const year = yearSchema.parse(routeParam(req, "year"));
  const quarter = quarterSchema.parse(routeParam(req, "quarter"));
  const data = goalInputSchema.parse(req.body);
  res.json({ goals: await service.updateGoals(req.user!.id, year, quarter, data) });
}
