import { useRef, useState } from 'react';
import { Download, Upload, Check, AlertCircle } from 'lucide-react';
import { downloadBackup, importAllData, type AppBackup } from '../lib/backup';

export default function DataBackupPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [replaceOnImport, setReplaceOnImport] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const backup = JSON.parse(text) as AppBackup;
      const result = importAllData(backup, { replace: replaceOnImport });
      setMessage({
        type: result.imported ? 'success' : 'error',
        text: result.message,
      });
      if (result.imported) {
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to parse backup file.' });
    }
  };

  const openFilePicker = (replace: boolean) => {
    setReplaceOnImport(replace);
    fileRef.current?.click();
  };

  return (
    <div className="glass-card p-6 sm:p-8">
      <h2 className="mb-2 font-semibold">Data Sync & Backup</h2>
      <p className="mb-6 text-sm text-slate-400">
        Export all workspaces, history, branding, and custom prompts as JSON. Import on
        another device to sync without an account.
      </p>

      <div className="flex flex-wrap gap-3">
        <button className="btn-secondary text-sm" onClick={downloadBackup}>
          <Download className="h-4 w-4" />
          Export Backup
        </button>
        <button className="btn-secondary text-sm" onClick={() => openFilePicker(false)}>
          <Upload className="h-4 w-4" />
          Import (Merge)
        </button>
        <button
          className="btn-secondary text-sm"
          onClick={() => {
            if (
              window.confirm(
                'Replace all local data with the backup? This cannot be undone.'
              )
            ) {
              openFilePicker(true);
            }
          }}
        >
          Import (Replace)
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImport(file);
            e.target.value = '';
          }}
        />
      </div>

      {message && (
        <div
          className={`mt-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300'
              : 'bg-red-500/10 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <p className="mt-4 text-xs text-slate-500">
        API keys are never included in backups for security. Re-enter your key or use
        server AI after importing.
      </p>
    </div>
  );
}
