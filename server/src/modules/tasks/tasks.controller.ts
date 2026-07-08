import { TaskCategory } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { routeParam } from "../../utils/params.js";
import * as service from "./tasks.service.js";

const taskSchema = z.object({
  name: z.string().trim().min(1, "Task name is required"),
  details: z.string().trim().nullable().optional(),
  category: z.nativeEnum(TaskCategory)
});

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  details: z.string().trim().nullable().optional(),
  category: z.nativeEnum(TaskCategory).optional(),
  completedAt: z.union([z.string().datetime(), z.null()]).optional()
});

const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string(), category: z.nativeEnum(TaskCategory), position: z.number().int().min(0) }))
});

export async function list(req: Request, res: Response) {
  res.json({ tasks: await service.list(req.user!.id) });
}

export async function create(req: Request, res: Response) {
  const body = taskSchema.parse(req.body);
  res.status(201).json({ task: await service.create(req.user!.id, body) });
}

export async function update(req: Request, res: Response) {
  const body = updateSchema.parse(req.body);
  res.json({ task: await service.update(req.user!.id, routeParam(req, "id"), { ...body, completedAt: body.completedAt === undefined ? undefined : body.completedAt ? new Date(body.completedAt) : null }) });
}

export async function complete(req: Request, res: Response) {
  res.json(await service.complete(req.user!.id, routeParam(req, "id")));
}

export async function reorder(req: Request, res: Response) {
  const body = reorderSchema.parse(req.body);
  res.json({ tasks: await service.reorder(req.user!.id, body.items) });
}

export async function remove(req: Request, res: Response) {
  await service.remove(req.user!.id, routeParam(req, "id"));
  res.status(204).send();
}
