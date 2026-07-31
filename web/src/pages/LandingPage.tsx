import { Link } from 'react-router-dom';
import { ArrowRight, Zap, RefreshCw, Shield, Smartphone } from 'lucide-react';
import { ModuleCard, HeroFeatures } from '../components/ui';
import { modules } from '../lib/modules';

export default function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/20 blur-[120px]" />
          <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-600/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300">
            <Zap className="h-4 w-4" />
            Customised loop-prompt AI for startups
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Turn your startup idea into{' '}
            <span className="text-gradient">actionable strategy</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
            LoopForge uses iterative AI loops to generate business analysis, audits,
            GTM strategies, and social media content — each loop building on the last
            for deeper, more accurate results.
          </p>

          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/dashboard" className="btn-primary text-base">
              Start Building
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#modules" className="btn-secondary text-base">
              Explore Modules
            </a>
          </div>

          <HeroFeatures />
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/30 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-bold sm:text-3xl">
            How loop prompts work
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Step
              number={1}
              title="Define your startup"
              description="Enter your company profile — industry, stage, market, and goals."
            />
            <Step
              number={2}
              title="AI loops refine"
              description="Each loop builds on the previous output, going deeper with specialised prompts."
            />
            <Step
              number={3}
              title="Get actionable output"
              description="Receive executive-ready reports, strategies, and content you can use immediately."
            />
          </div>
        </div>
      </section>

      <section id="modules" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Four powerful modules</h2>
            <p className="text-slate-400">
              Each module uses customised multi-loop prompts tailored for startup needs.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {modules.map((mod) => (
              <ModuleCard
                key={mod.id}
                title={mod.title}
                description={mod.description}
                icon={mod.icon as 'BarChart3' | 'ClipboardCheck' | 'Rocket' | 'Share2'}
                color={mod.color}
                loopCount={mod.loopCount}
                to={`/generate/${mod.id}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-900/30 px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          <Benefit
            icon={<RefreshCw className="h-6 w-6 text-brand-400" />}
            title="Iterative intelligence"
            description="Unlike single-shot prompts, each loop refines and deepens the analysis."
          />
          <Benefit
            icon={<Shield className="h-6 w-6 text-cyan-400" />}
            title="Your data stays local"
            description="API keys are stored in your browser. No server-side data collection."
          />
          <Benefit
            icon={<Smartphone className="h-6 w-6 text-violet-400" />}
            title="Works offline"
            description="Install as a PWA and access demo mode even without connectivity."
          />
        </div>
      </section>

      <section className="px-4 py-20 text-center sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold">Ready to forge your strategy?</h2>
          <p className="mb-8 text-slate-400">
            Join startups using loop-prompt AI to move faster from idea to execution.
          </p>
          <Link to="/dashboard" className="btn-primary text-base">
            Open Dashboard
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600/20 text-lg font-bold text-brand-400">
        {number}
      </div>
      <h3 className="mb-2 font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}

function Benefit({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}
