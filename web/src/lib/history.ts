import type { SavedGeneration } from '../types';

const STORAGE_KEY = 'loopforge_history';
const MAX_HISTORY = 50;

export function getHistory(): SavedGeneration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw) as SavedGeneration[];
    return items.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export function getHistoryItem(id: string): SavedGeneration | undefined {
  return getHistory().find((item) => item.id === id);
}

export function saveToHistory(generation: Omit<SavedGeneration, 'id' | 'createdAt'>): SavedGeneration {
  const item: SavedGeneration = {
    ...generation,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  const history = getHistory();
  history.unshift(item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  return item;
}

export function deleteHistoryItem(id: string): void {
  const history = getHistory().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function formatHistoryDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}
