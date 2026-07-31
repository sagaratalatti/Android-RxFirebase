import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Trash2,
  ExternalLink,
  FileText,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { getHistory, deleteHistoryItem, clearHistory, formatHistoryDate } from '../lib/history';
import type { SavedGeneration } from '../types';
import { getModule } from '../lib/modules';

export default function HistoryPage() {
  const [items, setItems] = useState<SavedGeneration[]>([]);

  const refresh = () => setItems(getHistory());

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    refresh();
  };

  const handleClearAll = () => {
    if (window.confirm('Delete all saved generations? This cannot be undone.')) {
      clearHistory();
      refresh();
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">History</h1>
          <p className="text-slate-400">
            Your saved AI generations, stored locally in this browser.
          </p>
        </div>
        {items.length > 0 && (
          <button className="btn-secondary text-sm" onClick={handleClearAll}>
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="glass-card flex flex-col items-center px-6 py-16 text-center">
          <History className="mb-4 h-12 w-12 text-slate-600" />
          <h2 className="mb-2 text-lg font-semibold">No generations yet</h2>
          <p className="mb-6 max-w-sm text-sm text-slate-400">
            Complete a module generation and it will appear here automatically.
          </p>
          <Link to="/dashboard" className="btn-primary text-sm">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const mod = getModule(item.moduleId);
            return (
              <div
                key={item.id}
                className="glass-card flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-lg bg-gradient-to-br ${mod?.color ?? 'from-slate-500 to-slate-600'} px-2 py-0.5 text-xs font-medium text-white`}
                    >
                      {item.moduleTitle}
                    </span>
                    {item.usedLiveAI ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <Sparkles className="h-3 w-3" />
                        Live AI
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <AlertCircle className="h-3 w-3" />
                        Demo
                      </span>
                    )}
                  </div>
                  <h3 className="truncate font-semibold text-white">{item.companyName}</h3>
                  <p className="text-sm text-slate-500">
                    {item.iterations.length} loops · {formatHistoryDate(item.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/history/${item.id}`}
                    className="btn-secondary text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View
                  </Link>
                  <button
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-red-400"
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-sm text-slate-400">
        <FileText className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          History is stored in your browser only. Clearing site data or switching devices
          will remove saved generations.
        </p>
      </div>
    </div>
  );
}
