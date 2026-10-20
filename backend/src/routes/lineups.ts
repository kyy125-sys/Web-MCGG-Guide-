import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { formatLineup, safeJsonStringify } from '../utils/formatters';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

export const lineupRoutes = Router();

// Permissive auth for lineups: extracts user if token provided, but doesn't block guests
function optionalAuth(req: any, _res: any, next: any) {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch {}
  }
  next();
}

const lineupHeroSchema = z.object({
  heroId: z.string(),
  position: z.object({ row: z.number(), col: z.number() }),
  star: z.number().int().min(1).max(3).default(1),
  items: z.array(z.string()).default([]),
});

const lineupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  commanderId: z.string().nullable().optional(),
  patchId: z.string().nullable().optional(),
  formationConfig: z.record(z.any()).default({}),
  synergySnapshot: z.array(z.any()).default([]),
  strategyNotes: z.string().optional(),
  isPublic: z.boolean().default(false),
  heroes: z.array(lineupHeroSchema).default([]),
});

lineupRoutes.get('/', async (req, res, next) => {
  try {
    const { userId, isPublic, commanderId, patchId, tag, search } = req.query;
    const where: any = {};
    if (userId) where.userId = String(userId);
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';
    if (commanderId) where.commanderId = String(commanderId);
    if (patchId) where.patchId = String(patchId);
    if (tag) where.tags = { contains: String(tag) };
    if (search) where.name = { contains: String(search) };

    const lineups = await prisma.lineup.findMany({
      where,
      include: {
        commander: true,
        patch: true,
        heroes: { include: { hero: { include: { synergies: { include: { synergy: true } } } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(lineups.map(formatLineup));
  } catch (e) { next(e); }
});

lineupRoutes.get('/:id', async (req, res, next) => {
  try {
    const lineup = await prisma.lineup.findUnique({
      where: { id: req.params.id },
      include: {
        commander: true,
        patch: true,
        heroes: { include: { hero: { include: { synergies: { include: { synergy: true } } } } } },
      },
    });
    if (!lineup) return res.status(404).json({ error: 'Lineup not found' });
    res.json(formatLineup(lineup));
  } catch (e) { next(e); }
});

lineupRoutes.post('/', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = lineupSchema.parse(req.body);
    const { heroes, ...lineupData } = data;
    const lineup = await prisma.lineup.create({
      data: {
        name: lineupData.name,
        description: lineupData.description,
        tags: safeJsonStringify(lineupData.tags),
        commanderId: lineupData.commanderId || undefined,
        patchId: lineupData.patchId || undefined,
        formationConfig: safeJsonStringify(lineupData.formationConfig, '{}'),
        synergySnapshot: safeJsonStringify(lineupData.synergySnapshot),
        strategyNotes: lineupData.strategyNotes,
        isPublic: lineupData.isPublic,
        userId: req.user?.id || undefined,
        heroes: {
          create: heroes.map(h => ({
            heroId: h.heroId,
            posRow: h.position.row,
            posCol: h.position.col,
            star: h.star,
            items: safeJsonStringify(h.items),
          })),
        },
      },
      include: {
        commander: true,
        patch: true,
        heroes: { include: { hero: { include: { synergies: { include: { synergy: true } } } } } },
      },
    });
    res.status(201).json(formatLineup(lineup));
  } catch (e) { next(e); }
});

lineupRoutes.put('/:id', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = lineupSchema.partial().parse(req.body);
    const { heroes, ...lineupData } = data;
    const updateData: any = {};
    if (lineupData.name !== undefined) updateData.name = lineupData.name;
    if (lineupData.description !== undefined) updateData.description = lineupData.description;
    if (lineupData.tags !== undefined) updateData.tags = safeJsonStringify(lineupData.tags);
    if (lineupData.commanderId !== undefined) updateData.commanderId = lineupData.commanderId || null;
    if (lineupData.patchId !== undefined) updateData.patchId = lineupData.patchId || null;
    if (lineupData.formationConfig !== undefined) updateData.formationConfig = safeJsonStringify(lineupData.formationConfig, '{}');
    if (lineupData.synergySnapshot !== undefined) updateData.synergySnapshot = safeJsonStringify(lineupData.synergySnapshot);
    if (lineupData.strategyNotes !== undefined) updateData.strategyNotes = lineupData.strategyNotes;
    if (lineupData.isPublic !== undefined) updateData.isPublic = lineupData.isPublic;

    if (heroes !== undefined) {
      updateData.heroes = {
        deleteMany: {},
        create: heroes.map(h => ({
          heroId: h.heroId,
          posRow: h.position.row,
          posCol: h.position.col,
          star: h.star,
          items: safeJsonStringify(h.items),
        })),
      };
    }

    const lineup = await prisma.lineup.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        commander: true,
        patch: true,
        heroes: { include: { hero: { include: { synergies: { include: { synergy: true } } } } } },
      },
    });
    res.json(formatLineup(lineup));
  } catch (e) { next(e); }
});

lineupRoutes.delete('/:id', optionalAuth, async (req, res, next) => {
  try {
    await prisma.lineup.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

lineupRoutes.post('/:id/duplicate', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const original = await prisma.lineup.findUnique({
      where: { id: req.params.id },
      include: { heroes: true },
    });
    if (!original) return res.status(404).json({ error: 'Not found' });
    const dup = await prisma.lineup.create({
      data: {
        name: `${original.name} (copy)`,
        description: original.description,
        tags: original.tags,
        commanderId: original.commanderId,
        patchId: original.patchId,
        formationConfig: original.formationConfig,
        synergySnapshot: original.synergySnapshot,
        strategyNotes: original.strategyNotes,
        userId: req.user?.id || original.userId,
        heroes: {
          create: original.heroes.map(h => ({
            heroId: h.heroId,
            posRow: h.posRow,
            posCol: h.posCol,
            star: h.star,
            items: h.items,
          })),
        },
      },
      include: {
        commander: true,
        patch: true,
        heroes: { include: { hero: { include: { synergies: { include: { synergy: true } } } } } },
      },
    });
    res.status(201).json(formatLineup(dup));
  } catch (e) { next(e); }
});
