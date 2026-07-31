import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  FileDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getHistoryItem } from '../lib/history';
import { getModule } from '../lib/modules';
import { getBranding } from '../lib/branding';
import { MarkdownOutput } from '../components/ui';
import { exportToPdf, buildReportSections } from '../lib/export';
import ShareReportButton from '../components/ShareReportButton';
import type { ModuleId } from '../types';

export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const item = id ? getHistoryItem(id) : undefined;
  const [copied, setCopied] = useState(false);
  const [expandedLoops, setExpandedLoops] = useState<Set<number>>(new Set());
  const [exportingPdf, setExportingPdf] = useState(false);

  if (!item) {
    return <Navigate to="/history" replace />;
  }

  const mod = getModule(item.moduleId as ModuleId);

  const fullMarkdown = item.iterations
    .map((it) => `# Loop ${it.loopNumber}: ${it.name}\n\n${it.response}`)
    .join('\n\n---\n\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([fullMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.companyName}-${item.moduleId}-report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    setExportingPdf(true);
    try {
      const branding = getBranding();
      await exportToPdf(
        `${item.moduleTitle} — ${item.companyName}`,
        `Generated ${new Date(item.createdAt).toLocaleDateString()}`,
        buildReportSections(
          item.iterations,
          item.finalOutput,
          mod?.outputLabel ?? 'Final Output'
        ),
        `${item.companyName}-${item.moduleId}-report.pdf`,
        {
          appName: branding.appName,
          tagline: branding.tagline,
        }
      );
    } finally {
      setExportingPdf(false);
    }
  };

  const toggleLoop = (num: number) => {
    setExpandedLoops((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        to="/history"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to History
      </Link>

      <div className="mb-8">
        <span
          className={`mb-3 inline-flex rounded-lg bg-gradient-to-br ${mod?.color ?? 'from-slate-500 to-slate-600'} px-3 py-1 text-sm font-medium text-white`}
        >
          {item.moduleTitle}
        </span>
        <h1 className="mb-1 text-3xl font-bold">{item.companyName}</h1>
        <p className="text-slate-400">
          {item.iterations.length} loops ·{' '}
          {new Date(item.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <button className="btn-secondary text-sm" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy All'}
        </button>
        <button className="btn-secondary text-sm" onClick={handleDownloadMd}>
          <Download className="h-4 w-4" />
          Download .md
        </button>
        <button
          className="btn-secondary text-sm"
          onClick={handleDownloadPdf}
          disabled={exportingPdf}
        >
          <FileDown className="h-4 w-4" />
          {exportingPdf ? 'Generating PDF…' : 'Download PDF'}
        </button>
        <ShareReportButton
          moduleId={item.moduleId}
          moduleTitle={item.moduleTitle}
          companyName={item.companyName}
          iterations={item.iterations}
          finalOutput={item.finalOutput}
        />
        <Link
          to={`/generate/${item.moduleId}`}
          className="btn-primary text-sm"
        >
          Run Again
        </Link>
      </div>

      <div className="glass-card mb-6 p-6 sm:p-8">
        <h2 className="mb-6 text-xl font-semibold">
          {mod?.outputLabel ?? 'Final Output'}
        </h2>
        <MarkdownOutput content={item.finalOutput} />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-300">All Loops</h3>
        {item.iterations.map((it) => (
          <div key={it.loopNumber} className="glass-card overflow-hidden">
            <button
              className="flex w-full items-center justify-between p-5 text-left"
              onClick={() => toggleLoop(it.loopNumber)}
            >
              <span className="font-medium">
                Loop {it.loopNumber}: {it.name}
              </span>
              {expandedLoops.has(it.loopNumber) ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </button>
            {expandedLoops.has(it.loopNumber) && (
              <div className="border-t border-slate-700 px-5 pb-5 pt-4">
                <MarkdownOutput content={it.response} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
