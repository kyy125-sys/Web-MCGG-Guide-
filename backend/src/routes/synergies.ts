import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdmin } from '../middleware/auth';
import { formatSynergy, safeJsonStringify } from '../utils/formatters';
import { z } from 'zod';

export const synergyRoutes = Router();

const synergySchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  thresholds: z.array(z.object({ count: z.number(), bonus: z.string() })).default([]),
  iconUrl: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  patchId: z.string().optional(),
  dataSource: z.string().optional(),
});

synergyRoutes.get('/', async (req, res, next) => {
  try {
    const synergies = await prisma.synergy.findMany({
      include: { heroSynergies: { include: { hero: { select: { id: true, name: true, imageUrl: true, cost: true, role: true } } } } },
      orderBy: { name: 'asc' },
    });
    res.json(synergies.map(formatSynergy));
  } catch (e) { next(e); }
});

synergyRoutes.get('/:id', async (req, res, next) => {
  try {
    const s = await prisma.synergy.findUnique({
      where: { id: req.params.id },
      include: { heroSynergies: { include: { hero: true } }, patch: true },
    });
    if (!s) return res.status(404).json({ error: 'Synergy not found' });
    res.json(formatSynergy(s));
  } catch (e) { next(e); }
});

synergyRoutes.post('/', requireAdmin as any, async (req, res, next) => {
  try {
    const data = synergySchema.parse(req.body);
    const synData = {
      ...data,
      thresholds: safeJsonStringify(data.thresholds),
    };
    const s = await prisma.synergy.create({ data: synData });
    res.status(201).json(formatSynergy(s));
  } catch (e) { next(e); }
});

synergyRoutes.put('/:id', requireAdmin as any, async (req, res, next) => {
  try {
    const data = synergySchema.partial().parse(req.body);
    const synData: any = { ...data };
    if (data.thresholds !== undefined) synData.thresholds = safeJsonStringify(data.thresholds);
    const s = await prisma.synergy.update({ where: { id: req.params.id }, data: synData });
    res.json(formatSynergy(s));
  } catch (e) { next(e); }
});

synergyRoutes.delete('/:id', requireAdmin as any, async (req, res, next) => {
  try {
    await prisma.synergy.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});
