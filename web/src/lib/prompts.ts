import type { LoopPromptTemplate, ModuleId } from '../types';

const baseContext = (profile: {
  companyName: string;
  industry: string;
  stage: string;
  targetMarket: string;
  valueProposition: string;
  competitors: string;
  goals: string;
}) => `
Company: ${profile.companyName}
Industry: ${profile.industry}
Stage: ${profile.stage}
Target Market: ${profile.targetMarket}
Value Proposition: ${profile.valueProposition}
Competitors: ${profile.competitors}
Goals: ${profile.goals}
`.trim();

export const businessAnalysisTemplate: LoopPromptTemplate = {
  moduleId: 'business-analysis',
  loops: [
    {
      name: 'Market Landscape',
      systemContext: 'You are a senior business analyst specialising in startup market research.',
      buildPrompt: (profile) =>
        `Analyse the market landscape for this startup:\n\n${baseContext(profile)}\n\nProvide: market size estimate, key trends, customer segments, and opportunity gaps. Be specific and actionable.`,
    },
    {
      name: 'Competitive Positioning',
      systemContext: 'You are a competitive intelligence expert for early-stage companies.',
      buildPrompt: (profile, prev) =>
        `Based on this market analysis:\n${prev[0]}\n\nFor ${profile.companyName}, map competitive positioning:\n\n${baseContext(profile)}\n\nInclude: competitor matrix, differentiation opportunities, and positioning statement.`,
    },
    {
      name: 'SWOT & Strategic Insights',
      systemContext: 'You are a strategy consultant delivering executive-ready analysis.',
      buildPrompt: (profile, prev) =>
        `Synthesise prior analysis:\n\nMarket: ${prev[0]}\n\nCompetitive: ${prev[1]}\n\nFor ${profile.companyName}, deliver:\n1. SWOT analysis\n2. Key risks and mitigations\n3. Top 5 strategic priorities\n4. 90-day action plan`,
    },
  ],
};

export const auditTemplate: LoopPromptTemplate = {
  moduleId: 'audit',
  loops: [
    {
      name: 'Operational Health Check',
      systemContext: 'You are a startup operations auditor with expertise in lean methodology.',
      buildPrompt: (profile) =>
        `Conduct an operational health audit for:\n\n${baseContext(profile)}\n\nAssess: product readiness, team structure, processes, and resource allocation. Rate each area and flag critical gaps.`,
    },
    {
      name: 'Financial & Unit Economics',
      systemContext: 'You are a startup CFO advisor focused on sustainable growth.',
      buildPrompt: (profile, prev) =>
        `Operations audit:\n${prev[0]}\n\nFor ${profile.companyName} (${profile.stage} stage), analyse:\n1. Revenue model viability\n2. Unit economics framework\n3. Burn rate considerations\n4. Funding readiness\n5. Key financial metrics to track`,
    },
    {
      name: 'Compliance & Risk Audit',
      systemContext: 'You are a startup legal and compliance advisor.',
      buildPrompt: (profile, prev) =>
        `Prior audit findings:\n\nOps: ${prev[0]}\n\nFinance: ${prev[1]}\n\nFor ${profile.companyName} in ${profile.industry}, audit:\n1. Regulatory considerations\n2. IP and data protection\n3. Contract and vendor risks\n4. Governance gaps\n5. Prioritised remediation checklist`,
    },
    {
      name: 'Executive Audit Summary',
      systemContext: 'You are preparing a board-ready audit report.',
      buildPrompt: (profile, prev) =>
        `Compile executive audit report from:\n\n${prev.join('\n---\n')}\n\nFor ${profile.companyName}, deliver:\n- Overall health score (1-10)\n- Critical findings\n- Quick wins\n- 30/60/90 day remediation roadmap`,
    },
  ],
};

export const gtmTemplate: LoopPromptTemplate = {
  moduleId: 'gtm',
  loops: [
    {
      name: 'ICP & Messaging',
      systemContext: 'You are a GTM strategist specialising in B2B and B2C startup launches.',
      buildPrompt: (profile) =>
        `Define go-to-market foundation for:\n\n${baseContext(profile)}\n\nDeliver:\n1. Ideal Customer Profile (ICP)\n2. Buyer personas (2-3)\n3. Core messaging framework\n4. Value proposition canvas`,
    },
    {
      name: 'Channel Strategy',
      systemContext: 'You are a growth marketing expert for early-stage startups.',
      buildPrompt: (profile, prev) =>
        `ICP & Messaging:\n${prev[0]}\n\nFor ${profile.companyName}, design channel strategy:\n1. Primary acquisition channels (ranked)\n2. Channel-specific tactics\n3. Budget allocation framework\n4. CAC/LTV benchmarks for ${profile.industry}`,
    },
    {
      name: 'Launch Plan',
      systemContext: 'You are a product launch manager for high-growth startups.',
      buildPrompt: (profile, prev) =>
        `GTM foundation:\n\nICP: ${prev[0]}\n\nChannels: ${prev[1]}\n\nCreate a 90-day GTM launch plan for ${profile.companyName}:\n1. Pre-launch checklist\n2. Launch week playbook\n3. Post-launch optimisation\n4. KPIs and success metrics\n5. Milestone timeline`,
    },
  ],
};

export const socialMediaTemplate: LoopPromptTemplate = {
  moduleId: 'social-media',
  loops: [
    {
      name: 'Brand Voice & Pillars',
      systemContext: 'You are a social media strategist for startup brands.',
      buildPrompt: (profile) =>
        `Define social media brand strategy for:\n\n${baseContext(profile)}\n\nDeliver:\n1. Brand voice guidelines\n2. Content pillars (4-5)\n3. Platform recommendations\n4. Posting cadence`,
    },
    {
      name: 'Content Calendar',
      systemContext: 'You are a content strategist creating high-engagement social calendars.',
      buildPrompt: (profile, prev) =>
        `Brand strategy:\n${prev[0]}\n\nCreate a 2-week content calendar for ${profile.companyName}:\n- Daily post ideas across recommended platforms\n- Content format mix (video, carousel, text, etc.)\n- Hashtag strategy\n- Engagement hooks`,
    },
    {
      name: 'Ready-to-Post Content',
      systemContext: 'You are a copywriter creating viral-ready startup content.',
      buildPrompt: (profile, prev) =>
        `Strategy: ${prev[0]}\n\nCalendar: ${prev[1]}\n\nWrite 10 ready-to-post pieces for ${profile.companyName}:\n- 3 LinkedIn posts\n- 3 Twitter/X threads\n- 2 Instagram captions\n- 2 TikTok/Reels scripts\n\nInclude hooks, CTAs, and suggested visuals.`,
    },
  ],
};

export const promptTemplates: Record<ModuleId, LoopPromptTemplate> = {
  'business-analysis': businessAnalysisTemplate,
  audit: auditTemplate,
  gtm: gtmTemplate,
  'social-media': socialMediaTemplate,
};
