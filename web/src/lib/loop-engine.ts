import type { LoopPromptTemplate, StartupProfile } from '../types';
import { generateAIResponse, isAIConfigured } from './ai-service';

export interface LoopEngineResult {
  outputs: string[];
  iterations: {
    loopNumber: number;
    name: string;
    prompt: string;
    response: string;
  }[];
  finalOutput: string;
  usedLiveAI: boolean;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateDemoResponse(
  loopName: string,
  profile: StartupProfile,
  previousOutputs: string[]
): string {
  const sections: Record<string, string> = {
    'Market Landscape': `## Market Landscape Analysis — ${profile.companyName}

### Market Size & Growth
The ${profile.industry} market is experiencing robust growth, with the addressable market for ${profile.targetMarket} estimated at $4.2B–$6.8B globally. Key growth drivers include digital transformation, shifting consumer behaviour, and regulatory tailwinds.

### Key Trends
1. **AI-native solutions** — ${profile.industry} incumbents are slow to adopt; ${profile.companyName} can leapfrog with modern architecture
2. **Vertical specialisation** — Generic tools are losing to purpose-built solutions for ${profile.targetMarket}
3. **Outcome-based pricing** — Customers increasingly prefer value-aligned pricing models

### Customer Segments
| Segment | Pain Point | Willingness to Pay |
|---------|-----------|-------------------|
| Early adopters | Speed & innovation | High |
| SMBs | Cost efficiency | Medium |
| Enterprise | Compliance & scale | High (long sales cycle) |

### Opportunity Gaps
- Underserved ${profile.targetMarket} segment lacks tailored solutions
- ${profile.valueProposition} addresses a clear gap vs. ${profile.competitors || 'incumbent players'}
- ${profile.stage} stage is ideal for rapid iteration before market consolidation`,

    'Competitive Positioning': `## Competitive Positioning — ${profile.companyName}

### Competitor Matrix
| Factor | ${profile.companyName} | ${profile.competitors || 'Incumbent A'} | Market Average |
|--------|----------------------|----------------------------------------|----------------|
| Innovation | ★★★★★ | ★★☆☆☆ | ★★★☆☆ |
| Price | ★★★★☆ | ★★☆☆☆ | ★★★☆☆ |
| Ease of Use | ★★★★★ | ★★★☆☆ | ★★★☆☆ |
| Market Reach | ★★☆☆☆ | ★★★★★ | ★★★☆☆ |

### Differentiation Opportunities
1. **Speed to value** — Launch in days, not months
2. **Founder-led support** — White-glove onboarding for early customers
3. **${profile.valueProposition}** — Unique angle competitors cannot easily replicate

### Positioning Statement
> For ${profile.targetMarket} who need ${profile.goals}, ${profile.companyName} is the ${profile.industry} solution that delivers ${profile.valueProposition} — unlike ${profile.competitors || 'alternatives'}, we focus exclusively on startup velocity.`,

    'SWOT & Strategic Insights': `## Strategic Analysis — ${profile.companyName}

### SWOT
| Strengths | Weaknesses |
|-----------|-----------|
| Clear value prop | Limited brand awareness |
| Agile ${profile.stage} team | Resource constraints |
| Modern tech stack | Unproven at scale |

| Opportunities | Threats |
|--------------|---------|
| Growing ${profile.industry} market | Well-funded competitors |
| Underserved ${profile.targetMarket} | Economic uncertainty |
| Partnership potential | Talent competition |

### Top 5 Strategic Priorities
1. Validate product-market fit with 10 design partners
2. Build repeatable acquisition channel for ${profile.targetMarket}
3. Establish thought leadership in ${profile.industry}
4. Secure seed funding to extend runway 18+ months
5. Hire key roles: engineering lead + GTM lead

### 90-Day Action Plan
- **Days 1-30:** Customer discovery interviews (20+), MVP refinement
- **Days 31-60:** Beta launch, iterate on feedback, first revenue
- **Days 61-90:** Scale winning channel, prepare fundraising deck`,

    'Operational Health Check': `## Operational Health Audit — ${profile.companyName}

### Health Scores
| Area | Score | Status |
|------|-------|--------|
| Product Readiness | 7/10 | 🟡 On track |
| Team Structure | 6/10 | 🟡 Gaps identified |
| Processes | 5/10 | 🟠 Needs work |
| Resource Allocation | 6/10 | 🟡 Review needed |

### Critical Gaps
1. No documented customer onboarding process
2. Missing weekly metrics review cadence
3. Technical debt accumulating in core features
4. No formal OKR framework at ${profile.stage} stage

### Recommendations
- Implement weekly standups with clear sprint goals
- Document SOPs for customer support and sales
- Establish a product analytics baseline before scaling`,

    'Financial & Unit Economics': `## Financial Analysis — ${profile.companyName}

### Revenue Model Assessment
${profile.valueProposition} supports a SaaS/subscription model with strong expansion revenue potential in ${profile.industry}.

### Unit Economics Framework
| Metric | Target | Current Est. |
|--------|--------|-------------|
| CAC | < $500 | TBD |
| LTV | > $5,000 | TBD |
| LTV:CAC | > 3:1 | TBD |
| Gross Margin | > 70% | ~75% (projected) |
| Monthly Burn | Track weekly | Monitor closely |

### Funding Readiness (${profile.stage})
- Prepare 18-month financial model
- Document key assumptions and sensitivities
- Target 18+ months runway post-raise`,

    'Compliance & Risk Audit': `## Compliance & Risk — ${profile.companyName}

### Regulatory Considerations (${profile.industry})
- Data privacy: GDPR/CCPA compliance required for ${profile.targetMarket}
- Industry-specific regulations should be mapped in Q1
- Terms of service and privacy policy need legal review

### Risk Register
| Risk | Severity | Mitigation |
|------|----------|-----------|
| Data breach | High | SOC 2 roadmap |
| IP disputes | Medium | Trademark filing |
| Vendor lock-in | Medium | Multi-cloud strategy |
| Key person risk | High | Documentation + equity incentives |`,

    'Executive Audit Summary': `## Executive Audit Summary — ${profile.companyName}

### Overall Health Score: **6.5 / 10**

### Critical Findings
1. Strong product vision but operational processes need formalisation
2. Financial planning exists but unit economics are unvalidated
3. Compliance gaps acceptable at ${profile.stage} but must be addressed pre-Series A

### Quick Wins (This Week)
- [ ] Set up weekly metrics dashboard
- [ ] Document top 3 customer onboarding steps
- [ ] Schedule legal review of terms of service

### Remediation Roadmap
| Timeline | Focus |
|----------|-------|
| 30 days | Process documentation, analytics setup |
| 60 days | Unit economics validation, compliance basics |
| 90 days | Fundraising prep, team structure optimisation |`,

    'ICP & Messaging': `## GTM Foundation — ${profile.companyName}

### Ideal Customer Profile
- **Company size:** 10-200 employees
- **Industry:** ${profile.industry} and adjacent verticals
- **Decision maker:** VP/Director level in ${profile.targetMarket}
- **Trigger event:** Scaling pain, tool consolidation, or new market entry

### Buyer Personas
1. **The Builder** — Technical founder, values speed and flexibility
2. **The Operator** — COO/VP Ops, values reliability and ROI
3. **The Champion** — Team lead, values ease of use and team adoption

### Messaging Framework
- **Problem:** ${profile.targetMarket} struggle with fragmented tools and slow execution
- **Solution:** ${profile.companyName} delivers ${profile.valueProposition}
- **Proof:** Early customer wins, founder expertise, modern architecture
- **CTA:** "Start your free trial — see results in 14 days"`,

    'Channel Strategy': `## Channel Strategy — ${profile.companyName}

### Ranked Acquisition Channels
1. **LinkedIn organic + outbound** — High intent for ${profile.targetMarket}
2. **Content marketing / SEO** — Long-term compounding asset
3. **Product-led growth** — Free tier → paid conversion
4. **Partnerships** — Integrate with tools your ICP already uses
5. **Community** — Build in public, founder-led brand

### Budget Framework (${profile.stage})
| Channel | % Budget | Expected CAC |
|---------|----------|-------------|
| Content/SEO | 30% | $200-400 |
| Paid (test) | 20% | $500-800 |
| Events/community | 25% | $300-500 |
| Tools/ops | 25% | — |`,

    'Launch Plan': `## 90-Day GTM Launch Plan — ${profile.companyName}

### Pre-Launch (Days 1-30)
- [ ] Landing page with waitlist
- [ ] 5 case study / use case pages
- [ ] Email nurture sequence (5 emails)
- [ ] Beta user onboarding flow

### Launch Week
- **Day 1:** Product Hunt + LinkedIn announcement
- **Day 2-3:** Founder AMA, demo webinars
- **Day 4-5:** Press outreach, influencer partnerships
- **Day 6-7:** Analyse metrics, iterate messaging

### KPIs
| Metric | 30-day | 60-day | 90-day |
|--------|--------|--------|--------|
| Signups | 200 | 500 | 1,000 |
| Activated users | 50 | 150 | 400 |
| Paying customers | 5 | 20 | 50 |
| MRR | $2K | $8K | $20K |`,

    'Brand Voice & Pillars': `## Social Media Strategy — ${profile.companyName}

### Brand Voice
- **Tone:** Confident, approachable, founder-authentic
- **Style:** Data-informed but human; avoid corporate jargon
- **Personality:** The smart friend who builds in public

### Content Pillars
1. **Build in Public** — Product updates, lessons learned
2. **Industry Insights** — ${profile.industry} trends and analysis
3. **Customer Wins** — Testimonials, case studies, transformations
4. **Founder Story** — Behind the scenes, team culture
5. **Educational** — How-tos, frameworks, actionable tips

### Platform Strategy
| Platform | Priority | Cadence |
|----------|----------|---------|
| LinkedIn | Primary | 4x/week |
| Twitter/X | Secondary | Daily |
| Instagram | Brand | 3x/week |
| TikTok | Experimental | 2x/week |`,

    'Content Calendar': `## 2-Week Content Calendar — ${profile.companyName}

### Week 1
| Day | Platform | Content | Format |
|-----|----------|---------|--------|
| Mon | LinkedIn | "Why we started ${profile.companyName}" | Story post |
| Tue | Twitter | 5 lessons from building in ${profile.industry} | Thread |
| Wed | LinkedIn | ${profile.valueProposition} explained | Carousel |
| Thu | Instagram | Team behind the product | Reel |
| Fri | LinkedIn | Weekly metrics transparent share | Text post |

### Week 2
| Day | Platform | Content | Format |
|-----|----------|---------|--------|
| Mon | LinkedIn | Customer pain point → solution | Case study |
| Tue | Twitter | Hot take on ${profile.industry} trend | Single post |
| Wed | TikTok | "Day in the life of a startup founder" | Short video |
| Thu | LinkedIn | Framework: How to ${profile.goals} | Carousel |
| Fri | All | Week recap + ask me anything | Multi-platform |`,

    'Ready-to-Post Content': `## Ready-to-Post Content — ${profile.companyName}

### LinkedIn Post 1
🚀 We just hit a milestone at ${profile.companyName}.

After months of building for ${profile.targetMarket}, here's what we learned:

→ ${profile.valueProposition}
→ Speed beats perfection at the ${profile.stage} stage
→ Your first 10 customers teach you more than 100 surveys

What's the #1 lesson from your startup journey?

---

### Twitter/X Thread
🧵 How ${profile.companyName} is changing ${profile.industry} (Thread)

1/ The problem: ${profile.targetMarket} are stuck with outdated solutions

2/ Our insight: ${profile.valueProposition}

3/ What we built: [product description]

4/ Early results: [metrics]

5/ What's next: ${profile.goals}

Follow for more build-in-public updates 👇

---

### Instagram Caption
Building something meaningful in ${profile.industry} isn't easy — but it's worth it. 💪

At ${profile.companyName}, we believe ${profile.targetMarket} deserve better.

${profile.valueProposition}

Link in bio to learn more ✨

#startup #${profile.industry.replace(/\s+/g, '')} #buildinpublic`,
  };

  if (sections[loopName]) {
    return sections[loopName];
  }

  return `## ${loopName} — ${profile.companyName}

Analysis for ${profile.companyName} in the ${profile.industry} space.

**Context:** ${profile.valueProposition}
**Target:** ${profile.targetMarket}
**Stage:** ${profile.stage}
**Goals:** ${profile.goals}

${previousOutputs.length > 0 ? `Building on prior analysis:\n${previousOutputs[previousOutputs.length - 1].slice(0, 200)}...` : ''}

_Demo mode: Connect your OpenAI API key for live AI-generated content tailored to your startup._`;
}

export async function runLoopEngine(
  template: LoopPromptTemplate,
  profile: StartupProfile,
  onLoopComplete?: (loopNumber: number, name: string, response: string) => void
): Promise<LoopEngineResult> {
  const outputs: string[] = [];
  const iterations: LoopEngineResult['iterations'] = [];
  const useLiveAI = isAIConfigured();

  for (let i = 0; i < template.loops.length; i++) {
    const loop = template.loops[i];
    const prompt = loop.buildPrompt(profile, outputs);

    let response: string;

    if (useLiveAI) {
      response = await generateAIResponse(prompt, loop.systemContext);
    } else {
      await delay(800 + i * 400);
      response = generateDemoResponse(loop.name, profile, outputs);
    }

    outputs.push(response);
    iterations.push({
      loopNumber: i + 1,
      name: loop.name,
      prompt,
      response,
    });

    onLoopComplete?.(i + 1, loop.name, response);
  }

  const finalOutput = outputs[outputs.length - 1];

  return {
    outputs,
    iterations,
    finalOutput,
    usedLiveAI: useLiveAI,
  };
}
