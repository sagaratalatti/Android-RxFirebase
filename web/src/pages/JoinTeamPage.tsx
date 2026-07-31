import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, Loader2, Check, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { acceptInviteByToken } from '../lib/teams';

export default function JoinTeamPage() {
  const { token } = useParams<{ token: string }>();
  const { user, configured } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    if (!token || !user?.email) return;

    setStatus('loading');
    acceptInviteByToken(user.id, user.email, token).then((result) => {
      if (result.error) {
        setStatus('error');
        setMessage(result.error);
      } else {
        setStatus('success');
        setTeamName(result.team?.name ?? 'the team');
        setTimeout(() => navigate('/settings'), 2500);
      }
    });
  }, [token, user, navigate]);

  if (!configured) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center text-slate-400">
        Team invites require Supabase configuration.
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Users className="mx-auto mb-4 h-12 w-12 text-brand-400" />
        <h1 className="mb-2 text-2xl font-bold">Join Team</h1>
        <p className="mb-6 text-slate-400">Sign in to accept your team invitation.</p>
        <Link to={`/auth?redirect=/join/${token}`} className="btn-primary">
          <LogIn className="h-4 w-4" />
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-brand-400" />
          <p className="text-slate-400">Accepting invitation…</p>
        </>
      )}
      {status === 'success' && (
        <>
          <Check className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
          <h1 className="mb-2 text-2xl font-bold">Welcome to {teamName}!</h1>
          <p className="text-slate-400">Redirecting to settings…</p>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 className="mb-2 text-2xl font-bold">Could not join team</h1>
          <p className="mb-6 text-slate-400">{message}</p>
          <Link to="/settings" className="btn-secondary">Go to Settings</Link>
        </>
      )}
      {status === 'idle' && <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-500" />}
    </div>
  );
}
