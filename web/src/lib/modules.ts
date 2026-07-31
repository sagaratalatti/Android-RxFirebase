import type { ModuleConfig, ModuleId } from '../types';

export const modules: ModuleConfig[] = [
  {
    id: 'business-analysis',
    title: 'Business Analysis',
    description:
      'Deep market research, competitive positioning, and strategic insights through iterative AI loops.',
    icon: 'BarChart3',
    color: 'from-blue-500 to-cyan-500',
    loopCount: 3,
    outputLabel: 'Strategic Analysis Report',
  },
  {
    id: 'audit',
    title: 'Business Audit',
    description:
      'Comprehensive operational, financial, and compliance audit with executive summary.',
    icon: 'ClipboardCheck',
    color: 'from-violet-500 to-purple-500',
    loopCount: 4,
    outputLabel: 'Executive Audit Report',
  },
  {
    id: 'gtm',
    title: 'GTM Strategy',
    description:
      'Go-to-market playbook with ICP definition, channel strategy, and 90-day launch plan.',
    icon: 'Rocket',
    color: 'from-orange-500 to-red-500',
    loopCount: 3,
    outputLabel: 'GTM Playbook',
  },
  {
    id: 'social-media',
    title: 'Social Media',
    description:
      'Brand voice, content calendar, and ready-to-post content across all platforms.',
    icon: 'Share2',
    color: 'from-pink-500 to-rose-500',
    loopCount: 3,
    outputLabel: 'Content Package',
  },
];

export function getModule(id: ModuleId): ModuleConfig | undefined {
  return modules.find((m) => m.id === id);
}

export const stageLabels: Record<string, string> = {
  idea: 'Idea Stage',
  mvp: 'MVP',
  'early-revenue': 'Early Revenue',
  growth: 'Growth',
  scale: 'Scale',
};
