import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { FALLBACK_CAMPAIGN, themeFor } from '../data/campaigns'
import { SUPABASE_URL, isSupabaseConfigured, supabaseHeaders } from '../data/supabase'
import { driveImage } from './sheet'

// ============================================================================
// CAMPAIGN THEME — a campaign's content from the database, its look from code.
// ============================================================================
// Content (name, tagline, sponsor, logo) lives in the `campaigns` table so
// whoever runs a campaign can change it without a developer. Design lives in
// data/campaigns.js keyed by the row's `theme` column, because a palette needs
// design work and a deploy either way.
//
// The provider's only job is to set the theme's CSS custom properties on a
// wrapper. Components below reference them by name — `bg-[var(--rf-panel)]` —
// so they never learn which campaign they're rendering.

const CAMPAIGNS_ENDPOINT = `${SUPABASE_URL}/rest/v1/campaigns`

const CampaignContext = createContext(FALLBACK_CAMPAIGN)

export const useCampaign = () => useContext(CampaignContext)

function toCampaign(row) {
  if (!row) return null
  return {
    slug: String(row.slug || '').trim(),
    name: String(row.name || '').trim(),
    tagline: String(row.tagline || '').trim(),
    eyebrow: String(row.eyebrow || '').trim(),
    sponsor: String(row.sponsor || '').trim(),
    // Same treatment the raffle's own logo gets: a Google Drive share link is
    // a web page, not an image, so it has to become a direct thumbnail URL or
    // the <img> renders broken. Non-Drive URLs pass through untouched.
    sponsorLogo: driveImage(String(row.sponsor_logo_url || '').trim()),
    theme: String(row.theme || '').trim(),
  }
}

async function fetchCampaign(query) {
  const res = await fetch(`${CAMPAIGNS_ENDPOINT}?select=*&limit=1&${query}`, {
    headers: supabaseHeaders,
  })
  if (!res.ok) throw new Error(`Supabase responded ${res.status}`)
  const rows = await res.json()
  return toCampaign(rows[0])
}

// `slug` names a campaign; omit it for whichever campaign is marked primary,
// which is what /raffle lands on.
export function useCampaignData(slug) {
  const [campaign, setCampaign] = useState(FALLBACK_CAMPAIGN)

  const load = useCallback(() => {
    if (!isSupabaseConfigured) return () => {}
    let alive = true
    const query = slug ? `slug=eq.${encodeURIComponent(slug)}` : 'is_primary=eq.true'

    fetchCampaign(query).then(
      (row) => {
        // No row is survivable: the fallback keeps the page styled and named
        // rather than rendering a blank hero.
        if (alive && row) setCampaign(row)
      },
      (error) => console.error('Loading campaign failed:', error),
    )
    return () => {
      alive = false
    }
  }, [slug])

  useEffect(load, [load])

  return campaign
}

export function CampaignTheme({ campaign, className = '', children }) {
  const active = campaign || FALLBACK_CAMPAIGN
  const theme = themeFor(active.theme)

  return (
    <CampaignContext.Provider value={active}>
      <div
        className={`relative min-h-screen font-[family-name:var(--rf-font-body)] text-[color:var(--rf-text)] ${className}`}
        style={{ ...theme.vars, ...theme.backdrop }}
      >
        {children}
      </div>
    </CampaignContext.Provider>
  )
}

// The skeleton tint that reads on the active campaign's surface.
export function useSkeletonVariant() {
  return themeFor(useCampaign().theme).skeleton || ''
}
