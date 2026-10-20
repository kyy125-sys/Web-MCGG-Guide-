import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdmin } from '../middleware/auth';
import { z } from 'zod';

export const tierRoutes = Router();

tierRoutes.get('/', async (req, res, next) => {
  try {
    const { entityType, patchId } = req.query;
    const where: any = {};
    if (entityType) where.entityType = String(entityType);
    if (patchId) where.patchId = String(patchId);

    const tiers = await prisma.tierEntry.findMany({
      where,
      include: { patch: true },
      orderBy: [{ tier: 'asc' }, { score: 'desc' }],
    });
    res.json(tiers);
  } catch (e) { next(e); }
});

const tierSchema = z.object({
  entityType: z.string(),
  entityId: z.string(),
  tier: z.enum(['S', 'A', 'B', 'C', 'D']),
  score: z.number().optional(),
  basis: z.string().optional(),
  source: z.string().optional(),
  patchId: z.string().optional(),
});

tierRoutes.post('/', requireAdmin as any, async (req, res, next) => {
  try {
    const data = tierSchema.parse(req.body);
    const entry = await prisma.tierEntry.create({ data });
    res.status(201).json(entry);
  } catch (e) { next(e); }
});

tierRoutes.put('/:id', requireAdmin as any, async (req, res, next) => {
  try {
    const data = tierSchema.partial().parse(req.body);
    const entry = await prisma.tierEntry.update({ where: { id: req.params.id }, data });
    res.json(entry);
  } catch (e) { next(e); }
});

tierRoutes.delete('/:id', requireAdmin as any, async (req, res, next) => {
  try {
    await prisma.tierEntry.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});
