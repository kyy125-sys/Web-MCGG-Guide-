import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { heroApi } from '../api/heroes';
import { commanderApi } from '../api/commanders';
import { synergyApi } from '../api/synergies';
import { patchApi } from '../api/patches';
import { lineupApi } from '../api/lineups';
import { Sword, Crown, Zap, Layout, GitBranch } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({ heroes: 0, commanders: 0, synergies: 0, lineups: 0 });
  const [activePatch, setActivePatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      heroApi.getAll({ limit: 1 }),
      commanderApi.getAll(),
      synergyApi.getAll(),
      lineupApi.getAll(),
      patchApi.getActive(),
    ])
      .then(([heroes, commanders, synergies, lineups, patch]) => {
        setStats({
          heroes: heroes.data?.total || heroes.data?.heroes?.length || 0,
          commanders: commanders.data?.length || 0,
          synergies: synergies.data?.length || 0,
          lineups: lineups.data?.length || 0,
        });
        setActivePatch(patch.data);
      })
      .catch((err) => {
        console.warn('Backend not ready or error loading dashboard data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Heroes', count: stats.heroes, icon: Sword, to: '/heroes', color: 'text-blue-400' },
    { label: 'Commanders', count: stats.commanders, icon: Crown, to: '/commanders', color: 'text-mcgg-gold' },
    { label: 'Synergies', count: stats.synergies, icon: Zap, to: '/synergies', color: 'text-purple-400' },
    { label: 'Lineups', count: stats.lineups, icon: Layout, to: '/saved-lineups', color: 'text-green-400' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-mcgg-gold">⚔️ MCGG Guide</h1>
        <p className="text-gray-400 mt-1">Magic Chess GoGo — Lineup Builder & Database</p>
        {activePatch && (
          <div className="mt-3 inline-flex items-center gap-2 bg-green-900/30 border border-green-700 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-green-300">Patch {activePatch.version} Active</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, count, icon: Icon, to, color }) => (
          <Link key={label} to={to} className="card hover:border-mcgg-gold/40 transition-colors">
            <Icon className={`${color} mb-3`} size={28} />
            <p className="text-2xl font-bold text-gray-100">{loading ? '...' : count}</p>
            <p className="text-sm text-gray-400">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <GitBranch size={18} /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/lineup-builder" className="btn-primary text-center py-3 rounded-xl">
              🎮 Build Lineup
            </Link>
            <Link to="/recommendations" className="btn-secondary text-center py-3 rounded-xl">
              ⭐ Get Recommendation
            </Link>
            <Link to="/heroes" className="btn-secondary text-center py-3 rounded-xl">
              ⚔️ Browse Heroes
            </Link>
            <Link to="/tier-list" className="btn-secondary text-center py-3 rounded-xl">
              📊 View Tier List
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-200 mb-4">📋 About This Tool</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>✅ Hero, Commander & Synergy database</li>
            <li>✅ Interactive drag-and-drop lineup builder</li>
            <li>✅ Real-time synergy calculation</li>
            <li>✅ Lineup recommendations & scoring</li>
            <li>✅ Tier list with manual ratings</li>
            <li>✅ Patch management & version history</li>
            <li>⚠️ Scores are algorithmic, not official win-rate data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
