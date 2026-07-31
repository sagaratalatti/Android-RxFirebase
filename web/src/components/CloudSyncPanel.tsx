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

export default function CloudSyncPanel() {
  const { user, configured } = useAuth();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [syncing, setSyncing] = useState<'push' | 'pull' | null>(null);

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

      <div className="flex flex-wrap gap-3">
        <button
          className="btn-primary text-sm"
          onClick={handlePush}
          disabled={syncing !== null}
        >
          <CloudUpload className="h-4 w-4" />
          {syncing === 'push' ? 'Uploading…' : 'Upload to Cloud'}
        </button>
        <button
          className="btn-secondary text-sm"
          onClick={handlePull}
          disabled={syncing !== null}
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
