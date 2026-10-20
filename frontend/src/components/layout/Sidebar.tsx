import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Sword,
  Crown,
  Zap,
  Layout,
  Star,
  TrendingUp,
  GitBranch,
  Bookmark,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/heroes', icon: Sword, label: 'Heroes' },
  { to: '/commanders', icon: Crown, label: 'Commanders' },
  { to: '/synergies', icon: Zap, label: 'Synergies' },
  { to: '/lineup-builder', icon: Layout, label: 'Lineup Builder' },
  { to: '/recommendations', icon: Star, label: 'Recommendations' },
  { to: '/tier-list', icon: TrendingUp, label: 'Tier List' },
  { to: '/patches', icon: GitBranch, label: 'Patches' },
  { to: '/saved-lineups', icon: Bookmark, label: 'Saved Lineups' },
];

export function Sidebar() {
  const { user, isAdmin, logout } = useAuthStore();

  return (
    <aside className="w-64 bg-mcgg-card border-r border-mcgg-border flex flex-col min-h-screen">
      <div className="p-6 border-b border-mcgg-border">
        <h1 className="text-xl font-bold text-mcgg-gold">⚔️ MCGG Guide</h1>
        <p className="text-xs text-gray-400 mt-1">Magic Chess GoGo</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-mcgg-gold/10 text-mcgg-gold font-medium'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-purple-500/10 text-purple-400 font-medium'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`
            }
          >
            <Settings size={18} />
            Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-mcgg-border">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-sm font-medium text-gray-200 truncate">{user.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="text-gray-400 hover:text-red-400 transition-colors p-1"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <NavLink to="/login" className="btn-primary text-sm w-full text-center block">
            Login
          </NavLink>
        )}
      </div>
    </aside>
  );
}
