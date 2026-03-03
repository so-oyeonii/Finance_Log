import { create } from 'zustand';
import type { User, Session, Subscription } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;

  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  initAuth: () => Promise<Subscription | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  signUp: async (email, password) => {
    const client = await getSupabaseClient();
    if (!client) return { error: 'Supabase가 설정되지 않았습니다.' };

    const { data, error } = await client.auth.signUp({ email, password });
    if (error) return { error: error.message };

    set({ user: data.user, session: data.session });
    return {};
  },

  signIn: async (email, password) => {
    const client = await getSupabaseClient();
    if (!client) return { error: 'Supabase가 설정되지 않았습니다.' };

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    set({ user: data.user, session: data.session });
    return {};
  },

  signOut: async () => {
    const client = await getSupabaseClient();
    if (client) await client.auth.signOut();
    set({ user: null, session: null });
  },

  initAuth: async () => {
    const client = await getSupabaseClient();
    if (!client) {
      set({ loading: false });
      return null;
    }

    const { data: { session } } = await client.auth.getSession();
    set({ user: session?.user ?? null, session, loading: false });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, session });
    });

    return subscription;
  },
}));
