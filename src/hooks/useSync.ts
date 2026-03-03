'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';
import { pushToCloud, pullFromCloud, getLastSyncedAt, type SyncStatus } from '@/lib/sync';
import { hasEnvConfig, getSupabaseClient } from '@/lib/supabase';

export function useSync() {
  const { user } = useAuthStore();
  const { supabaseUrl, supabaseAnonKey } = useAppStore();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [tablesReady, setTablesReady] = useState<boolean | null>(null);

  const isConfigured = !!(hasEnvConfig() || (supabaseUrl && supabaseAnonKey));
  const isReady = isConfigured && !!user;

  useEffect(() => {
    getLastSyncedAt().then(setLastSyncedAt);
  }, []);

  // Check if tables exist when configured
  const checkTables = useCallback(async () => {
    if (!isConfigured) {
      setTablesReady(null);
      return;
    }

    try {
      const client = await getSupabaseClient();
      if (!client) {
        setTablesReady(null);
        return;
      }

      const { error } = await client
        .from('sl_accounts')
        .select('id')
        .limit(1);

      // If table doesn't exist, Supabase returns a 404-like error
      if (error && (error.message?.includes('does not exist') || error.code === '42P01' || error.code === 'PGRST116')) {
        setTablesReady(false);
      } else {
        setTablesReady(true);
      }
    } catch {
      setTablesReady(null);
    }
  }, [isConfigured]);

  useEffect(() => {
    checkTables();
  }, [checkTables]);

  const recheckTables = useCallback(async () => {
    await checkTables();
  }, [checkTables]);

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

  return { push, pull, lastSyncedAt, syncStatus, isConfigured, isReady, tablesReady, recheckTables };
}
