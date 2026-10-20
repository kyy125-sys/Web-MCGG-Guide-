import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { formatHero, formatSynergy, safeJsonParse } from '../utils/formatters';
import { z } from 'zod';

export const recommendationRoutes = Router();

const criteriaSchema = z.object({
  patchId: z.string().optional(),
  commanderId: z.string().optional(),
  mainSynergyIds: z.array(z.string()).default([]),
  slots: z.number().int().min(3).max(10).default(6),
  playstyle: z.string().optional(),
  excludeHeroIds: z.array(z.string()).default([]),
  includeHeroIds: z.array(z.string()).default([]),
  focus: z.enum(['damage', 'tank', 'balanced', 'flex']).default('balanced'),
  limit: z.number().int().min(1).max(10).default(5),
});

recommendationRoutes.post('/', async (req, res, next) => {
  try {
    const criteria = criteriaSchema.parse(req.body);

    // Fetch active heroes with synergies
    const rawHeroes = await prisma.hero.findMany({
      where: { isActive: true, ...(criteria.patchId ? { patchId: criteria.patchId } : {}) },
      include: { synergies: { include: { synergy: true } } },
    });
    const allHeroes = rawHeroes.map(formatHero);

    const rawSynergies = await prisma.synergy.findMany({
      include: { heroSynergies: true },
    });
    const allSynergies = rawSynergies.map(formatSynergy);

    // Filter out excluded heroes
    let pool = allHeroes.filter(h => !criteria.excludeHeroIds.includes(h.id));

    // Prioritize included heroes
    const prioritized = pool.filter(h => criteria.includeHeroIds.includes(h.id));
    const remaining = pool.filter(h => !criteria.includeHeroIds.includes(h.id));
    pool = [...prioritized, ...remaining];

    // Score-based lineup generation
    const recommendations = [];
    const combos = generateLineupCombos(pool, allSynergies, criteria);

    for (const combo of combos.slice(0, criteria.limit)) {
      const activeSynergies = calculateActiveSynergies(combo.heroes, allSynergies);
      recommendations.push({
        heroes: combo.heroes,
        score: combo.score,
        activeSynergies,
        synergyScore: activeSynergies.reduce((sum: number, s: any) => sum + s.level, 0),
        scoreBreakdown: combo.breakdown,
        confidence: combo.score > 70 ? 'high' : combo.score > 40 ? 'medium' : 'low',
        note: 'Algorithm score — not official win rate data',
      });
    }

    res.json({ recommendations, criteriaUsed: criteria, dataNote: 'Scores are algorithmic estimates, not official statistics' });
  } catch (e) { next(e); }
});

function generateLineupCombos(pool: any[], synergies: any[], criteria: any) {
  const results: any[] = [];
  const numLineups = Math.min(8, Math.max(3, pool.length));

  for (let attempt = 0; attempt < numLineups; attempt++) {
    const used = new Set<string>();
    const heroes: any[] = [];

    // Add prioritized heroes first
    for (const h of pool.filter(h => criteria.includeHeroIds.includes(h.id))) {
      if (heroes.length < criteria.slots) { heroes.push(h); used.add(h.id); }
    }

    // Attempt variation: pick different seed heroes to get variety
    const remainingPool = pool.filter(h => !used.has(h.id));
    if (attempt > 0 && remainingPool.length > attempt && heroes.length < criteria.slots) {
      const seedHero = remainingPool[attempt % remainingPool.length];
      heroes.push(seedHero);
      used.add(seedHero.id);
    }

    // Fill remaining slots greedily by synergy score
    const candidates = pool.filter(h => !used.has(h.id));
    candidates.sort((a, b) => {
      const scoreA = scoreSynergyFit(a, heroes, synergies);
      const scoreB = scoreSynergyFit(b, heroes, synergies);
      return scoreB - scoreA;
    });

    for (const h of candidates) {
      if (heroes.length >= criteria.slots) break;
      heroes.push(h);
      used.add(h.id);
    }

    if (heroes.length < 3) continue;

    const activeSynergies = calculateActiveSynergies(heroes, synergies);
    const synergyScore = activeSynergies.reduce((sum: number, s: any) => sum + s.level * 15, 0);
    const costScore = heroes.reduce((sum: number, h: any) => sum + (6 - h.cost) * 4, 0);
    const score = Math.min(100, Math.round(synergyScore + costScore / heroes.length));

    // Avoid duplicate combinations
    const comboKey = heroes.map(h => h.id).sort().join(',');
    if (!results.some(r => r.comboKey === comboKey)) {
      results.push({ heroes, score, breakdown: { synergyScore, costScore }, comboKey });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

function scoreSynergyFit(hero: any, currentHeroes: any[], synergies: any[]): number {
  let score = 0;
  const heroSynergyIds = hero.synergies ? hero.synergies.map((hs: any) => hs.synergy?.id || hs.synergyId) : [];
  for (const s of synergies) {
    const currentCount = currentHeroes.filter(h =>
      h.synergies?.some((hs: any) => (hs.synergy?.id || hs.synergyId) === s.id)
    ).length;
    if (heroSynergyIds.includes(s.id)) {
      const thresholds: any[] = s.thresholds || [];
      const nextThreshold = thresholds.find((t: any) => t.count > currentCount);
      if (nextThreshold && nextThreshold.count - currentCount === 1) score += 25;
      else if (currentCount > 0) score += 8;
      else score += 2;
    }
  }
  return score;
}

function calculateActiveSynergies(heroes: any[], synergies: any[]) {
  return synergies
    .map(s => {
      const count = heroes.filter(h =>
        h.synergies?.some((hs: any) => (hs.synergy?.id || hs.synergyId) === s.id)
      ).length;
      const thresholds: any[] = s.thresholds || [];
      const activeThresholds = thresholds.filter((t: any) => t.count <= count);
      if (activeThresholds.length === 0) return null;
      const currentLevel = activeThresholds[activeThresholds.length - 1];
      return { synergy: s, count, level: activeThresholds.length, activeBonus: currentLevel.bonus };
    })
    .filter(Boolean) as any[];
}
