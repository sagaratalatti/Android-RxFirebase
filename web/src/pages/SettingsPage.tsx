import PromptEditor from '../components/PromptEditor';
import AISettingsPanel from '../components/AISettingsPanel';
import BrandingEditor from '../components/BrandingEditor';
import WorkspaceManager from '../components/WorkspaceManager';
import DataBackupPanel from '../components/DataBackupPanel';
import CloudSyncPanel from '../components/CloudSyncPanel';

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold">Settings</h1>
      <p className="mb-10 text-slate-400">
        Configure AI, branding, workspaces, and data sync.
      </p>

      <div className="space-y-8">
        <AISettingsPanel />
        <CloudSyncPanel />
        <BrandingEditor />
        <WorkspaceManager />
        <PromptEditor />
        <DataBackupPanel />
      </div>
    </div>
  );
}
