import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdmin } from '../middleware/auth';
import { formatHero, safeJsonStringify } from '../utils/formatters';
import { z } from 'zod';

export const heroRoutes = Router();

// GET /api/heroes - list with filters
heroRoutes.get('/', async (req, res, next) => {
  try {
    const { search, cost, role, faction, synergy, rarity, isActive, patchId, page = '1', limit = '100' } = req.query;
    const where: any = {};
    if (search) where.name = { contains: String(search) };
    if (cost) where.cost = Number(cost);
    if (rarity) where.rarity = String(rarity);
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (patchId) where.patchId = String(patchId);
    if (role) where.role = { contains: String(role) };
    if (faction) where.faction = { contains: String(faction) };
    if (synergy) where.synergies = { some: { synergy: { name: { contains: String(synergy) } } } };

    const [heroes, total] = await Promise.all([
      prisma.hero.findMany({
        where,
        include: { synergies: { include: { synergy: true } }, patch: true },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { name: 'asc' },
      }),
      prisma.hero.count({ where }),
    ]);
    res.json({ heroes: heroes.map(formatHero), total, page: Number(page), limit: Number(limit) });
  } catch (e) { next(e); }
});

// GET /api/heroes/:id
heroRoutes.get('/:id', async (req, res, next) => {
  try {
    const hero = await prisma.hero.findUnique({
      where: { id: req.params.id },
      include: { synergies: { include: { synergy: true } }, patch: true },
    });
    if (!hero) return res.status(404).json({ error: 'Hero not found' });
    res.json(formatHero(hero));
  } catch (e) { next(e); }
});

const heroSchema = z.object({
  name: z.string().min(1),
  cost: z.number().int().min(1).max(5),
  rarity: z.string(),
  role: z.array(z.string()).default([]),
  faction: z.array(z.string()).optional().default([]),
  stats: z.record(z.any()).optional().default({}),
  skills: z.array(z.any()).optional().default([]),
  equipments: z.array(z.any()).optional().default([]),
  positions: z.array(z.any()).optional().default([]),
  strengths: z.array(z.string()).optional().default([]),
  weaknesses: z.array(z.string()).optional().default([]),
  upgradeNotes: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  dataSource: z.string().optional(),
  patchId: z.string().optional(),
  synergyIds: z.array(z.string()).optional().default([]),
});

// POST /api/heroes
heroRoutes.post('/', requireAdmin as any, async (req, res, next) => {
  try {
    const data = heroSchema.parse(req.body);
    const { synergyIds, ...rawHeroData } = data;
    const heroData: any = {
      ...rawHeroData,
      role: safeJsonStringify(rawHeroData.role),
      faction: safeJsonStringify(rawHeroData.faction || []),
      stats: safeJsonStringify(rawHeroData.stats, '{}'),
      skills: safeJsonStringify(rawHeroData.skills),
      equipments: safeJsonStringify(rawHeroData.equipments),
      positions: safeJsonStringify(rawHeroData.positions),
      strengths: safeJsonStringify(rawHeroData.strengths),
      weaknesses: safeJsonStringify(rawHeroData.weaknesses),
    };
    const hero = await prisma.hero.create({
      data: {
        ...heroData,
        synergies: { create: synergyIds.map((sid) => ({ synergyId: sid })) },
      },
      include: { synergies: { include: { synergy: true } } },
    });
    res.status(201).json(formatHero(hero));
  } catch (e) { next(e); }
});

// PUT /api/heroes/:id
heroRoutes.put('/:id', requireAdmin as any, async (req, res, next) => {
  try {
    const data = heroSchema.partial().parse(req.body);
    const { synergyIds, ...rawHeroData } = data;
    const heroData: any = { ...rawHeroData };
    if (rawHeroData.role !== undefined) heroData.role = safeJsonStringify(rawHeroData.role);
    if (rawHeroData.faction !== undefined) heroData.faction = safeJsonStringify(rawHeroData.faction);
    if (rawHeroData.stats !== undefined) heroData.stats = safeJsonStringify(rawHeroData.stats, '{}');
    if (rawHeroData.skills !== undefined) heroData.skills = safeJsonStringify(rawHeroData.skills);
    if (rawHeroData.equipments !== undefined) heroData.equipments = safeJsonStringify(rawHeroData.equipments);
    if (rawHeroData.positions !== undefined) heroData.positions = safeJsonStringify(rawHeroData.positions);
    if (rawHeroData.strengths !== undefined) heroData.strengths = safeJsonStringify(rawHeroData.strengths);
    if (rawHeroData.weaknesses !== undefined) heroData.weaknesses = safeJsonStringify(rawHeroData.weaknesses);

    const hero = await prisma.hero.update({
      where: { id: req.params.id },
      data: {
        ...heroData,
        ...(synergyIds !== undefined && {
          synergies: {
            deleteMany: {},
            create: synergyIds.map((sid) => ({ synergyId: sid })),
          },
        }),
      },
      include: { synergies: { include: { synergy: true } } },
    });
    res.json(formatHero(hero));
  } catch (e) { next(e); }
});

// DELETE /api/heroes/:id
heroRoutes.delete('/:id', requireAdmin as any, async (req, res, next) => {
  try {
    await prisma.hero.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// POST /api/heroes/import - bulk import
heroRoutes.post('/import', requireAdmin as any, async (req, res, next) => {
  try {
    const heroes = z.array(heroSchema).parse(req.body);
    const results = [];
    for (const h of heroes) {
      const { synergyIds, ...rawHeroData } = h;
      const heroData: any = {
        ...rawHeroData,
        role: safeJsonStringify(rawHeroData.role),
        faction: safeJsonStringify(rawHeroData.faction || []),
        stats: safeJsonStringify(rawHeroData.stats, '{}'),
        skills: safeJsonStringify(rawHeroData.skills),
        equipments: safeJsonStringify(rawHeroData.equipments),
        positions: safeJsonStringify(rawHeroData.positions),
        strengths: safeJsonStringify(rawHeroData.strengths),
        weaknesses: safeJsonStringify(rawHeroData.weaknesses),
      };
      const hero = await prisma.hero.create({
        data: { ...heroData, synergies: { create: synergyIds.map((sid) => ({ synergyId: sid })) } },
      });
      results.push(formatHero(hero));
    }
    res.json({ imported: results.length, heroes: results });
  } catch (e) { next(e); }
});
