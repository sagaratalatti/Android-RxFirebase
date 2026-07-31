import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export default function AuthButton() {
  const { user, loading, configured, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (!configured) return null;

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-slate-500" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-[100px] truncate text-sm text-slate-400 sm:inline">
          {user.email?.split('@')[0]}
        </span>
        <button
          className="btn-secondary text-sm !px-3 !py-2"
          onClick={async () => {
            setSigningOut(true);
            await signOut();
            setSigningOut(false);
          }}
          disabled={signingOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <Link to="/auth" className="btn-secondary text-sm !px-3 !py-2">
      <LogIn className="h-4 w-4" />
      <span className="hidden sm:inline">Sign In</span>
    </Link>
  );
}
