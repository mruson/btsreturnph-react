import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from '../data/supabase'

// The Supabase SDK, for the admin dashboard only.
//
// The public raffle page deliberately does NOT import this — it needs a single
// INSERT, which is one fetch call, and pulling the whole client library into the
// bundle every visitor downloads would cost ~45 KB gzipped for no benefit. This
// module is imported solely from pages/AdminRaffles.jsx, which is lazy-loaded,
// so the library lands in that chunk and nowhere else.
//
// Created lazily so an unconfigured project doesn't throw at import time — the
// dashboard can then render a "fill in your keys" message instead of a blank
// screen from a module-level exception.
let client = null

export function getSupabase() {
  if (!isSupabaseConfigured) return null
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        // Keeps an admin signed in across refreshes and tabs. Sessions live in
        // localStorage; signing out clears them.
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return client
}
