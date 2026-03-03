'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';
import { pushToCloud, pullFromCloud, getLastSyncedAt, type SyncStatus } from '@/lib/sync';
import { hasEnvConfig } from '@/lib/supabase';

export function useSync() {
  const { user } = useAuthStore();
  const { supabaseUrl, supabaseAnonKey } = useAppStore();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const isConfigured = !!(hasEnvConfig() || (supabaseUrl && supabaseAnonKey));
  const isReady = isConfigured && !!user;

  useEffect(() => {
    getLastSyncedAt().then(setLastSyncedAt);
  }, []);

  const push = useCallback(async () => {
    if (!user) return;
    setSyncStatus('pushing');
    try {
      await pushToCloud(user.id);
      const ts = await getLastSyncedAt();
      setLastSyncedAt(ts);
      setSyncStatus('idle');
    } catch (err) {
      console.error('Push failed:', err);
      setSyncStatus('error');
    }
  }, [user]);

  const pull = useCallback(async () => {
    if (!user) return;
    setSyncStatus('pulling');
    try {
      await pullFromCloud(user.id);
      const ts = await getLastSyncedAt();
      setLastSyncedAt(ts);
      setSyncStatus('idle');
      window.location.reload();
    } catch (err) {
      console.error('Pull failed:', err);
      setSyncStatus('error');
    }
  }, [user]);

  return { push, pull, lastSyncedAt, syncStatus, isConfigured, isReady };
}
