import { useEffect, useState } from 'react';
import { patchApi } from '../api/patches';
import { useAuthStore } from '../store/authStore';
import type { Patch } from '../types';
import { GitBranch, Calendar, CheckCircle, Plus, ExternalLink, X } from 'lucide-react';
import toast from 'react-hot-toast';

export function Patches() {
  const { isAdmin } = useAuthStore();
  const [patches, setPatches] = useState<Patch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [version, setVersion] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [sources, setSources] = useState('');
  const [isActive, setIsActive] = useState(false);

  const fetchPatches = () => {
    setLoading(true);
    patchApi
      .getAll()
      .then((res) => {
        setPatches(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.warn('Error fetching patches:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPatches();
  }, []);

  const handleCreatePatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patchApi.create({
        version,
        releaseDate: releaseDate || new Date().toISOString().split('T')[0],
        notes,
        sources: sources.split(',').map((s) => s.trim()).filter(Boolean),
        isActive,
      });
      toast.success('Patch created successfully!');
      setShowModal(false);
      setVersion('');
      setNotes('');
      setSources('');
      fetchPatches();
    } catch (e) {
      toast.error('Failed to create patch');
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await patchApi.update(id, { isActive: true });
      toast.success('Active patch updated');
      fetchPatches();
    } catch (e) {
      toast.error('Failed to update active patch');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <GitBranch className="text-mcgg-gold" /> Patch History
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Magic Chess GoGo balance patches, adjustments, hero stat reworks, and meta shifts.
          </p>
        </div>

        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} /> New Patch
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading patches...</div>
      ) : (
        <div className="space-y-4">
          {patches.map((patch) => (
            <div
              key={patch.id}
              className={`card transition-colors ${
                patch.isActive ? 'border-green-600 bg-gradient-to-r from-green-950/20 to-mcgg-card' : ''
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-mcgg-border pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-mcgg-gold">Patch {patch.version}</span>
                  {patch.isActive ? (
                    <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                      <CheckCircle size={12} /> Active Current Version
                    </span>
                  ) : (
                    isAdmin && (
                      <button
                        onClick={() => handleSetActive(patch.id)}
                        className="text-xs text-gray-400 hover:text-mcgg-gold underline"
                      >
                        Set as active
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar size={14} />
                  <span>{new Date(patch.releaseDate).toLocaleDateString()}</span>
                </div>
              </div>

              {patch.notes && (
                <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed mb-4 bg-gray-950/60 p-4 rounded-xl border border-mcgg-border">
                  {patch.notes}
                </div>
              )}

              {patch.sources && patch.sources.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Data Sources:</span>
                  <div className="flex flex-wrap gap-2">
                    {patch.sources.map((src, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-blue-400 hover:underline">
                        <ExternalLink size={10} /> {src}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {patches.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No patch versions registered yet.
            </div>
          )}
        </div>
      )}

      {/* New Patch Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="card max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-100">Create New Patch Version</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePatch} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Patch Version</label>
                <input
                  className="input"
                  placeholder="e.g. 1.8.56"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Release Date</label>
                <input
                  type="date"
                  className="input"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Patch Notes</label>
                <textarea
                  className="input min-h-[120px]"
                  placeholder="Buffs, nerfs, new synergies, adjustments..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Sources (comma-separated URLs or names)
                </label>
                <input
                  className="input"
                  placeholder="Official Moonton, Patch Note v1.8"
                  value={sources}
                  onChange={(e) => setSources(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-mcgg-gold focus:ring-mcgg-gold bg-mcgg-dark border-mcgg-border"
                />
                <label htmlFor="isActiveCheck" className="text-sm text-gray-300">
                  Set as current active patch
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm">
                  Create Patch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
