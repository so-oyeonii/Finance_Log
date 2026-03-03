import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSetting } from './db';

// ============================================
// Supabase Client Factory
// ============================================
// Fallback chain:
// 1. Environment variables (NEXT_PUBLIC_SUPABASE_URL + _ANON_KEY)
// 2. User-provided values stored in IndexedDB settings

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  // Try env vars first
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Fallback to IndexedDB settings
  if (!url || !key) {
    const storedUrl = await getSetting<string>('supabaseUrl', '');
    const storedKey = await getSetting<string>('supabaseAnonKey', '');
    if (!url) url = storedUrl;
    if (!key) key = storedKey;
  }

  if (!url || !key) return null;

  // Return cached client if same config
  if (cachedClient && cachedUrl === url && cachedKey === key) {
    return cachedClient;
  }

  cachedClient = createClient(url, key);
  cachedUrl = url;
  cachedKey = key;
  return cachedClient;
}

export function clearSupabaseClient() {
  cachedClient = null;
  cachedUrl = '';
  cachedKey = '';
}

export function hasEnvConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
