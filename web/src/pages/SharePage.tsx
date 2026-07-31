import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Zap, ArrowLeft, Loader2 } from 'lucide-react';
import { getSharedReport, type SharedReportRecord } from '../lib/cloud-sync';
import { MarkdownOutput } from '../components/ui';

export default function SharePage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<SharedReportRecord | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getSharedReport(id).then((result) => {
      if (result.success && result.report) {
        setReport(result.report);
      } else {
        setError(result.message);
      }
      setLoading(false);
    });
  }, [id]);

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-slate-800 px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-200">
            <Zap className="h-5 w-5 text-brand-400" />
            <span className="font-semibold text-white">LoopForge</span>
          </Link>
          <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
            Create your own →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {loading && (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            Loading report…
          </div>
        )}

        {error && !loading && (
          <div className="py-20 text-center">
            <h1 className="mb-2 text-2xl font-bold">Report not found</h1>
            <p className="mb-6 text-slate-400">{error}</p>
            <Link to="/" className="btn-primary">
              <ArrowLeft className="h-4 w-4" />
              Go Home
            </Link>
          </div>
        )}

        {report && !loading && (
          <>
            <div className="mb-8">
              <span className="mb-2 inline-block rounded-lg bg-brand-600/20 px-3 py-1 text-sm text-brand-300">
                {report.module_title || report.module_id}
              </span>
              <h1 className="mb-1 text-3xl font-bold">{report.company_name}</h1>
              <p className="text-slate-400">
                Shared report · {new Date(report.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="glass-card mb-6 p-6 sm:p-8">
              <h2 className="mb-6 text-xl font-semibold">Summary</h2>
              <MarkdownOutput content={report.content.finalOutput} />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-300">All Loops</h3>
              {report.content.iterations.map((it) => (
                <div key={it.loopNumber} className="glass-card p-5">
                  <h4 className="mb-4 font-medium">
                    Loop {it.loopNumber}: {it.name}
                  </h4>
                  <MarkdownOutput content={it.response} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
