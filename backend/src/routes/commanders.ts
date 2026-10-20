import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdmin } from '../middleware/auth';
import { formatCommander, safeJsonStringify } from '../utils/formatters';
import { z } from 'zod';

export const commanderRoutes = Router();

const commanderSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  skill: z.string(),
  skillLevels: z.array(z.any()).optional().default([]),
  playstyle: z.string().optional(),
  strengths: z.array(z.string()).optional().default([]),
  weaknesses: z.array(z.string()).optional().default([]),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  patchId: z.string().optional(),
  dataSource: z.string().optional(),
});

commanderRoutes.get('/', async (req, res, next) => {
  try {
    const commanders = await prisma.commander.findMany({ include: { patch: true }, orderBy: { name: 'asc' } });
    const tiers = await prisma.tierEntry.findMany({ where: { entityType: 'commander' } });
    const tierMap = new Map(tiers.map((t) => [t.entityId, t.tier]));
    res.json(commanders.map((c) => ({
      ...formatCommander(c),
      tier: tierMap.get(c.id) || null,
    })));
  } catch (e) { next(e); }
});

commanderRoutes.get('/:id', async (req, res, next) => {
  try {
    const c = await prisma.commander.findUnique({ where: { id: req.params.id }, include: { patch: true } });
    if (!c) return res.status(404).json({ error: 'Commander not found' });
    const tier = await prisma.tierEntry.findFirst({ where: { entityType: 'commander', entityId: c.id } });
    res.json({
      ...formatCommander(c),
      tier: tier?.tier || null,
    });
  } catch (e) { next(e); }
});

commanderRoutes.post('/', requireAdmin as any, async (req, res, next) => {
  try {
    const data = commanderSchema.parse(req.body);
    const cmdData = {
      ...data,
      skillLevels: safeJsonStringify(data.skillLevels),
      strengths: safeJsonStringify(data.strengths),
      weaknesses: safeJsonStringify(data.weaknesses),
    };
    const c = await prisma.commander.create({ data: cmdData });
    res.status(201).json(formatCommander(c));
  } catch (e) { next(e); }
});

commanderRoutes.put('/:id', requireAdmin as any, async (req, res, next) => {
  try {
    const data = commanderSchema.partial().parse(req.body);
    const cmdData: any = { ...data };
    if (data.skillLevels !== undefined) cmdData.skillLevels = safeJsonStringify(data.skillLevels);
    if (data.strengths !== undefined) cmdData.strengths = safeJsonStringify(data.strengths);
    if (data.weaknesses !== undefined) cmdData.weaknesses = safeJsonStringify(data.weaknesses);
    const c = await prisma.commander.update({ where: { id: req.params.id }, data: cmdData });
    res.json(formatCommander(c));
  } catch (e) { next(e); }
});

commanderRoutes.delete('/:id', requireAdmin as any, async (req, res, next) => {
  try {
    await prisma.commander.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});
