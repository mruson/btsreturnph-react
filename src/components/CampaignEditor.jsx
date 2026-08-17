import { useState } from 'react'
import { THEMES, themeKeys } from '../data/campaigns'

// ============================================================================
// CAMPAIGN EDITOR — the sponsored series behind a set of raffles.
// ============================================================================
// This exists so a sponsor's name and logo aren't a developer task. The look is
// still chosen from a fixed list of themes (data/campaigns.js) rather than typed,
// because a palette isn't something to improvise in a text field — but everything
// a campaign manager actually needs to change lives here.

const inputClass =
  'mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900'

const labelClass = 'block text-xs font-medium text-slate-600'

function Field({ label, hint, children, wide = false }) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <label className={labelClass}>
        {label}
        {children}
      </label>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

const slugify = (v) =>
  String(v)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

const BLANK = {
  slug: '',
  name: '',
  tagline: '',
  eyebrow: '',
  sponsor: '',
  sponsor_logo_url: '',
  theme: 'galaxy',
  is_primary: false,
}

const toForm = (c) =>
  c
    ? {
        ...BLANK,
        ...c,
        tagline: c.tagline || '',
        eyebrow: c.eyebrow || '',
        sponsor: c.sponsor || '',
        sponsor_logo_url: c.sponsor_logo_url || '',
      }
    : BLANK

function toRow(form) {
  const trimmed = (v) => (String(v || '').trim() ? String(v).trim() : null)
  return {
    slug: String(form.slug).trim(),
    name: String(form.name).trim(),
    tagline: trimmed(form.tagline),
    eyebrow: trimmed(form.eyebrow),
    sponsor: trimmed(form.sponsor),
    sponsor_logo_url: trimmed(form.sponsor_logo_url),
    theme: String(form.theme || 'galaxy'),
    is_primary: Boolean(form.is_primary),
  }
}

export default function CampaignEditor({ campaign, onSave, onCancel }) {
  const [form, setForm] = useState(() => toForm(campaign))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  // The slug is the key raffles point at, so changing it on a live campaign
  // would orphan them. New campaigns get it prefilled from the name; existing
  // ones can't edit it.
  const isNew = !campaign?.slug

  const set = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((f) => {
      if (key === 'name' && isNew && (!f.slug || f.slug === slugify(f.name))) {
        return { ...f, name: value, slug: slugify(value) }
      }
      return { ...f, [key]: value }
    })
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const err = await onSave(toRow(form), campaign?.slug)
    setBusy(false)
    if (err) setError(err)
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold tracking-tight">
        {isNew ? 'New campaign' : `Edit ${campaign.name}`}
      </h2>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Name *" hint="Shown as the big heading on the raffle pages.">
          <input required value={form.name} onChange={set('name')} className={inputClass} />
        </Field>

        <Field
          label="Slug *"
          hint={
            isNew
              ? 'Lowercase, hyphens only. Raffles point at this.'
              : 'Fixed once raffles reference it.'
          }
        >
          <input
            required
            disabled={!isNew}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            value={form.slug}
            onChange={set('slug')}
            className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-500`}
          />
        </Field>

        <Field label="Eyebrow" hint="Small line above the name." wide>
          <input value={form.eyebrow} onChange={set('eyebrow')} className={inputClass} />
        </Field>

        <Field label="Tagline" hint="One line under the name, on the index." wide>
          <input value={form.tagline} onChange={set('tagline')} className={inputClass} />
        </Field>

        <Field
          label="Sponsor"
          hint="Shown in the header of the index and every raffle in this campaign."
        >
          <input value={form.sponsor} onChange={set('sponsor')} className={inputClass} />
        </Field>

        <Field
          label="Sponsor logo URL"
          hint="Direct image link, not a page that shows the image. Blank shows the name instead. Dark logos read poorly on dark themes — ask for a light version."
        >
          <input
            type="url"
            value={form.sponsor_logo_url}
            onChange={set('sponsor_logo_url')}
            className={inputClass}
          />
        </Field>

        <Field label="Theme" hint="Add new ones in src/data/campaigns.js.">
          <select value={form.theme} onChange={set('theme')} className={inputClass}>
            {themeKeys.map((key) => (
              <option key={key} value={key}>
                {THEMES[key].label || key}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <label className="mt-6 flex items-start gap-3">
        <input
          type="checkbox"
          checked={form.is_primary}
          onChange={set('is_primary')}
          className="mt-0.5 h-4 w-4 accent-slate-900"
        />
        <span className="text-sm text-slate-700">
          Primary campaign
          <span className="ml-2 text-xs text-slate-500">
            — the one <code className="rounded bg-slate-100 px-1">/raffle</code> lands on.
            Only one campaign should have this; ticking it here unticks the others.
          </span>
        </span>
      </label>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {busy ? 'Saving…' : isNew ? 'Create campaign' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
