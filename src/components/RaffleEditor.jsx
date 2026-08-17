import { useState } from 'react'
import { parsePH, toPHInputValue } from '../lib/datetime'

// ============================================================================
// RAFFLE EDITOR — the admin form that replaced the spreadsheet.
// ============================================================================
// When raffles lived in the Google Sheet, launching one meant adding a row and
// nothing else — no deploy, no developer. Moving them into the database would
// have cost that if the only way to write a raffle were the Supabase table
// editor, which is a raw database UI you'd have to hand out logins for. This
// form keeps the old workflow: fill it in, hit save, the raffle is live.

// Admin chrome is deliberately plain — see the header comment in
// pages/AdminRaffles.jsx for why this tool doesn't wear the site's theme.
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

// Turn a title into a usable slug so nobody has to think about the format.
// Only ever used to prefill a NEW raffle — editing the slug of a live one would
// be silently harmless now (entries join on id), but it still appears in every
// export, so we leave existing values alone.
const slugify = (title) =>
  String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

const BLANK = {
  slug: '',
  title: '',
  campaign: '',
  blurb: '',
  prize: '',
  mechanics: '',
  image_url: '',
  sponsor: '',
  sponsor_logo_url: '',
  opens: '',
  closes: '',
  announcement: '',
  winners: '',
  proof_label: '',
  note: '',
  active: true,
  one_entry_per_platform: false,
}

// Database row → form values. Timestamps become PH wall-clock strings for the
// datetime-local inputs; see toPHInputValue for why that conversion is explicit.
function toForm(raffle) {
  if (!raffle) return BLANK
  return {
    ...BLANK,
    ...raffle,
    opens: raffle.opens ? toPHInputValue(new Date(raffle.opens)) : '',
    closes: raffle.closes ? toPHInputValue(new Date(raffle.closes)) : '',
    blurb: raffle.blurb || '',
    prize: raffle.prize || '',
    mechanics: raffle.mechanics || '',
    image_url: raffle.image_url || '',
    sponsor: raffle.sponsor || '',
    sponsor_logo_url: raffle.sponsor_logo_url || '',
    announcement: raffle.announcement || '',
    winners: raffle.winners || '',
    proof_label: raffle.proof_label || '',
    note: raffle.note || '',
    campaign: raffle.campaign || '',
  }
}

// Form values → database row. The datetime-local values are read as Philippine
// time no matter where the admin is sitting, so a deadline doesn't shift when
// somebody abroad edits the raffle.
function toRow(form) {
  const trimmed = (v) => (String(v || '').trim() ? String(v).trim() : null)
  return {
    slug: String(form.slug).trim(),
    title: String(form.title).trim(),
    campaign: trimmed(form.campaign),
    blurb: trimmed(form.blurb),
    prize: trimmed(form.prize),
    mechanics: trimmed(form.mechanics),
    image_url: trimmed(form.image_url),
    sponsor: trimmed(form.sponsor),
    sponsor_logo_url: trimmed(form.sponsor_logo_url),
    opens: form.opens ? parsePH(form.opens).toISOString() : null,
    closes: form.closes ? parsePH(form.closes).toISOString() : null,
    announcement: trimmed(form.announcement),
    winners: trimmed(form.winners),
    proof_label: trimmed(form.proof_label),
    note: trimmed(form.note),
    active: Boolean(form.active),
    one_entry_per_platform: Boolean(form.one_entry_per_platform),
  }
}

export default function RaffleEditor({ raffle, campaigns = [], onSave, onCancel }) {
  const [form, setForm] = useState(() => toForm(raffle))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const isNew = !raffle?.id
  const set = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((f) => {
      // Prefill the slug from the title while creating, until someone types
      // their own — then stop touching it.
      if (key === 'title' && isNew && (!f.slug || f.slug === slugify(f.title))) {
        return { ...f, title: value, slug: slugify(value) }
      }
      return { ...f, [key]: value }
    })
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const err = await onSave(toRow(form), raffle?.id)
    setBusy(false)
    if (err) setError(err)
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-slate-200 bg-white p-6"
    >
      <h2 className="text-lg font-semibold tracking-tight">
        {isNew ? 'New raffle' : `Edit ${raffle.title}`}
      </h2>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Title *">
          <input required value={form.title} onChange={set('title')} className={inputClass} />
        </Field>

        <Field label="Slug *" hint="Lowercase, hyphens only. Appears in exports.">
          <input
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            value={form.slug}
            onChange={set('slug')}
            className={inputClass}
          />
        </Field>

        <Field
          label="Campaign"
          hint="Decides the series name, sponsor, and look. Manage these in the Campaigns tab."
        >
          <select value={form.campaign} onChange={set('campaign')} className={inputClass}>
            <option value="">— none —</option>
            {campaigns.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Blurb" hint="One line under the title." wide>
          <input value={form.blurb} onChange={set('blurb')} className={inputClass} />
        </Field>

        <Field label="Prize" hint="One item per line.">
          <textarea rows={3} value={form.prize} onChange={set('prize')} className={inputClass} />
        </Field>

        <Field label="Mechanics" hint="One step per line. Numbering is added for you.">
          <textarea
            rows={3}
            value={form.mechanics}
            onChange={set('mechanics')}
            className={inputClass}
          />
        </Field>

        <Field label="Prize image URL" hint="Leave blank if there's no real prize photo.">
          <input
            type="url"
            value={form.image_url}
            onChange={set('image_url')}
            className={inputClass}
          />
        </Field>

        <Field label="Sponsor">
          <input value={form.sponsor} onChange={set('sponsor')} className={inputClass} />
        </Field>

        <Field label="Sponsor logo URL" hint="Must be a direct image link, not a web page." wide>
          <input
            type="url"
            value={form.sponsor_logo_url}
            onChange={set('sponsor_logo_url')}
            className={inputClass}
          />
        </Field>

        <Field label="Opens" hint="Philippine time.">
          <input
            type="datetime-local"
            value={form.opens}
            onChange={set('opens')}
            className={inputClass}
          />
        </Field>

        <Field label="Closes" hint="Philippine time. Entries are refused outside this window.">
          <input
            type="datetime-local"
            value={form.closes}
            onChange={set('closes')}
            className={inputClass}
          />
        </Field>

        <Field
          label="Winners announced"
          hint="Free text, e.g. “August 17 via Facebook Live”."
          wide
        >
          <input
            value={form.announcement}
            onChange={set('announcement')}
            className={inputClass}
          />
        </Field>

        <Field
          label="Winners (manual)"
          hint="Usually leave blank — tick Winner on the entries themselves instead, which links each name to their post. Use this only for winners who aren't in the entries list. One per line; add “| https://…” to link a name."
          wide
        >
          <textarea rows={2} value={form.winners} onChange={set('winners')} className={inputClass} />
        </Field>

        <Field label="Proof field label" hint="Default: “Link to your post (proof of entry)”.">
          <input
            value={form.proof_label}
            onChange={set('proof_label')}
            className={inputClass}
          />
        </Field>

        <Field label="Note" hint="Fine print under the entry form.">
          <input value={form.note} onChange={set('note')} className={inputClass} />
        </Field>
      </div>

      <label className="mt-6 flex items-start gap-3">
        <input
          type="checkbox"
          checked={form.one_entry_per_platform}
          onChange={set('one_entry_per_platform')}
          className="mt-0.5 h-4 w-4 accent-slate-900"
        />
        <span className="text-sm text-slate-700">
          One entry per platform
          <span className="ml-2 text-xs text-slate-500">
            — lets someone enter up to four times, once each on Facebook, X, Instagram
            and TikTok, with a different post each time. Off means one entry per person
            for the whole raffle.
          </span>
        </span>
      </label>

      <label className="mt-4 flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.active}
          onChange={set('active')}
          className="h-4 w-4 accent-slate-900"
        />
        <span className="text-sm text-slate-700">
          Active
          <span className="ml-2 text-xs text-slate-500">
            — untick to retire this raffle to the archive whatever its dates say
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
        <button type="submit" disabled={busy} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60">
          {busy ? 'Saving…' : isNew ? 'Create raffle' : 'Save changes'}
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
