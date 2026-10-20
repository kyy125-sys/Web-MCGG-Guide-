import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Heroes } from './pages/Heroes';
import { Commanders } from './pages/Commanders';
import { Synergies } from './pages/Synergies';
import { LineupBuilder } from './pages/LineupBuilder';
import { Recommendations } from './pages/Recommendations';
import { TierList } from './pages/TierList';
import { Patches } from './pages/Patches';
import { SavedLineups } from './pages/SavedLineups';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { useAuthStore } from './store/authStore';

function ProtectedAdminRoute({ children }: { children: JSX.Element }) {
  const { isAdmin } = useAuthStore();
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="heroes" element={<Heroes />} />
        <Route path="commanders" element={<Commanders />} />
        <Route path="synergies" element={<Synergies />} />
        <Route path="lineup-builder" element={<LineupBuilder />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="tier-list" element={<TierList />} />
        <Route path="patches" element={<Patches />} />
        <Route path="saved-lineups" element={<SavedLineups />} />
        <Route
          path="admin"
          element={
            <ProtectedAdminRoute>
              <Admin />
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
