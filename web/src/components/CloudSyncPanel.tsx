import { useState } from 'react';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  Check,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { exportAllData, applyBackupToLocalStorage } from '../lib/backup';
import { pullFromCloud, pushToCloud } from '../lib/cloud-sync';
import { isAutoSyncEnabled, setAutoSyncEnabled } from '../lib/sync-preferences';
import { usePlan } from '../contexts/PlanContext';
import { shouldEnforcePlanLimits } from '../lib/plan-limits';
import UpgradeBanner from './UpgradeBanner';

export default function CloudSyncPanel() {
  const { user, configured } = useAuth();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [syncing, setSyncing] = useState<'push' | 'pull' | null>(null);
  const [autoSync, setAutoSync] = useState(isAutoSyncEnabled());
  const { limits } = usePlan();

  if (!configured) {
    return (
      <div className="glass-card p-6 sm:p-8">
        <h2 className="mb-2 font-semibold">Cloud Sync</h2>
        <p className="text-sm text-slate-400">
          Optional — set <code className="text-brand-300">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-brand-300">VITE_SUPABASE_ANON_KEY</code> to enable accounts
          and cloud sync. See <code className="text-slate-500">supabase/schema.sql</code>.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Cloud className="mt-1 h-5 w-5 shrink-0 text-brand-400" />
          <div>
            <h2 className="mb-1 font-semibold">Cloud Sync</h2>
            <p className="mb-4 text-sm text-slate-400">
              Sign in to sync workspaces, history, and settings across devices.
            </p>
            <Link to="/auth" className="btn-primary text-sm">
              <LogIn className="h-4 w-4" />
              Sign In / Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handlePush = async () => {
    setSyncing('push');
    setMessage(null);
    const result = await pushToCloud(user.id, exportAllData());
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    setSyncing(null);
  };

  const handlePull = async () => {
    setSyncing('pull');
    setMessage(null);
    const result = await pullFromCloud(user.id);
    if (result.success && result.data) {
      const replace = window.confirm(
        'Replace local data with cloud data? Cancel to merge instead.'
      );
      applyBackupToLocalStorage(result.data, { replace });
      setMessage({
        type: 'success',
        text: replace ? 'Cloud data replaced local data.' : 'Cloud data merged with local data.',
      });
      setTimeout(() => window.location.reload(), 1200);
    } else {
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message,
      });
    }
    setSyncing(null);
  };

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Cloud className="h-5 w-5 text-brand-400" />
        <div>
          <h2 className="font-semibold">Cloud Sync</h2>
          <p className="text-sm text-slate-400">
            Signed in as <span className="text-slate-300">{user.email}</span>
          </p>
        </div>
      </div>

      {shouldEnforcePlanLimits() && !limits.cloudSync && (
        <div className="mb-4">
          <UpgradeBanner feature="Cloud sync" />
        </div>
      )}

      <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/30 px-4 py-3">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-brand-600"
          checked={autoSync}
          onChange={(e) => {
            setAutoSync(e.target.checked);
            setAutoSyncEnabled(e.target.checked);
          }}
        />
        <div>
          <p className="text-sm font-medium text-slate-200">Auto-sync on sign in</p>
          <p className="text-xs text-slate-500">
            Merge cloud data and upload local changes when you sign in.
          </p>
        </div>
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          className="btn-primary text-sm"
          onClick={handlePush}
          disabled={syncing !== null || (shouldEnforcePlanLimits() && !limits.cloudSync)}
        >
          <CloudUpload className="h-4 w-4" />
          {syncing === 'push' ? 'Uploading…' : 'Upload to Cloud'}
        </button>
        <button
          className="btn-secondary text-sm"
          onClick={handlePull}
          disabled={syncing !== null || (shouldEnforcePlanLimits() && !limits.cloudSync)}
        >
          <CloudDownload className="h-4 w-4" />
          {syncing === 'pull' ? 'Downloading…' : 'Download from Cloud'}
        </button>
      </div>

      {message && (
        <div
          className={`mt-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300'
              : 'bg-red-500/10 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          {message.text}
        </div>
      )}
    </div>
  );
}
