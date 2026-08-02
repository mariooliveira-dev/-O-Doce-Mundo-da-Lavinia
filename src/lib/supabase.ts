import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

let rawUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  ''
).trim();

if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  rawUrl = `https://${rawUrl}`;
}

const supabaseUrl = rawUrl;

const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUP_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  ''
).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.length > 8 &&
  supabaseAnonKey.length > 8 &&
  !supabaseUrl.includes('seu-projeto') &&
  !supabaseAnonKey.includes('sua-chave')
);

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  return supabase;
};
