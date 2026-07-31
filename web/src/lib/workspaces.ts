import type { StartupProfile, SavedWorkspace } from '../types';

const STORAGE_KEY = 'loopforge_workspaces';

export function getWorkspaces(): SavedWorkspace[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as SavedWorkspace[]).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function getWorkspace(id: string): SavedWorkspace | undefined {
  return getWorkspaces().find((w) => w.id === id);
}

export function saveWorkspace(
  workspace: Omit<SavedWorkspace, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): SavedWorkspace {
  const now = Date.now();
  const workspaces = getWorkspaces();

  if (workspace.id) {
    const index = workspaces.findIndex((w) => w.id === workspace.id);
    if (index >= 0) {
      const updated: SavedWorkspace = {
        ...workspaces[index],
        ...workspace,
        id: workspace.id,
        updatedAt: now,
      };
      workspaces[index] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
      return updated;
    }
  }

  const created: SavedWorkspace = {
    id: crypto.randomUUID(),
    name: workspace.name,
    profile: workspace.profile,
    createdAt: now,
    updatedAt: now,
  };
  workspaces.unshift(created);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
  return created;
}

export function deleteWorkspace(id: string): void {
  const workspaces = getWorkspaces().filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
}

export function profileFromWorkspace(workspace: SavedWorkspace): StartupProfile {
  return { ...workspace.profile };
}
