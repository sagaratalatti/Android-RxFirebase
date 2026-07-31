import type { ModuleId } from '../types';
import type { SerializableLoopConfig } from '../types';

export const defaultPromptConfigs: Record<ModuleId, SerializableLoopConfig[]> = {
  'business-analysis': [
    {
      name: 'Market Landscape',
      systemContext:
        'You are a senior business analyst specialising in startup market research.',
      promptTemplate: `Analyse the market landscape for this startup:

{{profile}}

Provide: market size estimate, key trends, customer segments, and opportunity gaps. Be specific and actionable.`,
    },
    {
      name: 'Competitive Positioning',
      systemContext:
        'You are a competitive intelligence expert for early-stage companies.',
      promptTemplate: `Based on this market analysis:
{{prev_0}}

For {{companyName}}, map competitive positioning:

{{profile}}

Include: competitor matrix, differentiation opportunities, and positioning statement.`,
    },
    {
      name: 'SWOT & Strategic Insights',
      systemContext:
        'You are a strategy consultant delivering executive-ready analysis.',
      promptTemplate: `Synthesise prior analysis:

Market: {{prev_0}}

Competitive: {{prev_1}}

For {{companyName}}, deliver:
1. SWOT analysis
2. Key risks and mitigations
3. Top 5 strategic priorities
4. 90-day action plan`,
    },
  ],
  audit: [
    {
      name: 'Operational Health Check',
      systemContext:
        'You are a startup operations auditor with expertise in lean methodology.',
      promptTemplate: `Conduct an operational health audit for:

{{profile}}

Assess: product readiness, team structure, processes, and resource allocation. Rate each area and flag critical gaps.`,
    },
    {
      name: 'Financial & Unit Economics',
      systemContext:
        'You are a startup CFO advisor focused on sustainable growth.',
      promptTemplate: `Operations audit:
{{prev_0}}

For {{companyName}} ({{stage}} stage), analyse:
1. Revenue model viability
2. Unit economics framework
3. Burn rate considerations
4. Funding readiness
5. Key financial metrics to track`,
    },
    {
      name: 'Compliance & Risk Audit',
      systemContext: 'You are a startup legal and compliance advisor.',
      promptTemplate: `Prior audit findings:

Ops: {{prev_0}}

Finance: {{prev_1}}

For {{companyName}} in {{industry}}, audit:
1. Regulatory considerations
2. IP and data protection
3. Contract and vendor risks
4. Governance gaps
5. Prioritised remediation checklist`,
    },
    {
      name: 'Executive Audit Summary',
      systemContext: 'You are preparing a board-ready audit report.',
      promptTemplate: `Compile executive audit report from:

{{prev_all}}

For {{companyName}}, deliver:
- Overall health score (1-10)
- Critical findings
- Quick wins
- 30/60/90 day remediation roadmap`,
    },
  ],
  gtm: [
    {
      name: 'ICP & Messaging',
      systemContext:
        'You are a GTM strategist specialising in B2B and B2C startup launches.',
      promptTemplate: `Define go-to-market foundation for:

{{profile}}

Deliver:
1. Ideal Customer Profile (ICP)
2. Buyer personas (2-3)
3. Core messaging framework
4. Value proposition canvas`,
    },
    {
      name: 'Channel Strategy',
      systemContext: 'You are a growth marketing expert for early-stage startups.',
      promptTemplate: `ICP & Messaging:
{{prev_0}}

For {{companyName}}, design channel strategy:
1. Primary acquisition channels (ranked)
2. Channel-specific tactics
3. Budget allocation framework
4. CAC/LTV benchmarks for {{industry}}`,
    },
    {
      name: 'Launch Plan',
      systemContext: 'You are a product launch manager for high-growth startups.',
      promptTemplate: `GTM foundation:

ICP: {{prev_0}}

Channels: {{prev_1}}

Create a 90-day GTM launch plan for {{companyName}}:
1. Pre-launch checklist
2. Launch week playbook
3. Post-launch optimisation
4. KPIs and success metrics
5. Milestone timeline`,
    },
  ],
  'social-media': [
    {
      name: 'Brand Voice & Pillars',
      systemContext: 'You are a social media strategist for startup brands.',
      promptTemplate: `Define social media brand strategy for:

{{profile}}

Deliver:
1. Brand voice guidelines
2. Content pillars (4-5)
3. Platform recommendations
4. Posting cadence`,
    },
    {
      name: 'Content Calendar',
      systemContext:
        'You are a content strategist creating high-engagement social calendars.',
      promptTemplate: `Brand strategy:
{{prev_0}}

Create a 2-week content calendar for {{companyName}}:
- Daily post ideas across recommended platforms
- Content format mix (video, carousel, text, etc.)
- Hashtag strategy
- Engagement hooks`,
    },
    {
      name: 'Ready-to-Post Content',
      systemContext: 'You are a copywriter creating viral-ready startup content.',
      promptTemplate: `Strategy: {{prev_0}}

Calendar: {{prev_1}}

Write 10 ready-to-post pieces for {{companyName}}:
- 3 LinkedIn posts
- 3 Twitter/X threads
- 2 Instagram captions
- 2 TikTok/Reels scripts

Include hooks, CTAs, and suggested visuals.`,
    },
  ],
};
