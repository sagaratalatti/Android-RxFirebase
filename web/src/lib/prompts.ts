import type { LoopPromptTemplate, ModuleId } from '../types';
import { resolvePromptTemplate } from './prompt-builder';
import { getPromptConfigsForModule } from './custom-prompts';

export function buildTemplateFromConfigs(moduleId: ModuleId): LoopPromptTemplate {
  const configs = getPromptConfigsForModule(moduleId);

  return {
    moduleId,
    loops: configs.map((config) => ({
      name: config.name,
      systemContext: config.systemContext,
      buildPrompt: (profile, previousOutputs) =>
        resolvePromptTemplate(config.promptTemplate, profile, previousOutputs),
    })),
  };
}

export function getTemplateForModule(moduleId: ModuleId): LoopPromptTemplate {
  return buildTemplateFromConfigs(moduleId);
}

const moduleIds: ModuleId[] = ['business-analysis', 'audit', 'gtm', 'social-media'];

export const promptTemplates: Record<ModuleId, LoopPromptTemplate> = Object.fromEntries(
  moduleIds.map((id) => [id, buildTemplateFromConfigs(id)])
) as Record<ModuleId, LoopPromptTemplate>;
