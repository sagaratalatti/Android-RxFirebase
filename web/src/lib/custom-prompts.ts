import type { CustomPromptOverrides, ModuleId } from '../types';
import type { SerializableLoopConfig } from '../types';
import { defaultPromptConfigs } from './default-prompt-configs';

const STORAGE_KEY = 'loopforge_custom_prompts';

export function getCustomPromptOverrides(): CustomPromptOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CustomPromptOverrides) : {};
  } catch {
    return {};
  }
}

export function getPromptConfigsForModule(moduleId: ModuleId): SerializableLoopConfig[] {
  const overrides = getCustomPromptOverrides();
  return overrides[moduleId] ?? defaultPromptConfigs[moduleId];
}

export function saveCustomPrompts(
  moduleId: ModuleId,
  configs: SerializableLoopConfig[]
): void {
  const overrides = getCustomPromptOverrides();
  overrides[moduleId] = configs;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function resetCustomPrompts(moduleId: ModuleId): void {
  const overrides = getCustomPromptOverrides();
  delete overrides[moduleId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function hasCustomPrompts(moduleId: ModuleId): boolean {
  return Boolean(getCustomPromptOverrides()[moduleId]);
}

export function resetAllCustomPrompts(): void {
  localStorage.removeItem(STORAGE_KEY);
}
