import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  CreditCard,
  Cloud,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AdminStats {
  users: number;
  subscriptions: { free: number; pro: number; team: number };
  sharedReports: number;
  teams: number;
}

const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)
  ?.split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean) ?? [];

export default function AdminPage() {
  const { user, configured } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.email && adminEmails.includes(user.email.toLowerCase());

  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    const response = await fetch('/api/admin-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, userId: user.id }),
    });
    const data = (await response.json()) as AdminStats & { error?: string };
    if (!response.ok) {
      setError(data.error ?? 'Failed to load stats');
    } else {
      setStats(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchStats();
  }, [isAdmin, user]);

  if (!configured) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-slate-400">
        Admin dashboard requires Supabase configuration.
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Shield className="mx-auto mb-4 h-12 w-12 text-slate-600" />
        <h1 className="mb-4 text-2xl font-bold">Admin Access</h1>
        <Link to="/auth" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Shield className="mx-auto mb-4 h-12 w-12 text-red-400/50" />
        <h1 className="mb-2 text-2xl font-bold">Access Denied</h1>
        <p className="text-slate-400">Your account is not in the admin list.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-400">Platform overview and usage metrics</p>
        </div>
        <button className="btn-secondary text-sm" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Users className="h-5 w-5" />} label="Synced Users" value={stats.users} />
          <StatCard icon={<Cloud className="h-5 w-5" />} label="Teams" value={stats.teams} />
          <StatCard
            icon={<FileText className="h-5 w-5" />}
            label="Shared Reports"
            value={stats.sharedReports}
          />
          <StatCard
            icon={<CreditCard className="h-5 w-5" />}
            label="Paid Subscribers"
            value={stats.subscriptions.pro + stats.subscriptions.team}
          />
        </div>
      )}

      {stats && (
        <div className="mt-8 glass-card p-6">
          <h2 className="mb-4 font-semibold">Subscriptions by Plan</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <PlanStat label="Free" count={stats.subscriptions.free} color="text-slate-400" />
            <PlanStat label="Pro" count={stats.subscriptions.pro} color="text-brand-400" />
            <PlanStat label="Team" count={stats.subscriptions.team} color="text-violet-400" />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="glass-card p-5">
      <div className="mb-3 text-brand-400">{icon}</div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

function PlanStat({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/30 p-4 text-center">
      <p className={`text-3xl font-bold ${color}`}>{count}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
