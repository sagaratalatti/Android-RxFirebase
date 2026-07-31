const AUTO_SYNC_KEY = 'loopforge_auto_sync';

export function isAutoSyncEnabled(): boolean {
  return localStorage.getItem(AUTO_SYNC_KEY) !== 'false';
}

export function setAutoSyncEnabled(enabled: boolean): void {
  localStorage.setItem(AUTO_SYNC_KEY, enabled ? 'true' : 'false');
}
