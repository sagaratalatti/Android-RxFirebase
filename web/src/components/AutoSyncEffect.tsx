import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isAutoSyncEnabled } from '../lib/sync-preferences';
import { pullFromCloud, pushToCloud } from '../lib/cloud-sync';
import { exportAllData, applyBackupToLocalStorage } from '../lib/backup';

export default function AutoSyncEffect() {
  const { user, configured } = useAuth();
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!configured || !user || !isAutoSyncEnabled()) return;
    if (syncedRef.current === user.id) return;

    syncedRef.current = user.id;

    (async () => {
      const pullResult = await pullFromCloud(user.id);
      if (pullResult.success && pullResult.data) {
        applyBackupToLocalStorage(pullResult.data, { replace: false });
      }
      await pushToCloud(user.id, exportAllData());
    })();
  }, [user, configured]);

  return null;
}
