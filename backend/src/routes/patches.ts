import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdmin } from '../middleware/auth';
import { formatPatch, safeJsonStringify } from '../utils/formatters';
import { z } from 'zod';

export const patchRoutes = Router();

patchRoutes.get('/', async (_req, res, next) => {
  try {
    const patches = await prisma.patch.findMany({ orderBy: { releaseDate: 'desc' } });
    res.json(patches.map(formatPatch));
  } catch (e) { next(e); }
});

patchRoutes.get('/active', async (_req, res, next) => {
  try {
    const patch = await prisma.patch.findFirst({ where: { isActive: true }, orderBy: { releaseDate: 'desc' } });
    res.json(patch ? formatPatch(patch) : null);
  } catch (e) { next(e); }
});

patchRoutes.get('/:id', async (req, res, next) => {
  try {
    const patch = await prisma.patch.findUnique({
      where: { id: req.params.id },
      include: { patchChanges: true },
    });
    if (!patch) return res.status(404).json({ error: 'Patch not found' });
    res.json(formatPatch(patch));
  } catch (e) { next(e); }
});

const patchSchema = z.object({
  version: z.string(),
  releaseDate: z.string().transform(d => new Date(d)),
  isActive: z.boolean().default(false),
  notes: z.string().optional(),
  sources: z.array(z.string()).default([]),
});

patchRoutes.post('/', requireAdmin as any, async (req, res, next) => {
  try {
    const data = patchSchema.parse(req.body);
    if (data.isActive) await prisma.patch.updateMany({ data: { isActive: false } });
    const patch = await prisma.patch.create({
      data: {
        ...data,
        sources: safeJsonStringify(data.sources),
      },
    });
    res.status(201).json(formatPatch(patch));
  } catch (e) { next(e); }
});

patchRoutes.put('/:id', requireAdmin as any, async (req, res, next) => {
  try {
    const data = patchSchema.partial().parse(req.body);
    if (data.isActive) await prisma.patch.updateMany({ data: { isActive: false } });
    const patchData: any = { ...data };
    if (data.sources !== undefined) patchData.sources = safeJsonStringify(data.sources);
    const patch = await prisma.patch.update({ where: { id: req.params.id }, data: patchData });
    res.json(formatPatch(patch));
  } catch (e) { next(e); }
});

patchRoutes.delete('/:id', requireAdmin as any, async (req, res, next) => {
  try {
    await prisma.patch.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});
