import { useEffect, useState } from 'react';
import { heroApi } from '../api/heroes';
import { commanderApi } from '../api/commanders';
import { synergyApi } from '../api/synergies';
import { patchApi } from '../api/patches';
import { ImageUpload } from '../components/common/ImageUpload';
import type { Hero, Commander, Synergy, Patch } from '../types';
import {
  Settings,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Sword,
  Crown,
  Zap,
  GitBranch,
  X,
  Check,
  Shield,
  Swords,
} from 'lucide-react';
import toast from 'react-hot-toast';

const OFFICIAL_FACTIONS = [
  'Shadeweaver',
  'Astro Power',
  'Echomancer',
  'Dragon Altar',
  'SPECTRE',
  'Dragoncaller',
  'Starbelle',
  'Kishin',
  'Enchanted Tales',
  'Mistbender',
];

const OFFICIAL_ROLES = [
  'Bruiser',
  'Defender',
  'Dauntless',
  'Weapon Master',
  'Marksman',
  'Stargazer',
  'Swiftblade',
  'Mage',
  'Phasewarper',
  'Scavenger',
];

export function Admin() {
  const [activeTab, setActiveTab] = useState<'heroes' | 'commanders' | 'synergies' | 'patches'>('heroes');

  // Data states
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [commanders, setCommanders] = useState<Commander[]>([]);
  const [synergies, setSynergies] = useState<Synergy[]>([]);
  const [patches, setPatches] = useState<Patch[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [editingHero, setEditingHero] = useState<Hero | null>(null);

  const [commanderModalOpen, setCommanderModalOpen] = useState(false);
  const [editingCommander, setEditingCommander] = useState<Commander | null>(null);

  const [synergyModalOpen, setSynergyModalOpen] = useState(false);
  const [editingSynergy, setEditingSynergy] = useState<Synergy | null>(null);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJson, setImportJson] = useState('');

  // Hero form state with Faction & Role selection
  const [heroForm, setHeroForm] = useState({
    name: '',
    cost: 1,
    rarity: 'common' as Hero['rarity'],
    selectedFactions: [] as string[],
    selectedRoles: [] as string[],
    imageUrl: '',
    strengths: '',
    weaknesses: '',
    isActive: true,
    dataSource: '',
    synergyIds: [] as string[],
  });

  const toggleHeroFaction = (factionName: string) => {
    setHeroForm((prev) => ({
      ...prev,
      selectedFactions: prev.selectedFactions.includes(factionName)
        ? prev.selectedFactions.filter((f) => f !== factionName)
        : [...prev.selectedFactions, factionName],
    }));
  };

  const toggleHeroRole = (roleName: string) => {
    setHeroForm((prev) => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(roleName)
        ? prev.selectedRoles.filter((r) => r !== roleName)
        : [...prev.selectedRoles, roleName],
    }));
  };

  // Commander form state
  const [commanderForm, setCommanderForm] = useState({
    name: '',
    skill: '',
    playstyle: '',
    imageUrl: '',
    strengths: '',
    weaknesses: '',
  });

  // Synergy form state
  const [synergyForm, setSynergyForm] = useState({
    name: '',
    description: '',
    iconUrl: '',
    thresholdCount: 2,
    thresholdBonus: '',
  });

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      heroApi.getAll({ limit: 150 }).catch(() => ({ data: { heroes: [] } })),
      commanderApi.getAll().catch(() => ({ data: [] })),
      synergyApi.getAll().catch(() => ({ data: [] })),
      patchApi.getAll().catch(() => ({ data: [] })),
    ])
      .then(([h, c, s, p]) => {
        setHeroes(h.data?.heroes || (Array.isArray(h.data) ? h.data : []));
        setCommanders(Array.isArray(c.data) ? c.data : []);
        setSynergies(Array.isArray(s.data) ? s.data : []);
        setPatches(Array.isArray(p.data) ? p.data : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Hero handlers
  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();

    // Map selected factions and roles to synergy IDs in database
    const matchedSynergyIds: string[] = [];
    const allSelectedNames = [...heroForm.selectedFactions, ...heroForm.selectedRoles];
    allSelectedNames.forEach((name) => {
      const found = synergies.find(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      );
      if (found && !matchedSynergyIds.includes(found.id)) {
        matchedSynergyIds.push(found.id);
      }
    });

    const payload = {
      name: heroForm.name,
      cost: Number(heroForm.cost),
      rarity: heroForm.rarity,
      faction: heroForm.selectedFactions,
      role: heroForm.selectedRoles.map((r) => r.toLowerCase()),
      imageUrl: heroForm.imageUrl,
      strengths: heroForm.strengths.split('\n').filter(Boolean),
      weaknesses: heroForm.weaknesses.split('\n').filter(Boolean),
      isActive: heroForm.isActive,
      dataSource: heroForm.dataSource,
      synergyIds: matchedSynergyIds,
    };

    try {
      if (editingHero) {
        await heroApi.update(editingHero.id, payload);
        toast.success('Hero updated successfully!');
      } else {
        await heroApi.create(payload);
        toast.success('Hero created successfully!');
      }
      setHeroModalOpen(false);
      setEditingHero(null);
      loadAll();
    } catch (e) {
      toast.error('Failed to save hero');
    }
  };

  const handleDeleteHero = async (id: string, name: string) => {
    if (!confirm(`Delete hero "${name}"?`)) return;
    try {
      await heroApi.delete(id);
      toast.success('Hero deleted');
      loadAll();
    } catch (e) {
      toast.error('Failed to delete hero');
    }
  };

  // Commander handlers
  const handleSaveCommander = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: commanderForm.name,
      skill: commanderForm.skill,
      playstyle: commanderForm.playstyle,
      imageUrl: commanderForm.imageUrl,
      strengths: commanderForm.strengths.split('\n').filter(Boolean),
      weaknesses: commanderForm.weaknesses.split('\n').filter(Boolean),
      skillLevels: [
        { level: 1, effect: commanderForm.skill },
        { level: 2, effect: 'Enhanced tactical efficiency' },
        { level: 3, effect: 'Maximum power threshold' },
      ],
    };

    try {
      if (editingCommander) {
        await commanderApi.update(editingCommander.id, payload);
        toast.success('Commander updated!');
      } else {
        await commanderApi.create(payload);
        toast.success('Commander created!');
      }
      setCommanderModalOpen(false);
      setEditingCommander(null);
      loadAll();
    } catch (e) {
      toast.error('Failed to save commander');
    }
  };

  const handleDeleteCommander = async (id: string, name: string) => {
    if (!confirm(`Delete commander "${name}"?`)) return;
    try {
      await commanderApi.delete(id);
      toast.success('Commander deleted');
      loadAll();
    } catch (e) {
      toast.error('Failed to delete commander');
    }
  };

  // Synergy handlers
  const handleSaveSynergy = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: synergyForm.name,
      description: synergyForm.description,
      iconUrl: synergyForm.iconUrl,
      thresholds: [
        {
          count: Number(synergyForm.thresholdCount),
          bonus: synergyForm.thresholdBonus || 'Grants stat bonus to synergy members',
        },
      ],
    };

    try {
      if (editingSynergy) {
        await synergyApi.update(editingSynergy.id, payload);
        toast.success('Synergy updated!');
      } else {
        await synergyApi.create(payload);
        toast.success('Synergy created!');
      }
      setSynergyModalOpen(false);
      setEditingSynergy(null);
      loadAll();
    } catch (e) {
      toast.error('Failed to save synergy');
    }
  };

  const handleDeleteSynergy = async (id: string, name: string) => {
    if (!confirm(`Delete synergy "${name}"?`)) return;
    try {
      await synergyApi.delete(id);
      toast.success('Synergy deleted');
      loadAll();
    } catch (e) {
      toast.error('Failed to delete synergy');
    }
  };

  const handleImportJson = async () => {
    try {
      const parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed)) {
        toast.error('Import data must be a JSON array of heroes');
        return;
      }
      await heroApi.import(parsed);
      toast.success(`Successfully imported ${parsed.length} heroes!`);
      setImportModalOpen(false);
      setImportJson('');
      loadAll();
    } catch (e) {
      toast.error('Invalid JSON or import error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Settings className="text-purple-400" /> Admin Management Panel
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage heroes, commanders, synergies, balance patches, and data imports.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'heroes' && (
            <>
              <button
                onClick={() => setImportModalOpen(true)}
                className="btn-secondary text-sm"
              >
                <Upload size={14} /> Bulk JSON Import
              </button>
              <button
                onClick={() => {
                  setEditingHero(null);
                  setHeroForm({
                    name: '',
                    cost: 1,
                    rarity: 'common',
                    selectedFactions: [],
                    selectedRoles: [],
                    imageUrl: '',
                    strengths: '',
                    weaknesses: '',
                    isActive: true,
                    dataSource: 'Admin entry',
                    synergyIds: [],
                  });
                  setHeroModalOpen(true);
                }}
                className="btn-primary text-sm"
              >
                <Plus size={14} /> Add Hero
              </button>
            </>
          )}

          {activeTab === 'commanders' && (
            <button
              onClick={() => {
                setEditingCommander(null);
                setCommanderForm({
                  name: '',
                  skill: '',
                  playstyle: '',
                  imageUrl: '',
                  strengths: '',
                  weaknesses: '',
                });
                setCommanderModalOpen(true);
              }}
              className="btn-primary text-sm"
            >
              <Plus size={14} /> Add Commander
            </button>
          )}

          {activeTab === 'synergies' && (
            <button
              onClick={() => {
                setEditingSynergy(null);
                setSynergyForm({
                  name: '',
                  description: '',
                  iconUrl: '',
                  thresholdCount: 2,
                  thresholdBonus: '',
                });
                setSynergyModalOpen(true);
              }}
              className="btn-primary text-sm"
            >
              <Plus size={14} /> Add Synergy
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-mcgg-border pb-2">
        <button
          onClick={() => setActiveTab('heroes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'heroes' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sword size={16} /> Heroes ({heroes.length})
        </button>
        <button
          onClick={() => setActiveTab('commanders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'commanders' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Crown size={16} /> Commanders ({commanders.length})
        </button>
        <button
          onClick={() => setActiveTab('synergies')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'synergies' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Zap size={16} /> Synergies ({synergies.length})
        </button>
        <button
          onClick={() => setActiveTab('patches')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'patches' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <GitBranch size={16} /> Patches ({patches.length})
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading admin resources...</div>
      ) : (
        <div>
          {/* Heroes Table */}
          {activeTab === 'heroes' && (
            <div className="card overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-mcgg-border text-gray-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Hero</th>
                    <th className="py-3 px-4">Cost</th>
                    <th className="py-3 px-4">Rarity</th>
                    <th className="py-3 px-4">Faction & Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mcgg-border">
                  {heroes.map((hero) => {
                    const heroFactions = Array.isArray(hero.faction) && hero.faction.length > 0
                      ? hero.faction
                      : hero.synergies
                          ?.filter((hs) => OFFICIAL_FACTIONS.includes(hs.synergy?.name || ''))
                          .map((hs) => hs.synergy?.name as string) || [];

                    const heroRoles = Array.isArray(hero.role) && hero.role.length > 0
                      ? hero.role
                      : hero.synergies
                          ?.filter((hs) => !OFFICIAL_FACTIONS.includes(hs.synergy?.name || ''))
                          .map((hs) => hs.synergy?.name as string) || [];

                    return (
                      <tr key={hero.id} className="hover:bg-gray-800/50">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                            {hero.imageUrl ? (
                              <img src={hero.imageUrl} alt={hero.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="flex items-center justify-center h-full text-sm">⚔️</span>
                            )}
                          </div>
                          <span className="font-semibold text-gray-200">{hero.name}</span>
                        </td>
                        <td className="py-3 px-4 text-mcgg-gold font-bold">{hero.cost}💎</td>
                        <td className="py-3 px-4 capitalize text-gray-400">{hero.rarity}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 items-center">
                            {/* Factions in Indigo */}
                            {heroFactions.map((f: string) => (
                              <span
                                key={f}
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                              >
                                {f}
                              </span>
                            ))}
                            {/* Roles in Emerald */}
                            {heroRoles.map((r: string) => (
                              <span
                                key={r}
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-emerald-500/20 text-emerald-300 border-emerald-500/30 capitalize"
                              >
                                {r}
                              </span>
                            ))}
                            {heroFactions.length === 0 && heroRoles.length === 0 && (
                              <span className="text-xs text-gray-500">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`badge ${
                              hero.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {hero.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingHero(hero);
                              const currentFactions: string[] = [];
                              if (Array.isArray(hero.faction) && hero.faction.length > 0) {
                                hero.faction.forEach((f) => {
                                  const match = OFFICIAL_FACTIONS.find((of) => of.toLowerCase() === f.toLowerCase()) || f;
                                  if (!currentFactions.includes(match)) currentFactions.push(match);
                                });
                              }
                              if (hero.synergies) {
                                hero.synergies.forEach((hs) => {
                                  const sname = hs.synergy?.name;
                                  if (sname && OFFICIAL_FACTIONS.includes(sname) && !currentFactions.includes(sname)) {
                                    currentFactions.push(sname);
                                  }
                                });
                              }

                              const currentRoles: string[] = [];
                              if (Array.isArray(hero.role) && hero.role.length > 0) {
                                hero.role.forEach((r) => {
                                  const match = OFFICIAL_ROLES.find((or) => or.toLowerCase() === r.toLowerCase()) || r;
                                  if (!currentRoles.includes(match)) currentRoles.push(match);
                                });
                              }
                              if (hero.synergies) {
                                hero.synergies.forEach((hs) => {
                                  const sname = hs.synergy?.name;
                                  if (
                                    sname &&
                                    (OFFICIAL_ROLES.includes(sname) || !OFFICIAL_FACTIONS.includes(sname)) &&
                                    !currentRoles.includes(sname)
                                  ) {
                                    currentRoles.push(sname);
                                  }
                                });
                              }

                              setHeroForm({
                                name: hero.name,
                                cost: hero.cost,
                                rarity: hero.rarity,
                                selectedFactions: currentFactions,
                                selectedRoles: currentRoles,
                                imageUrl: hero.imageUrl || '',
                                strengths: hero.strengths?.join('\n') || '',
                                weaknesses: hero.weaknesses?.join('\n') || '',
                                isActive: hero.isActive,
                                dataSource: hero.dataSource || '',
                                synergyIds: hero.synergies?.map((s) => s.synergy?.id).filter(Boolean) as string[],
                              });
                              setHeroModalOpen(true);
                            }}
                            className="btn-secondary text-xs px-2.5 py-1"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteHero(hero.id, hero.name)}
                            className="btn-secondary text-xs px-2.5 py-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {heroes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No heroes found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Commanders Table */}
          {activeTab === 'commanders' && (
            <div className="card overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-mcgg-border text-gray-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Commander</th>
                    <th className="py-3 px-4">Playstyle</th>
                    <th className="py-3 px-4">Core Skill</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mcgg-border">
                  {commanders.map((cmd) => (
                    <tr key={cmd.id} className="hover:bg-gray-800/50">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-gray-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {cmd.imageUrl ? (
                            <img src={cmd.imageUrl} alt={cmd.name} className="w-full h-full object-cover" />
                          ) : (
                            <Crown size={16} className="text-mcgg-gold" />
                          )}
                        </div>
                        <span className="font-semibold text-gray-200">{cmd.name}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{cmd.playstyle || 'Tactician'}</td>
                      <td className="py-3 px-4 text-gray-400 truncate max-w-xs">{cmd.skill}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingCommander(cmd);
                            setCommanderForm({
                              name: cmd.name,
                              skill: cmd.skill,
                              playstyle: cmd.playstyle || '',
                              imageUrl: cmd.imageUrl || '',
                              strengths: cmd.strengths?.join('\n') || '',
                              weaknesses: cmd.weaknesses?.join('\n') || '',
                            });
                            setCommanderModalOpen(true);
                          }}
                          className="btn-secondary text-xs px-2.5 py-1"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteCommander(cmd.id, cmd.name)}
                          className="btn-secondary text-xs px-2.5 py-1 text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {commanders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">
                        No commanders found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Synergies Table */}
          {activeTab === 'synergies' && (
            <div className="card overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-mcgg-border text-gray-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Synergy</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Thresholds</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mcgg-border">
                  {synergies.map((syn) => (
                    <tr key={syn.id} className="hover:bg-gray-800/50">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-gray-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {syn.iconUrl ? (
                            <img src={syn.iconUrl} alt={syn.name} className="w-full h-full object-cover" />
                          ) : (
                            <Zap size={16} className="text-mcgg-gold" />
                          )}
                        </div>
                        <span className="font-semibold text-gray-200">{syn.name}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 truncate max-w-sm">{syn.description}</td>
                      <td className="py-3 px-4 text-gray-300">
                        {syn.thresholds?.map((t) => `(${t.count})`).join(', ') || '-'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingSynergy(syn);
                            setSynergyForm({
                              name: syn.name,
                              description: syn.description,
                              iconUrl: syn.iconUrl || '',
                              thresholdCount: syn.thresholds?.[0]?.count || 2,
                              thresholdBonus: syn.thresholds?.[0]?.bonus || '',
                            });
                            setSynergyModalOpen(true);
                          }}
                          className="btn-secondary text-xs px-2.5 py-1"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteSynergy(syn.id, syn.name)}
                          className="btn-secondary text-xs px-2.5 py-1 text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {synergies.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">
                        No synergies found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Patches Table */}
          {activeTab === 'patches' && (
            <div className="card overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-mcgg-border text-gray-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Release Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mcgg-border">
                  {patches.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-800/50">
                      <td className="py-3 px-4 font-bold text-mcgg-gold">Patch {p.version}</td>
                      <td className="py-3 px-4 text-gray-400">{new Date(p.releaseDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`badge ${
                            p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300 truncate max-w-sm">{p.notes || '-'}</td>
                    </tr>
                  ))}
                  {patches.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">
                        No patches registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Hero Modal */}
      {heroModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setHeroModalOpen(false)}
        >
          <div
            className="card max-w-xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-100">
                {editingHero ? `Edit Hero: ${editingHero.name}` : 'Create New Hero'}
              </h2>
              <button onClick={() => setHeroModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveHero} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Hero Name</label>
                  <input
                    className="input"
                    value={heroForm.name}
                    onChange={(e) => setHeroForm({ ...heroForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Cost (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="input"
                    value={heroForm.cost}
                    onChange={(e) => setHeroForm({ ...heroForm, cost: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Rarity</label>
                <select
                  className="input capitalize"
                  value={heroForm.rarity}
                  onChange={(e) => setHeroForm({ ...heroForm, rarity: e.target.value as any })}
                >
                  <option value="common">Common (Grey)</option>
                  <option value="uncommon">Uncommon (Green)</option>
                  <option value="rare">Rare (Blue)</option>
                  <option value="epic">Epic (Purple)</option>
                  <option value="legendary">Legendary (Gold)</option>
                </select>
              </div>

              {/* Faction Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                    <Shield size={14} className="text-indigo-400" /> Pilihan Faction
                    <span className="text-[11px] font-normal text-gray-400">(Pilih 1 atau lebih Faction)</span>
                  </label>
                  {heroForm.selectedFactions.length > 0 && (
                    <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                      {heroForm.selectedFactions.length} Faction dipilih
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 p-2.5 bg-gray-900/90 rounded-lg border border-mcgg-border">
                  {OFFICIAL_FACTIONS.map((faction) => {
                    const isSelected = heroForm.selectedFactions.includes(faction);
                    return (
                      <button
                        key={faction}
                        type="button"
                        onClick={() => toggleHeroFaction(faction)}
                        className={`text-xs px-2.5 py-1.5 rounded-md border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold shadow-sm'
                            : 'bg-gray-800/80 border-gray-700/80 text-gray-400 hover:text-gray-200 hover:border-gray-600'
                        }`}
                      >
                        <span className="truncate">{faction}</span>
                        {isSelected ? <span className="text-indigo-400 text-xs font-black ml-1">✓</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                    <Swords size={14} className="text-emerald-400" /> Pilihan Role
                    <span className="text-[11px] font-normal text-gray-400">(Pilih 1 atau lebih Role)</span>
                  </label>
                  {heroForm.selectedRoles.length > 0 && (
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                      {heroForm.selectedRoles.length} Role dipilih
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 p-2.5 bg-gray-900/90 rounded-lg border border-mcgg-border">
                  {OFFICIAL_ROLES.map((role) => {
                    const isSelected = heroForm.selectedRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleHeroRole(role)}
                        className={`text-xs px-2.5 py-1.5 rounded-md border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold shadow-sm'
                            : 'bg-gray-800/80 border-gray-700/80 text-gray-400 hover:text-gray-200 hover:border-gray-600'
                        }`}
                      >
                        <span className="truncate">{role}</span>
                        {isSelected ? <span className="text-emerald-400 text-xs font-black ml-1">✓</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Image Upload / URL</label>
                <ImageUpload
                  currentUrl={heroForm.imageUrl}
                  entityType="hero"
                  onUpload={(url) => setHeroForm({ ...heroForm, imageUrl: url })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Strengths (one per line)
                  </label>
                  <textarea
                    className="input h-20"
                    value={heroForm.strengths}
                    onChange={(e) => setHeroForm({ ...heroForm, strengths: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Weaknesses (one per line)
                  </label>
                  <textarea
                    className="input h-20"
                    value={heroForm.weaknesses}
                    onChange={(e) => setHeroForm({ ...heroForm, weaknesses: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Data Source / Verification</label>
                <input
                  className="input"
                  placeholder="Official Game client, In-Game Codex"
                  value={heroForm.dataSource}
                  onChange={(e) => setHeroForm({ ...heroForm, dataSource: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="heroActiveCheck"
                  checked={heroForm.isActive}
                  onChange={(e) => setHeroForm({ ...heroForm, isActive: e.target.checked })}
                  className="rounded text-mcgg-gold bg-mcgg-dark border-mcgg-border"
                />
                <label htmlFor="heroActiveCheck" className="text-sm text-gray-300">
                  Active in current patch
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHeroModalOpen(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm">
                  Save Hero
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Commander Modal */}
      {commanderModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setCommanderModalOpen(false)}
        >
          <div
            className="card max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-100">
                {editingCommander ? `Edit Commander: ${editingCommander.name}` : 'Create New Commander'}
              </h2>
              <button onClick={() => setCommanderModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCommander} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Commander Name</label>
                <input
                  className="input"
                  value={commanderForm.name}
                  onChange={(e) => setCommanderForm({ ...commanderForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Playstyle</label>
                <input
                  className="input"
                  placeholder="e.g. Economy / Hyper-Roll / Defensive"
                  value={commanderForm.playstyle}
                  onChange={(e) => setCommanderForm({ ...commanderForm, playstyle: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Skill Description</label>
                <textarea
                  className="input h-20"
                  placeholder="Describe active skill effect..."
                  value={commanderForm.skill}
                  onChange={(e) => setCommanderForm({ ...commanderForm, skill: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Commander Image</label>
                <ImageUpload
                  currentUrl={commanderForm.imageUrl}
                  entityType="commander"
                  onUpload={(url) => setCommanderForm({ ...commanderForm, imageUrl: url })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCommanderModalOpen(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm">
                  Save Commander
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Synergy Modal */}
      {synergyModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSynergyModalOpen(false)}
        >
          <div
            className="card max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-100">
                {editingSynergy ? `Edit Synergy: ${editingSynergy.name}` : 'Create New Synergy'}
              </h2>
              <button onClick={() => setSynergyModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSynergy} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Synergy Name</label>
                <input
                  className="input"
                  value={synergyForm.name}
                  onChange={(e) => setSynergyForm({ ...synergyForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  className="input h-20"
                  value={synergyForm.description}
                  onChange={(e) => setSynergyForm({ ...synergyForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Count Required</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={synergyForm.thresholdCount}
                    onChange={(e) => setSynergyForm({ ...synergyForm, thresholdCount: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">Bonus Effect</label>
                  <input
                    className="input"
                    placeholder="e.g. +30% Physical Attack"
                    value={synergyForm.thresholdBonus}
                    onChange={(e) => setSynergyForm({ ...synergyForm, thresholdBonus: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Icon Upload</label>
                <ImageUpload
                  currentUrl={synergyForm.iconUrl}
                  entityType="synergy"
                  onUpload={(url) => setSynergyForm({ ...synergyForm, iconUrl: url })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSynergyModalOpen(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm">
                  Save Synergy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JSON Bulk Import Modal */}
      {importModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setImportModalOpen(false)}
        >
          <div className="card max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-gray-100">Bulk Hero JSON Import</h2>
              <button onClick={() => setImportModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Paste a JSON array of hero objects (name, cost, rarity, role, stats, etc.):
            </p>
            <textarea
              className="input font-mono text-xs h-64 mb-4"
              placeholder={`[\n  {\n    "name": "Miya",\n    "cost": 1,\n    "rarity": "common",\n    "role": ["marksman"]\n  }\n]`}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setImportModalOpen(false)} className="btn-secondary text-sm">
                Cancel
              </button>
              <button onClick={handleImportJson} className="btn-primary text-sm">
                Import JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
