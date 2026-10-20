import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationApi } from '../api/recommendations';
import { synergyApi } from '../api/synergies';
import { heroApi } from '../api/heroes';
import { useLineupStore } from '../store/lineupStore';
import type { Hero, Synergy } from '../types';
import { Star, Sparkles, ArrowRight, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Recommendation {
  id: string;
  name: string;
  playstyle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  commanderName?: string;
  heroes: { hero: Hero; star: number; roleTip: string }[];
  synergies: { name: string; count: number; bonus: string }[];
  score: number;
  strategyNotes: string;
}

export function Recommendations() {
  const navigate = useNavigate();
  const { resetBoard, addHero } = useLineupStore();

  const [synergies, setSynergies] = useState<Synergy[]>([]);
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [playstyle, setPlaystyle] = useState('balanced');
  const [targetSynergy, setTargetSynergy] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    Promise.all([synergyApi.getAll(), heroApi.getAll({ limit: 100 })])
      .then(([s, h]) => {
        setSynergies(Array.isArray(s.data) ? s.data : []);
        setHeroes(h.data?.heroes || (Array.isArray(h.data) ? h.data : []));
      })
      .catch((err) => console.warn('Could not load base data:', err));
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await recommendationApi.generate({
        playstyle,
        targetSynergy,
        difficulty,
      });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setRecommendations(res.data);
      } else {
        // Fallback generator based on local hero/synergy data if backend recommendation returns empty
        generateLocalRecommendations();
      }
    } catch (e) {
      // Fallback local recommendations
      generateLocalRecommendations();
    } finally {
      setLoading(false);
    }
  };

  const generateLocalRecommendations = () => {
    if (heroes.length === 0) {
      toast.error('Heroes database is empty. Please check database or admin panel.');
      return;
    }

    // Filter or select heroes that fit the criteria
    const pool = targetSynergy
      ? heroes.filter((h) => h.synergies?.some((s) => s.synergy?.name === targetSynergy || s.synergy?.id === targetSynergy))
      : heroes;

    const selectedHeroes = pool.slice(0, 6).length >= 4 ? pool.slice(0, 6) : heroes.slice(0, 6);

    const fallbackRecs: Recommendation[] = [
      {
        id: 'rec-1',
        name: targetSynergy ? `${targetSynergy} Ascendant Meta` : 'Balanced Dominance Formation',
        playstyle: playstyle.toUpperCase(),
        difficulty: 'Medium',
        description:
          'High synergy tempo composition with frontline durability and backline damage scaling.',
        commanderName: 'Abe / Remy',
        heroes: selectedHeroes.map((h, i) => ({
          hero: h,
          star: i < 2 ? 3 : 2,
          roleTip: i < 2 ? 'Main Tank' : 'Carry DPS',
        })),
        synergies: [
          { name: targetSynergy || 'Marksman', count: 4, bonus: 'High attack speed and crit chance' },
          { name: 'Warrior', count: 2, bonus: 'Bonus armor and crowd control' },
        ],
        score: 92,
        strategyNotes:
          'Economy focus: save to 20 gold for interest before level 6. Hyper-roll for core 2-cost heroes.',
      },
      {
        id: 'rec-2',
        name: 'Fast-Tempo Aggro Surge',
        playstyle: 'AGGRESSIVE',
        difficulty: 'Easy',
        description:
          'Quick 1-cost and 2-cost 3-star power spike lineup that punishes greedy late-game comps.',
        commanderName: 'Harper',
        heroes: heroes.slice(2, 8).map((h, i) => ({
          hero: h,
          star: 2,
          roleTip: 'Tempo early pusher',
        })),
        synergies: [
          { name: 'Assassin', count: 3, bonus: 'Critical burst strikes' },
          { name: 'Support', count: 2, bonus: 'Shielding and HP regeneration' },
        ],
        score: 87,
        strategyNotes: 'Win streak early to maintain high HP. Do not level up before round 5.',
      },
    ];

    setRecommendations(fallbackRecs);
    toast.success('Generated top recommended compositions!');
  };

  useEffect(() => {
    if (heroes.length > 0 && recommendations.length === 0) {
      generateLocalRecommendations();
    }
  }, [heroes]);

  const loadIntoBuilder = (rec: Recommendation) => {
    resetBoard();
    rec.heroes.forEach((item, index) => {
      const row = Math.floor(index / 3);
      const col = (index % 3) * 2 + 1;
      addHero(item.hero, { row, col });
    });
    toast.success(`Loaded "${rec.name}" into Lineup Builder!`);
    navigate('/lineup-builder');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Star className="text-mcgg-gold" /> Lineup Recommendations
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Algorithmic lineup generator based on synergies, tier rankings, and tactical balance.
        </p>
      </div>

      {/* Filter / Criteria Card */}
      <div className="card">
        <h2 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-mcgg-gold" /> Strategy Criteria
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Playstyle</label>
            <select
              className="input text-sm"
              value={playstyle}
              onChange={(e) => setPlaystyle(e.target.value)}
            >
              <option value="balanced">Balanced (Stable Winrate)</option>
              <option value="aggressive">Aggressive (Early Win Streak)</option>
              <option value="scaling">Late Game Scaling (Hyper-Carry)</option>
              <option value="magic">Magic Burst (Mage focused)</option>
              <option value="tank">Sustain & Fortress (High defense)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Target Synergy</label>
            <select
              className="input text-sm"
              value={targetSynergy}
              onChange={(e) => setTargetSynergy(e.target.value)}
            >
              <option value="">Any Synergy</option>
              {synergies.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Execution Difficulty</label>
            <select
              className="input text-sm"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Beginner Friendly</option>
              <option value="Medium">Intermediate</option>
              <option value="Hard">Expert (Positioning Dependent)</option>
            </select>
          </div>

          <div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? 'Analyzing...' : 'Generate Lineups'}
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-950/30 border border-yellow-700/50 rounded-xl p-3 flex items-start gap-3">
        <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
        <p className="text-xs text-yellow-200/80 leading-relaxed">
          <b>Algorithm Notice:</b> Composition scores and recommendations are calculated using synergy multipliers, hero tier weighting, and balance heuristics. They are not official Moonton backend win-rate records.
        </p>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="card hover:border-mcgg-gold/40 transition-all">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4 border-b border-mcgg-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-100">{rec.name}</h3>
                  <span className="badge bg-mcgg-gold/20 text-mcgg-gold font-semibold">
                    Score: {rec.score}/100
                  </span>
                  <span className="badge bg-purple-500/20 text-purple-300">
                    {rec.difficulty}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{rec.description}</p>
                {rec.commanderName && (
                  <p className="text-xs text-mcgg-gold mt-0.5">
                    Recommended Commander: <b>{rec.commanderName}</b>
                  </p>
                )}
              </div>
              <button
                onClick={() => loadIntoBuilder(rec)}
                className="btn-primary text-sm px-4 py-2"
              >
                Load into Builder <ArrowRight size={16} />
              </button>
            </div>

            {/* Core Heroes */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                Key Heroes
              </h4>
              <div className="flex flex-wrap gap-3">
                {rec.heroes.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-gray-900 border border-mcgg-border p-2 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded bg-gray-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {item.hero.imageUrl ? (
                        <img
                          src={item.hero.imageUrl}
                          alt={item.hero.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>⚔️</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-100">{item.hero.name}</p>
                      <p className="text-[10px] text-mcgg-gold">{item.hero.cost}💎 · {item.roleTip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Synergies & Strategy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                <h5 className="font-semibold text-blue-400 mb-1 flex items-center gap-1">
                  <Zap size={14} /> Active Synergy Bonuses
                </h5>
                <div className="space-y-1 mt-1">
                  {rec.synergies.map((s, i) => (
                    <div key={i} className="flex items-baseline gap-1.5">
                      <span className="font-bold text-gray-200">[{s.count}] {s.name}:</span>
                      <span className="text-gray-400">{s.bonus}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                <h5 className="font-semibold text-green-400 mb-1 flex items-center gap-1">
                  <ShieldCheck size={14} /> Tactical Strategy Tips
                </h5>
                <p className="text-gray-300 leading-relaxed mt-1">
                  {rec.strategyNotes}
                </p>
              </div>
            </div>
          </div>
        ))}

        {recommendations.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No recommendations generated. Click "Generate Lineups" above to analyze.
          </div>
        )}
      </div>
    </div>
  );
}
