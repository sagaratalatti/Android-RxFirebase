import { useState, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import StartupForm, { emptyProfile, isProfileValid } from '../components/StartupForm';
import { LoopProgress, MarkdownOutput } from '../components/ui';
import { getModule } from '../lib/modules';
import { promptTemplates } from '../lib/prompts';
import { runLoopEngine } from '../lib/loop-engine';
import type { ModuleId } from '../types';

type Phase = 'form' | 'generating' | 'complete';

export default function GeneratorPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const mod = getModule(moduleId as ModuleId);
  const template = moduleId ? promptTemplates[moduleId as ModuleId] : null;

  const [profile, setProfile] = useState(emptyProfile);
  const [phase, setPhase] = useState<Phase>('form');
  const [currentLoop, setCurrentLoop] = useState(0);
  const [currentLoopName, setCurrentLoopName] = useState('');
  const [iterations, setIterations] = useState<
    { loopNumber: number; name: string; response: string }[]
  >([]);
  const [finalOutput, setFinalOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedLoops, setExpandedLoops] = useState<Set<number>>(new Set());

  if (!mod || !template) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGenerate = useCallback(async () => {
    if (!isProfileValid(profile)) return;

    setPhase('generating');
    setCurrentLoop(0);
    setIterations([]);
    setFinalOutput('');
    setError('');
    setExpandedLoops(new Set());

    try {
      const result = await runLoopEngine(template, profile, (loopNum, name) => {
        setCurrentLoop(loopNum);
        setCurrentLoopName(name);
      });

      setIterations(
        result.iterations.map((it) => ({
          loopNumber: it.loopNumber,
          name: it.name,
          response: it.response,
        }))
      );
      setFinalOutput(result.finalOutput);
      setPhase('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setPhase('form');
    }
  }, [profile, template]);

  const handleCopy = async () => {
    const fullOutput = iterations
      .map((it) => `# Loop ${it.loopNumber}: ${it.name}\n\n${it.response}`)
      .join('\n\n---\n\n');

    await navigator.clipboard.writeText(fullOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fullOutput = iterations
      .map((it) => `# Loop ${it.loopNumber}: ${it.name}\n\n${it.response}`)
      .join('\n\n---\n\n');

    const blob = new Blob([fullOutput], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.companyName || 'startup'}-${mod.id}-report.md`;
    a.click();
    URL.revokeObjectURL(url);
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
        to="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <div
          className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${mod.color} p-3`}
        >
          <span className="text-2xl">⚡</span>
        </div>
        <h1 className="mb-2 text-3xl font-bold">{mod.title}</h1>
        <p className="text-slate-400">{mod.description}</p>
        <p className="mt-2 text-sm text-slate-500">
          {mod.loopCount} iterative AI loops → {mod.outputLabel}
        </p>
      </div>

      {phase === 'form' && (
        <div className="glass-card p-6 sm:p-8">
          <h2 className="mb-6 text-xl font-semibold">Your Startup Profile</h2>
          <StartupForm profile={profile} onChange={setProfile} />
          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}
          <button
            className="btn-primary mt-8 w-full sm:w-auto"
            onClick={handleGenerate}
            disabled={!isProfileValid(profile)}
          >
            <Play className="h-5 w-5" />
            Start {mod.loopCount} AI Loops
          </button>
        </div>
      )}

      {phase === 'generating' && (
        <div className="glass-card p-8">
          <div className="mb-8 flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
            <h2 className="text-xl font-semibold">Running loop prompts...</h2>
          </div>
          <LoopProgress
            current={currentLoop}
            total={mod.loopCount}
            currentName={currentLoopName}
          />
          <p className="mt-6 text-sm text-slate-500">
            Each loop builds on the previous output for deeper analysis. Please wait...
          </p>

          {iterations.length > 0 && (
            <div className="mt-8 space-y-3">
              {iterations.map((it) => (
                <div
                  key={it.loopNumber}
                  className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-4 py-3"
                >
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-slate-300">
                    Loop {it.loopNumber}: {it.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {phase === 'complete' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary text-sm" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
            <button className="btn-secondary text-sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download .md
            </button>
            <button
              className="btn-primary text-sm"
              onClick={() => {
                setPhase('form');
                setIterations([]);
                setFinalOutput('');
              }}
            >
              <Play className="h-4 w-4" />
              Run Again
            </button>
          </div>

          <div className="glass-card p-6 sm:p-8">
            <h2 className="mb-6 text-xl font-semibold">{mod.outputLabel}</h2>
            <MarkdownOutput content={finalOutput} />
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-300">All Loops</h3>
            {iterations.map((it) => (
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
      )}
    </div>
  );
}
