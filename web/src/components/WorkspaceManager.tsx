import { useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Save,
  Check,
  Briefcase,
} from 'lucide-react';
import type { StartupProfile, SavedWorkspace } from '../types';
import { getWorkspaces, saveWorkspace, deleteWorkspace } from '../lib/workspaces';
import StartupForm, { emptyProfile, isProfileValid } from './StartupForm';

export default function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useState<SavedWorkspace[]>(getWorkspaces());
  const [editing, setEditing] = useState<SavedWorkspace | null>(null);
  const [name, setName] = useState('');
  const [profile, setProfile] = useState<StartupProfile>(emptyProfile);
  const [saved, setSaved] = useState(false);

  const refresh = () => setWorkspaces(getWorkspaces());

  const startNew = () => {
    setEditing(null);
    setName('');
    setProfile(emptyProfile);
  };

  const startEdit = (workspace: SavedWorkspace) => {
    setEditing(workspace);
    setName(workspace.name);
    setProfile({ ...workspace.profile });
  };

  const handleSave = () => {
    if (!name.trim() || !isProfileValid(profile)) return;
    saveWorkspace({
      id: editing?.id,
      name: name.trim(),
      profile,
    });
    refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (!editing) {
      setName('');
      setProfile(emptyProfile);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this workspace?')) {
      deleteWorkspace(id);
      refresh();
      if (editing?.id === id) startNew();
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/20">
            <Briefcase className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-semibold">Startup Workspaces</h2>
            <p className="text-sm text-slate-400">
              Save company profiles and reuse them across modules.
            </p>
          </div>
        </div>
        <button className="btn-secondary text-sm" onClick={startNew}>
          <Plus className="h-4 w-4" />
          New Workspace
        </button>
      </div>

      {workspaces.length > 0 && (
        <div className="mb-6 space-y-2">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                editing?.id === workspace.id
                  ? 'border-brand-500/50 bg-brand-500/10'
                  : 'border-slate-700 bg-slate-900/30'
              }`}
            >
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                onClick={() => startEdit(workspace)}
              >
                <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{workspace.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {workspace.profile.companyName} · {workspace.profile.industry}
                  </p>
                </div>
              </button>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-red-400"
                onClick={() => handleDelete(workspace.id)}
                aria-label="Delete workspace"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4 border-t border-slate-700 pt-6">
        <h3 className="font-medium">
          {editing ? `Edit: ${editing.name}` : 'Create Workspace'}
        </h3>
        <div>
          <label className="label-text" htmlFor="workspaceName">
            Workspace Name *
          </label>
          <input
            id="workspaceName"
            className="input-field"
            placeholder="My Startup Q1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <StartupForm profile={profile} onChange={setProfile} />
        <button
          className="btn-primary text-sm"
          onClick={handleSave}
          disabled={!name.trim() || !isProfileValid(profile)}
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : editing ? 'Update Workspace' : 'Save Workspace'}
        </button>
      </div>
    </div>
  );
}

export function WorkspaceSelector({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (profile: StartupProfile, workspaceId: string) => void;
}) {
  const workspaces = getWorkspaces();

  if (workspaces.length === 0) return null;

  return (
    <div className="mb-6">
      <label className="label-text" htmlFor="workspace-select">
        Load from workspace
      </label>
      <select
        id="workspace-select"
        className="input-field"
        value={value}
        onChange={(e) => {
          const workspace = workspaces.find((w) => w.id === e.target.value);
          if (workspace) {
            onSelect({ ...workspace.profile }, workspace.id);
          }
        }}
      >
        <option value="">Select a saved workspace…</option>
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id}>
            {workspace.name} — {workspace.profile.companyName}
          </option>
        ))}
      </select>
    </div>
  );
}
