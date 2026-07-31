import {
  BarChart3,
  ClipboardCheck,
  Rocket,
  Share2,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Layers,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const iconMap = {
  BarChart3,
  ClipboardCheck,
  Rocket,
  Share2,
};

interface ModuleCardProps {
  title: string;
  description: string;
  icon: keyof typeof iconMap;
  color: string;
  loopCount: number;
  to: string;
}

export function ModuleCard({
  title,
  description,
  icon,
  color,
  loopCount,
  to,
}: ModuleCardProps) {
  const Icon = iconMap[icon];

  return (
    <Link to={to} className="group glass-card block p-6 transition-all hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-500/5">
      <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${color} p-3`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-brand-300 transition-colors">
        {title}
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-slate-400">{description}</p>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <RefreshCw className="h-3.5 w-3.5" />
          {loopCount} AI loops
        </span>
        <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-brand-400" />
      </div>
    </Link>
  );
}

export function LoopProgress({
  current,
  total,
  currentName,
}: {
  current: number;
  total: number;
  currentName?: string;
}) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">
          Loop {current} of {total}
          {currentName && (
            <span className="ml-2 text-brand-400">— {currentName}</span>
          )}
        </span>
        <span className="font-medium text-slate-300">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function FeaturePill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-300">
      {icon}
      {children}
    </div>
  );
}

export function HeroFeatures() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <FeaturePill icon={<Layers className="h-4 w-4 text-brand-400" />}>
        Iterative loop prompts
      </FeaturePill>
      <FeaturePill icon={<Target className="h-4 w-4 text-cyan-400" />}>
        Startup-focused
      </FeaturePill>
      <FeaturePill icon={<TrendingUp className="h-4 w-4 text-violet-400" />}>
        Actionable outputs
      </FeaturePill>
      <FeaturePill icon={<Sparkles className="h-4 w-4 text-pink-400" />}>
        AI-powered
      </FeaturePill>
    </div>
  );
}

export function MarkdownOutput({ content }: { content: string }) {
  const html = simpleMarkdownToHtml(content);

  return (
    <div
      className="prose-output"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function simpleMarkdownToHtml(md: string): string {
  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^---$/gm, '<hr />')
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split('|').filter(Boolean).map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) return '';
      const tag = cells.some((c) => c.includes('---')) ? 'th' : 'td';
      if (tag === 'th') {
        return `<tr>${cells.map((c) => `<th>${c}</th>`).join('')}</tr>`;
      }
      return `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;
    })
    .replace(/(<tr>.*<\/tr>\n?)+/g, (match) => `<table>${match}</table>`)
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hultb])/gm, (line) => (line.trim() ? `<p>${line}</p>` : ''))
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[23]>)/g, '$1')
    .replace(/(<\/h[23]>)<\/p>/g, '$1')
    .replace(/<p>(<table>)/g, '$1')
    .replace(/(<\/table>)<\/p>/g, '$1')
    .replace(/<p>(<ul>)/g, '$1')
    .replace(/(<\/ul>)<\/p>/g, '$1')
    .replace(/<p>(<blockquote>)/g, '$1')
    .replace(/(<\/blockquote>)<\/p>/g, '$1')
    .replace(/<p>(<hr \/>)<\/p>/g, '$1');
}
