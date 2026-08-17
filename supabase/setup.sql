-- ============================================================================
-- RAFFLES — Supabase setup
-- ============================================================================
-- Run this ONCE in your Supabase project: SQL Editor → New query → paste → Run.
--
-- ⚠ If you already ran an earlier version of this file, uncomment the two DROP
--   lines directly below first. They destroy existing entries — fine before
--   launch while everything is test data, NOT fine once real ARMYs have entered.
--
-- drop table if exists public.raffle_entries;
-- drop table if exists public.raffles;
--
--
-- THE SECURITY MODEL, IN ONE PARAGRAPH
-- ------------------------------------
-- The anon key ships inside the public JavaScript bundle. That is by design and
-- is not a leak — but it means the key is NOT what protects entrants' data. The
-- row-level security policies below are. Raffle *content* is world-readable
-- (it's a public web page). Raffle *entries* can be written by anyone and read
-- by nobody except an account listed in `admins`. There is a verification query
-- at the end of this file — run it after any policy change.

-- ============================================================================
-- 1. ADMINS — who may see entrant data
-- ============================================================================
-- Deliberately NOT a copy of auth.users: Supabase already stores identity,
-- passwords, and sessions there. This table answers a different question —
-- "is this signed-in person allowed to read people's phone numbers?" — so that
-- merely holding an account isn't enough. If sign-ups ever get enabled on this
-- project for any reason, strangers still can't read a single entry.
--
-- There is no INSERT policy on purpose. Admins are added from the Supabase
-- dashboard (which uses the service role and bypasses RLS), so the admin list
-- can never be edited through the public API, even by another admin.

create table if not exists public.admins (
  user_id  uuid primary key references auth.users (id) on delete cascade,
  email    text,
  added_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- SECURITY DEFINER so the function can read `admins` while evaluating a policy
-- on another table, without needing a readable-to-all policy on `admins` itself.
create or replace function public.is_admin()
  returns boolean
  language sql
  security definer
  stable
  set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admins can see the admin list" on public.admins;
create policy "admins can see the admin list"
  on public.admins for select
  to authenticated
  using (public.is_admin());

-- ============================================================================
-- 2. RAFFLES — the content that used to live in the Google Sheet
-- ============================================================================

create table if not exists public.raffles (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  -- Human-readable handle. No longer the join key — entries point at `id` — but
  -- kept because it reads far better than a UUID in a CSV export or a bug report.
  slug          text not null unique
                check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

  title         text not null check (char_length(title) between 1 and 200),

  -- Which sponsored campaign this raffle belongs to, e.g. 'seven-with-you'.
  -- Purely a pointer: what the campaign LOOKS like is defined in code
  -- (src/data/campaigns.js), because a theme is more than a few colours and
  -- injecting CSS from a table would be both fragile and unsafe. An unknown or
  -- empty value falls back to the primary campaign's look rather than breaking.
  campaign      text,

  blurb         text,
  prize         text,   -- one item per line
  mechanics     text,   -- one step per line
  image_url     text,
  sponsor       text,
  sponsor_logo_url text,

  -- Real timestamps now, not strings parsed in the browser. Stored as UTC;
  -- the admin form reads and writes them as Philippine wall-clock time.
  opens         timestamptz,
  closes        timestamptz,

  announcement  text,   -- free text: when/where winners get announced
  winners       text,   -- filling this in retires the raffle to the archive
  proof_label   text,
  note          text,

  -- Unticking retires a raffle to the archive whatever its dates say.
  active        boolean not null default true,

  constraint raffles_closes_after_opens
    check (opens is null or closes is null or closes > opens)
);

alter table public.raffles enable row level security;

-- Raffle content is a public web page — anyone may read it. This grants no
-- access whatsoever to `raffle_entries`, which is a separate table with its own
-- policies below.
drop policy if exists "anyone can read raffles" on public.raffles;
create policy "anyone can read raffles"
  on public.raffles for select
  to anon, authenticated
  using (true);

-- Only admins create or change raffles, through the dashboard.
drop policy if exists "admins manage raffles" on public.raffles;
create policy "admins manage raffles"
  on public.raffles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- 3. ENTRIES
-- ============================================================================

create table if not exists public.raffle_entries (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  -- ON DELETE RESTRICT, not CASCADE: deleting a raffle must not silently take
  -- hundreds of people's entries with it. Retire raffles with `active`.
  raffle_id     uuid not null references public.raffles (id) on delete restrict,

  name          text not null check (char_length(name) between 1 and 200),
  email         text not null check (char_length(email) between 3 and 320),
  contact       text not null check (char_length(contact) between 1 and 50),
  social_link   text not null check (char_length(social_link) between 1 and 500),
  platform      text not null check (platform in ('Facebook', 'X', 'Instagram', 'TikTok')),
  proof         text not null check (char_length(proof) between 1 and 500),

  -- Normalised post link for duplicate detection. The same post shared from a
  -- different app arrives with different tracking params (…/status/123?s=20 vs
  -- …/status/123), so exact matching would miss obvious repeats.
  proof_key     text generated always as (
                  lower(regexp_replace(split_part(proof, '?', 1), '/+$', ''))
                ) stored,

  -- Set by an admin to disqualify an entry. NULL means the entry counts.
  invalid_reason text check (invalid_reason is null or char_length(invalid_reason) between 1 and 300),
  invalidated_at timestamptz
);

-- Hard duplicate blocks, enforced by the database rather than by trusting the
-- browser. A violation reaches the entry form as HTTP 409, which it turns into a
-- plain-language message. The per-person/per-platform email rule lives in
-- section 3c below; this one stops the same POST being submitted twice, which is
-- true of every raffle.
create unique index if not exists raffle_entries_one_per_post
  on public.raffle_entries (raffle_id, proof_key);

create index if not exists raffle_entries_by_raffle
  on public.raffle_entries (raffle_id, created_at desc);

alter table public.raffle_entries enable row level security;

-- Anyone may enter — but ONLY a raffle that is genuinely open right now.
--
-- This is the part a slug couldn't give us. Closing time used to exist only in
-- the page's JavaScript, so anyone could POST an entry to a finished raffle
-- straight at the API and it would be accepted. Now the database checks the
-- window itself, and a late or early entry is impossible rather than merely
-- discouraged.
drop policy if exists "anon can submit an entry" on public.raffle_entries;
create policy "anon can submit an entry"
  on public.raffle_entries for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.raffles r
      where r.id = raffle_id
        and r.active
        and r.winners is null
        and (r.opens is null or now() >= r.opens)
        and (r.closes is null or now() < r.closes)
    )
  );

-- Only admins read entries. This is the policy that keeps entrants' names,
-- emails, and phone numbers private — never widen it to `anon`.
drop policy if exists "admins can read entries" on public.raffle_entries;
create policy "admins can read entries"
  on public.raffle_entries for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admins can flag entries" on public.raffle_entries;
create policy "admins can flag entries"
  on public.raffle_entries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- No delete policy: entries are append-only, so a mis-click can't destroy
-- someone's entry. Disqualify with invalid_reason instead.

-- ============================================================================
-- 3b. MIGRATIONS — columns added after the first release
-- ============================================================================
-- `create table if not exists` above does nothing to a table that already
-- exists, so every column added later needs an explicit, idempotent ALTER here.
-- Safe to re-run; run this file again in each project after pulling changes.

alter table public.raffles
  add column if not exists campaign text;

-- A snapshot of the drawn winners: [{ "name": "...", "proof": "https://..." }].
--
-- Why a copy rather than reading raffle_entries directly: the public page cannot
-- read that table, by design — anon SELECT is what would expose every entrant's
-- email and phone number. Rather than widening that policy for the handful of
-- rows that won, marking a winner copies ONLY their display name and post link
-- onto the raffle, which is already world-readable. Nothing private can leak
-- through a column that never held anything private.
alter table public.raffles
  add column if not exists winner_entries jsonb;

-- Which entries an admin has marked as winners. Drives the snapshot above.
alter table public.raffle_entries
  add column if not exists is_winner boolean not null default false;

-- Lets one person enter once per social platform (up to four times) instead of
-- once in total. Off by default, so existing raffles keep their old rule.
alter table public.raffles
  add column if not exists one_entry_per_platform boolean not null default false;

-- Entrant-supplied links must be real web links. The form marks these fields
-- type="url", but that's a browser convenience — anyone can POST at the API and
-- skip it. Both values end up in an href: in the dashboard, and (for winners) on
-- the public page. `javascript:…` is a valid URL, and the person most likely to
-- click a "Post" link is an admin, in a session that can read every entrant's
-- contact details. The app refuses non-http(s) schemes when rendering too; this
-- stops them ever being stored.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'raffle_entries_http_links') then
    alter table public.raffle_entries
      add constraint raffle_entries_http_links check (
        proof ~* '^https?://' and social_link ~* '^https?://'
      ) not valid;   -- NOT VALID: applies to new rows without failing on old ones
  end if;
end $$;

-- ============================================================================
-- 3c. CAMPAIGNS — a sponsored series of raffles
-- ============================================================================
-- SEVEN WITH YOU is one: seven giveaways backed by Visa. The sponsor lives here
-- rather than on each raffle because it's a fact about the SERIES — putting it on
-- every raffle row would mean seven copies to keep in step, and a page showing
-- the wrong sponsor the day somebody misses one.
--
-- CONTENT lives in this table; DESIGN lives in src/data/campaigns.js, keyed by
-- the `theme` column. That split is deliberate: a sponsor's name and logo should
-- be changeable by whoever runs the campaign, while the palette and background
-- need design work and a deploy regardless.

create table if not exists public.campaigns (
  slug         text primary key
               check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name         text not null check (char_length(name) between 1 and 120),
  tagline      text,
  eyebrow      text,

  -- Shown in the header of the series index AND of every raffle in the campaign,
  -- for the campaign's whole life. An individual raffle naming its own sponsor
  -- overrides this on that page only.
  sponsor          text,
  sponsor_logo_url text,

  -- Key into the THEMES map in src/data/campaigns.js. An unknown value falls back
  -- to the default look rather than rendering an unstyled page.
  theme        text not null default 'galaxy',

  -- Which campaign /raffle lands on. Only one should be true.
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.campaigns enable row level security;

-- Campaign content is public page furniture — no personal data of any kind.
drop policy if exists "anyone can read campaigns" on public.campaigns;
create policy "anyone can read campaigns"
  on public.campaigns for select
  to anon, authenticated
  using (true);

drop policy if exists "admins manage campaigns" on public.campaigns;
create policy "admins manage campaigns"
  on public.campaigns for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Seed the current campaign, then point existing raffles at it. `on conflict do
-- nothing` keeps your edits when this file is re-run.
insert into public.campaigns (slug, name, tagline, eyebrow, sponsor, theme, is_primary)
values (
  'seven-with-you',
  'Seven With You',
  'A series of ARMY giveaways for each BTS member''s birthday.',
  'Concert Initiative · ARMY Giveaways',
  'Visa',
  'galaxy',
  true
)
on conflict (slug) do nothing;

update public.raffles set campaign = 'seven-with-you'
where campaign is null or campaign = '';

-- Referential integrity, the same reason entries point at a raffle's id: a typo
-- in the campaign field should fail loudly instead of silently unstyling a page.
-- SET NULL rather than CASCADE — deleting a campaign must not delete raffles.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'raffles_campaign_fkey'
  ) then
    alter table public.raffles
      add constraint raffles_campaign_fkey
      foreign key (campaign) references public.campaigns (slug)
      on update cascade on delete set null;
  end if;
end $$;

-- ============================================================================
-- 3d. ENTRY LIMIT — one per person, or one per platform
-- ============================================================================
-- The unique index below is (raffle_id, email, platform), which by itself allows
-- four entries per person. Raffles that want the stricter "one entry, full stop"
-- rule are enforced by the trigger after it.
--
-- Why not two different indexes? An index can't be conditional on a value in a
-- DIFFERENT table (the raffle's setting), so the strict case needs a trigger.

drop index if exists public.raffle_entries_one_per_email;

create unique index if not exists raffle_entries_one_per_email_platform
  on public.raffle_entries (raffle_id, lower(email), platform);

-- SECURITY DEFINER so it can see existing entries while running inside an
-- anonymous INSERT. Without it, row-level security would hide every row from the
-- check and the limit would never fire.
--
-- It also forces the admin-only columns to safe values. This matters more than
-- it looks: the INSERT policy is ROW-level — it decides *whether* a row may be
-- written, never *which columns* the writer may set — and `anon` holds INSERT on
-- the whole table. Without this an entrant could POST `is_winner: true` with
-- their entry. Nothing publishes it on its own, but the dashboard builds the
-- public winners snapshot from every flagged row, so the next time an admin
-- ticked anybody, the self-flagged entrant would be published as a winner too.
create or replace function public.enforce_entry_limit()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  per_platform boolean;
begin
  -- Admin-only fields, regardless of what the client sent.
  new.is_winner      := false;
  new.invalid_reason := null;
  new.invalidated_at := null;
  new.created_at     := now();

  select r.one_entry_per_platform into per_platform
  from public.raffles r where r.id = new.raffle_id;

  -- Multi-platform raffles rely on the unique index alone.
  if coalesce(per_platform, false) then
    return new;
  end if;

  if exists (
    select 1 from public.raffle_entries e
    where e.raffle_id = new.raffle_id
      and lower(e.email) = lower(new.email)
  ) then
    -- 23505 is what the entry form already reads as "you've entered before", so
    -- reusing it means the browser needs no new error handling.
    raise exception using
      errcode = '23505',
      message = 'duplicate key value violates unique constraint "raffle_entries_one_per_email"';
  end if;

  return new;
end;
$$;

drop trigger if exists raffle_entries_entry_limit on public.raffle_entries;
create trigger raffle_entries_entry_limit
  before insert on public.raffle_entries
  for each row execute function public.enforce_entry_limit();

-- ============================================================================
-- 4. REALTIME — the dashboard's live updates
-- ============================================================================
-- Realtime respects RLS, so only admins ever receive these payloads.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public'
      and tablename = 'raffle_entries'
  ) then
    alter publication supabase_realtime add table public.raffle_entries;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public'
      and tablename = 'raffles'
  ) then
    alter publication supabase_realtime add table public.raffles;
  end if;
end $$;

-- ============================================================================
-- 5. ADD YOURSELF AS AN ADMIN
-- ============================================================================
-- First create the account: Authentication → Users → Add user. Then run this
-- with that address. Repeat per admin. Without this, signing in succeeds but
-- the dashboard shows nothing — which is the policies working correctly.

-- insert into public.admins (user_id, email)
-- select id, email from auth.users where email = 'you@example.com'
-- on conflict (user_id) do nothing;

-- ============================================================================
-- 6. VERIFY — run after setup and after ANY policy change
-- ============================================================================
-- Expected:
--   admins          SELECT  {authenticated}
--   raffle_entries  INSERT  {anon,authenticated}   ← the only anon write
--   raffle_entries  SELECT  {authenticated}
--   raffle_entries  UPDATE  {authenticated}
--   campaigns       ALL     {authenticated}
--   campaigns       SELECT  {anon,authenticated}   ← public content, no PII
--   raffles         ALL     {authenticated}
--   raffles         SELECT  {anon,authenticated}   ← public content, no PII
--
-- The one that matters: if `anon` EVER appears on a raffle_entries SELECT row,
-- every entrant's name, email and phone number is downloadable by the public at
-- that moment. Nothing else on this list is as consequential.

select tablename, cmd, roles, policyname
from pg_policies
where schemaname = 'public'
  and tablename in ('admins', 'campaigns', 'raffles', 'raffle_entries')
order by tablename, cmd, policyname;

-- A second check worth running: confirm anon cannot read entries even though it
-- can insert them. Expect 0 rows — it is the same query the public API runs.
set role anon;
select count(*) as entries_visible_to_the_public from public.raffle_entries;
reset role;
