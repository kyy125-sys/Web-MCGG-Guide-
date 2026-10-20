import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Lock, Mail, ShieldAlert, LogIn, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const res = await authApi.register({ email, password });
        login(res.data.user, res.data.token);
        toast.success('Account created successfully!');
      } else {
        const res = await authApi.login({ email, password });
        login(res.data.user, res.data.token);
        toast.success('Logged in successfully!');
      }
      navigate('/');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Demo fast-login helpers for development / quick preview
  const handleQuickDemoLogin = (role: 'admin' | 'user') => {
    const dummyUser = {
      id: role === 'admin' ? 'demo-admin-id' : 'demo-user-id',
      email: role === 'admin' ? 'admin@mcgg.guide' : 'player@mcgg.guide',
      role: role,
    };
    login(dummyUser, `mock-jwt-token-${role}`);
    toast.success(`Logged in as ${role}!`);
    navigate(role === 'admin' ? '/admin' : '/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mcgg-dark p-4">
      <div className="card max-w-md w-full p-8 shadow-2xl border-mcgg-border">
        <div className="text-center mb-6">
          <span className="text-4xl">⚔️</span>
          <h1 className="text-2xl font-bold text-mcgg-gold mt-2">Magic Chess GoGo</h1>
          <p className="text-xs text-gray-400 mt-1">
            {isRegister ? 'Create an account to save formations' : 'Sign in to access your lineups and guide tools'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                className="input pl-9"
                placeholder="commander@mcgg.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                className="input pl-9"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 mt-2"
          >
            {loading ? (
              'Processing...'
            ) : isRegister ? (
              <>
                <UserPlus size={16} /> Create Account
              </>
            ) : (
              <>
                <LogIn size={16} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-gray-400 hover:text-mcgg-gold transition-colors"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Quick Demo Access */}
        <div className="mt-8 pt-6 border-t border-mcgg-border">
          <p className="text-xs text-center text-gray-500 mb-3 flex items-center justify-center gap-1">
            <ShieldAlert size={12} /> Quick Demo Access (No backend required)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('user')}
              className="btn-secondary text-xs py-2"
            >
              Demo Player
            </button>
            <button
              onClick={() => handleQuickDemoLogin('admin')}
              className="btn-secondary text-xs py-2 border-purple-500/50 text-purple-300 hover:border-purple-500"
            >
              Demo Admin 🛡️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
