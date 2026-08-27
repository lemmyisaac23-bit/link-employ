import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/** Normalize project URL — secrets sometimes paste the REST path by mistake. */
function cleanSupabaseUrl(value: string | undefined): string {
  return (value ?? '')
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/rest\/v1$/i, '')
    .replace(/\/auth\/v1$/i, '')
    .replace(/\/+$/, '')
}

function cleanEnv(value: string | undefined): string {
  return (value ?? '').trim()
}

const supabaseUrl = cleanSupabaseUrl(
  import.meta.env.VITE_SUPABASE_URL as string | undefined,
)
const supabaseAnonKey = cleanEnv(
  import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
)

export const SITE_URL = 'https://worklinkus.com'

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Cloud login is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    )
  }
  return supabase
}
