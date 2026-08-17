// ============================================================================
// SUPABASE CONNECTION — raffle entries + the admin dashboard.
// ============================================================================
//
// TWO PROJECTS: PRODUCTION AND PREVIEW
// ------------------------------------
// Which one the site talks to is decided at RUNTIME from the hostname, not at
// build time. That matters for this repo's deploy flow (README workflow B):
// `npm run build` runs on your own machine and the same `dist/` is uploaded to
// either a draft URL or production. A build-time switch would mean every deploy
// carried a guess about where it was going — and the day someone guesses wrong,
// test entries land in the production table, or worse, real entrants' data
// lands in the scratch project. Deciding at runtime makes one build correct
// everywhere: the draft URL always talks to preview, the real domain always
// talks to production, and there is no flag to forget.
//
// Both anon keys ship in the bundle. That's fine — they're public by design, and
// each project's own row-level security is what protects its data.
//
// WHY THESE ARE COMMITTED AND NOT IN A .env
// -----------------------------------------
// The anon key is *designed* to be public: it ships inside the JavaScript
// bundle either way, so anyone can read it out of the deployed site with View
// Source. Hiding it would protect nothing while adding a real failure mode —
// this project builds locally, so a missing .env means whoever deploys silently
// ships a broken entry form.
//
// What actually protects entrants' names, emails, and phone numbers is the
// row-level security policy in supabase/setup.sql: anyone may INSERT an entry,
// only signed-in admins may read one. Never paste a *service_role* key here —
// that one bypasses RLS entirely and would expose everything to every visitor.

const PROJECTS = {
  // The live site. Create a SECOND Supabase project for this, run
  // supabase/setup.sql in it, and add your admin accounts there too — they do
  // not carry over between projects.
  production: {
    url: 'https://mvtgbsqpnehzkxdgogoj.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12dGdic3FwbmVoemt4ZGdvZ29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NjM3NTQsImV4cCI6MjEwMjAzOTc1NH0.sf36YUFKP_J9BksPmqKIUVvQFFJelTr9WHOfIE7L9rY',
  },

  // Draft deploys and localhost. Test raffles and junk entries belong here.
  preview: {
    url: 'https://wvsabaroivzssutdbbcr.supabase.co',
    anonKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2c2FiYXJvaXZ6c3N1dGRiYmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NjMwMjcsImV4cCI6MjEwMjAzOTAyN30.z3tAdmpgI0JIQjjRVrlXKn_nybQh27xJmGAk5NscIEU',
  },
}

// Every hostname the PRODUCTION deploy can be reached on. Anything else —
// localhost, draft deploys, branch deploys — falls through to preview.
// Defaulting that way round is deliberate: a hostname nobody anticipated gets
// the scratch database, never the live one.
//
// The bare *.netlify.app subdomain belongs here, and missing it is an easy
// mistake to make. It is not a preview URL: it serves the same published deploy
// as the custom domain, Netlify's own dashboard links to it, and it can be
// shared or indexed. Left out, somebody entering a raffle through that address
// would have their entry written to the scratch project and quietly lost.
//
// Draft and branch deploys are safe because their hostnames are PREFIXED
// (`<deploy-id>--celadon-pavlova-537268.netlify.app`), and this is an exact
// match — so they still get preview, which is what we want.
const PRODUCTION_HOSTS = [
  'btsreturnph.com',
  'www.btsreturnph.com',
  'celadon-pavlova-537268.netlify.app',
]

function detectEnvironment() {
  // No `location` when this module is pulled into a Node script; assume the
  // safe side.
  if (typeof location === 'undefined') return 'preview'
  return PRODUCTION_HOSTS.includes(location.hostname) ? 'production' : 'preview'
}

export const SUPABASE_ENVIRONMENT = detectEnvironment()

const active = PROJECTS[SUPABASE_ENVIRONMENT]

export const SUPABASE_URL = active.url
export const SUPABASE_ANON_KEY = active.anonKey

// The table the entry form writes to and the dashboard reads.
export const ENTRIES_TABLE = 'raffle_entries'

// True once the ACTIVE project's placeholders have been replaced. Checked per
// environment, so production being unconfigured can't hide behind a working
// preview — the live site says so plainly instead of failing at the network
// layer with something cryptic.
export const isSupabaseConfigured =
  !active.url.includes('YOUR-') && !active.anonKey.includes('YOUR-')

// PostgREST endpoint for the entries table. The public raffle page talks to
// this with plain fetch rather than the Supabase SDK — an insert is one POST,
// and pulling ~60 KB of client library into the page every visitor loads to
// save a few lines isn't a good trade. The dashboard, which needs auth and
// realtime, does use the SDK.
export const entriesEndpoint = `${SUPABASE_URL}/rest/v1/${ENTRIES_TABLE}`

export const supabaseHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}
