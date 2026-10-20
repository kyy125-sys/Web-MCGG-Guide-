// Utility functions to format/parse JSON fields for SQLite storage

export function safeJsonParse<T = any>(val: any, fallback: T): T {
  if (typeof val !== 'string') return val ?? fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

export function safeJsonStringify(val: any, fallback = '[]'): string {
  if (typeof val === 'string') return val;
  try {
    return JSON.stringify(val ?? fallback);
  } catch {
    return fallback;
  }
}

export function formatHero(hero: any) {
  if (!hero) return hero;
  return {
    ...hero,
    role: safeJsonParse(hero.role, []),
    faction: safeJsonParse(hero.faction, []),
    stats: safeJsonParse(hero.stats, {}),
    skills: safeJsonParse(hero.skills, []),
    equipments: safeJsonParse(hero.equipments, []),
    positions: safeJsonParse(hero.positions, []),
    strengths: safeJsonParse(hero.strengths, []),
    weaknesses: safeJsonParse(hero.weaknesses, []),
    synergies: hero.synergies ? hero.synergies.map((hs: any) => ({
      ...hs,
      synergy: hs.synergy ? formatSynergy(hs.synergy) : hs.synergy,
    })) : [],
  };
}

export function formatCommander(cmd: any) {
  if (!cmd) return cmd;
  return {
    ...cmd,
    skillLevels: safeJsonParse(cmd.skillLevels, []),
    strengths: safeJsonParse(cmd.strengths, []),
    weaknesses: safeJsonParse(cmd.weaknesses, []),
  };
}

export function formatSynergy(synergy: any) {
  if (!synergy) return synergy;
  return {
    ...synergy,
    thresholds: safeJsonParse(synergy.thresholds, []),
    heroSynergies: synergy.heroSynergies ? synergy.heroSynergies.map((hs: any) => ({
      ...hs,
      hero: hs.hero ? formatHero(hs.hero) : hs.hero,
    })) : undefined,
  };
}

export function formatLineup(lineup: any) {
  if (!lineup) return lineup;
  return {
    ...lineup,
    tags: safeJsonParse(lineup.tags, []),
    formationConfig: safeJsonParse(lineup.formationConfig, {}),
    synergySnapshot: safeJsonParse(lineup.synergySnapshot, []),
    commander: lineup.commander ? formatCommander(lineup.commander) : lineup.commander,
    heroes: lineup.heroes ? lineup.heroes.map((lh: any) => ({
      id: lh.id,
      lineupId: lh.lineupId,
      heroId: lh.heroId,
      position: { row: lh.posRow ?? 0, col: lh.posCol ?? 0 },
      star: lh.star ?? 1,
      items: safeJsonParse(lh.items, []),
      hero: lh.hero ? formatHero(lh.hero) : lh.hero,
    })) : [],
  };
}

export function formatPatch(patch: any) {
  if (!patch) return patch;
  return {
    ...patch,
    sources: safeJsonParse(patch.sources, []),
  };
}
