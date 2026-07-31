import { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  LogIn,
  Copy,
  Check,
  CloudUpload,
  CloudDownload,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserTeams,
  createTeam,
  joinTeamByCode,
  pushTeamData,
  pullTeamData,
  leaveTeam,
} from '../lib/teams';
import { exportAllData, applyBackupToLocalStorage } from '../lib/backup';
import { getUserSubscription, canUseTeams } from '../lib/billing';
import type { Team } from '../types';

export default function TeamPanel() {
  const { user, configured } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamPlan, setTeamPlan] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [message, setMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!user) return;
    const [userTeams, sub] = await Promise.all([
      getUserTeams(user.id),
      getUserSubscription(user.id),
    ]);
    setTeams(userTeams);
    setTeamPlan(canUseTeams(sub?.plan ?? 'free'));
  };

  useEffect(() => {
    refresh();
  }, [user]);

  if (!configured) return null;

  if (!user) {
    return (
      <div className="glass-card p-6 sm:p-8">
        <h2 className="mb-2 font-semibold">Team Workspaces</h2>
        <p className="mb-4 text-sm text-slate-400">Sign in to create or join a team.</p>
        <Link to="/auth" className="btn-primary text-sm">
          <LogIn className="h-4 w-4" />
          Sign In
        </Link>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!newTeamName.trim()) return;
    setLoading(true);
    const result = await createTeam(user.id, newTeamName.trim());
    setMessage(result.error ?? `Team "${result.team?.name}" created!`);
    setNewTeamName('');
    await refresh();
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setLoading(true);
    const result = await joinTeamByCode(user.id, inviteCode.trim());
    setMessage(result.error ?? `Joined team "${result.team?.name}"!`);
    setInviteCode('');
    await refresh();
    setLoading(false);
  };

  const handleTeamPush = async (teamId: string) => {
    setLoading(true);
    const result = await pushTeamData(teamId, exportAllData());
    setMessage(result.message);
    setLoading(false);
  };

  const handleTeamPull = async (teamId: string) => {
    setLoading(true);
    const result = await pullTeamData(teamId);
    if (result.data) {
      applyBackupToLocalStorage(result.data, { replace: false });
      setMessage('Team data merged. Refreshing…');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setMessage(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-5 w-5 text-violet-400" />
        <div>
          <h2 className="font-semibold">Team Workspaces</h2>
          <p className="text-sm text-slate-400">
            Collaborate and share data with your startup team.
          </p>
        </div>
      </div>

      {!teamPlan && (
        <div className="mb-6 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-200">
          Team features require a Team plan.{' '}
          <Link to="/pricing" className="underline hover:text-violet-100">
            View pricing
          </Link>
        </div>
      )}

      {teams.length > 0 && (
        <div className="mb-6 space-y-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="rounded-xl border border-slate-700 bg-slate-900/30 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{team.name}</p>
                  <p className="text-xs text-slate-500">
                    Invite code:{' '}
                    <span className="font-mono text-brand-300">{team.invite_code}</span>
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-500 hover:text-brand-300"
                  onClick={async () => {
                    await navigator.clipboard.writeText(team.invite_code);
                    setCopiedCode(team.id);
                    setTimeout(() => setCopiedCode(null), 2000);
                  }}
                  title="Copy invite code"
                >
                  {copiedCode === team.id ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              {teamPlan && (
                <div className="flex flex-wrap gap-2">
                  <button
                    className="btn-secondary text-xs"
                    onClick={() => handleTeamPush(team.id)}
                    disabled={loading}
                  >
                    <CloudUpload className="h-3.5 w-3.5" />
                    Push to Team
                  </button>
                  <button
                    className="btn-secondary text-xs"
                    onClick={() => handleTeamPull(team.id)}
                    disabled={loading}
                  >
                    <CloudDownload className="h-3.5 w-3.5" />
                    Pull from Team
                  </button>
                  {team.owner_id !== user.id && (
                    <button
                      className="btn-secondary text-xs"
                      onClick={async () => {
                        await leaveTeam(user.id, team.id);
                        await refresh();
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Leave
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-700 p-4">
          <h3 className="mb-3 text-sm font-medium">Create Team</h3>
          <input
            className="input-field mb-3 text-sm"
            placeholder="Team name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            disabled={!teamPlan}
          />
          <button
            className="btn-primary w-full text-sm"
            onClick={handleCreate}
            disabled={!teamPlan || loading || !newTeamName.trim()}
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
        </div>
        <div className="rounded-xl border border-slate-700 p-4">
          <h3 className="mb-3 text-sm font-medium">Join Team</h3>
          <input
            className="input-field mb-3 font-mono text-sm uppercase"
            placeholder="INVITE CODE"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
          <button
            className="btn-secondary w-full text-sm"
            onClick={handleJoin}
            disabled={loading || !inviteCode.trim()}
          >
            <LogIn className="h-4 w-4" />
            Join
          </button>
        </div>
      </div>

      {message && <p className="mt-4 text-sm text-slate-400">{message}</p>}
    </div>
  );
}
