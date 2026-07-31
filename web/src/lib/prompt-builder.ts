export function formatProfileContext(profile: {
  companyName: string;
  industry: string;
  stage: string;
  targetMarket: string;
  valueProposition: string;
  competitors: string;
  goals: string;
}): string {
  return `
Company: ${profile.companyName}
Industry: ${profile.industry}
Stage: ${profile.stage}
Target Market: ${profile.targetMarket}
Value Proposition: ${profile.valueProposition}
Competitors: ${profile.competitors}
Goals: ${profile.goals}
`.trim();
}

export function resolvePromptTemplate(
  template: string,
  profile: {
    companyName: string;
    industry: string;
    stage: string;
    targetMarket: string;
    valueProposition: string;
    competitors: string;
    goals: string;
  },
  previousOutputs: string[]
): string {
  let resolved = template
    .replace(/\{\{profile\}\}/g, formatProfileContext(profile))
    .replace(/\{\{companyName\}\}/g, profile.companyName)
    .replace(/\{\{industry\}\}/g, profile.industry)
    .replace(/\{\{stage\}\}/g, profile.stage)
    .replace(/\{\{targetMarket\}\}/g, profile.targetMarket)
    .replace(/\{\{valueProposition\}\}/g, profile.valueProposition)
    .replace(/\{\{competitors\}\}/g, profile.competitors || 'incumbent players')
    .replace(/\{\{goals\}\}/g, profile.goals)
    .replace(/\{\{prev_all\}\}/g, previousOutputs.join('\n---\n'));

  resolved = resolved.replace(/\{\{prev_(\d+)\}\}/g, (_, index: string) => {
    const i = parseInt(index, 10);
    return previousOutputs[i] ?? '';
  });

  return resolved;
}
