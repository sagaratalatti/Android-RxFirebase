import { getHistory } from './history';
import { getCustomPromptOverrides } from './custom-prompts';
import { getBranding } from './branding';
import { getWorkspaces } from './workspaces';
import { getAIMode } from './ai-service';

export const BACKUP_VERSION = 1;

export interface AppBackup {
  version: number;
  exportedAt: string;
  history: ReturnType<typeof getHistory>;
  workspaces: ReturnType<typeof getWorkspaces>;
  branding: ReturnType<typeof getBranding>;
  customPrompts: ReturnType<typeof getCustomPromptOverrides>;
  aiMode: ReturnType<typeof getAIMode>;
}

export function exportAllData(): AppBackup {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    history: getHistory(),
    workspaces: getWorkspaces(),
    branding: getBranding(),
    customPrompts: getCustomPromptOverrides(),
    aiMode: getAIMode(),
  };
}

export function downloadBackup(): void {
  const backup = exportAllData();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `loopforge-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAllData(
  backup: AppBackup,
  options: { replace?: boolean } = {}
): { imported: boolean; message: string } {
  if (!backup || backup.version !== BACKUP_VERSION) {
    return { imported: false, message: 'Unsupported or invalid backup file.' };
  }

  if (options.replace) {
    localStorage.setItem('loopforge_history', JSON.stringify(backup.history ?? []));
    localStorage.setItem('loopforge_workspaces', JSON.stringify(backup.workspaces ?? []));
    localStorage.setItem('loopforge_branding', JSON.stringify(backup.branding));
    localStorage.setItem('loopforge_custom_prompts', JSON.stringify(backup.customPrompts ?? {}));
    localStorage.setItem('loopforge_ai_mode', backup.aiMode ?? 'demo');
  } else {
    const existingHistory = getHistory();
    const mergedHistory = [...(backup.history ?? []), ...existingHistory]
      .filter((item, index, arr) => arr.findIndex((i) => i.id === item.id) === index)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 50);
    localStorage.setItem('loopforge_history', JSON.stringify(mergedHistory));

    const existingWorkspaces = getWorkspaces();
    const mergedWorkspaces = [...(backup.workspaces ?? []), ...existingWorkspaces]
      .filter((item, index, arr) => arr.findIndex((i) => i.id === item.id) === index)
      .sort((a, b) => b.updatedAt - a.updatedAt);
    localStorage.setItem('loopforge_workspaces', JSON.stringify(mergedWorkspaces));

    if (backup.branding) {
      localStorage.setItem('loopforge_branding', JSON.stringify(backup.branding));
    }
    if (backup.customPrompts) {
      const existing = getCustomPromptOverrides();
      localStorage.setItem(
        'loopforge_custom_prompts',
        JSON.stringify({ ...existing, ...backup.customPrompts })
      );
    }
    if (backup.aiMode) {
      localStorage.setItem('loopforge_ai_mode', backup.aiMode);
    }
  }

  return { imported: true, message: 'Data imported successfully. Refresh to apply all changes.' };
}
