import { Outlet, Link, useLocation } from 'react-router-dom';
import { Zap, LayoutDashboard, Settings, Menu, X, History } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Loop<span className="text-brand-400">Forge</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
              Dashboard
            </NavLink>
            <NavLink to="/history" icon={<History className="h-4 w-4" />}>
              History
            </NavLink>
            <NavLink to="/settings" icon={<Settings className="h-4 w-4" />}>
              Settings
            </NavLink>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isLanding && (
              <Link to="/dashboard" className="btn-primary text-sm">
                Get Started
              </Link>
            )}
          </div>

          <button
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-800 px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-2">
              <Link
                to="/dashboard"
                className="rounded-lg px-4 py-2.5 text-slate-300 hover:bg-slate-800"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/history"
                className="rounded-lg px-4 py-2.5 text-slate-300 hover:bg-slate-800"
                onClick={() => setMobileOpen(false)}
              >
                History
              </Link>
              <Link
                to="/settings"
                className="rounded-lg px-4 py-2.5 text-slate-300 hover:bg-slate-800"
                onClick={() => setMobileOpen(false)}
              >
                Settings
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 sm:px-6">
          <p>LoopForge — Customised loop-prompt AI for startups</p>
        </div>
      </footer>
    </div>
  );
}

function NavLink({
  to,
  icon,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
    >
      {icon}
      {children}
    </Link>
  );
}
