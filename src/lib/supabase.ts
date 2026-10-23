import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  balance: number;
  coins: number;
  rank: number;
  created_at: string;
}

export async function fetchProfile(): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, balance, coins, rank, created_at')
    .maybeSingle();
  if (error) return null;
  return data as Profile | null;
}

export async function upsertProfile(id: string, full_name: string, email: string) {
  return supabase
    .from('profiles')
    .upsert({ id, full_name, email }, { onConflict: 'id' });
}
