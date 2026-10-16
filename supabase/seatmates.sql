-- ============================================================================
-- SEATMATE FINDER — Supabase setup
-- ============================================================================
-- Run this in each Supabase project (preview first, then production): SQL
-- Editor → New query → paste → Run. Safe to re-run. It needs setup.sql to have
-- been run first, for public.is_admin().
--
-- HOW IT WORKS
-- ------------
-- Someone on /seat-view enters their bleacher seat, a display name and a social
-- handle, and presses "Find my seatmates". That saves their seat here and shows
-- them anyone already saved in the seat directly either side of them: same day,
-- section and row, seat number one either way. Nobody else's seat is ever
-- shown, and there is no list to browse.
--
-- THE SECURITY MODEL
-- ------------------
-- The table itself is closed to the public: no anon SELECT, INSERT or DELETE.
-- The page can only call the three functions below, which run with the
-- table owner's rights and each do one narrow thing:
--   find_seatmates   save my seat, then show me my two neighbours
--   my_seatmates     show my two neighbours again, given my private key
--   remove_seatmate  delete my entry, given my private key
-- The private key is made in the visitor's browser and only its SHA-256 hash
-- is stored, so a leaked table wouldn't let anyone remove other people.
--
-- WHAT IT CAN'T STOP
-- ------------------
-- Tickets aren't checked, so anyone can claim any seat. Someone determined
-- could claim seat after seat to collect the names and handles of people who
-- joined. Every claim they make is a row here with their own details on it, so
-- it's visible and removable, but it isn't prevented. Admins can read and
-- delete entries (section 3).

create extension if not exists pgcrypto with schema extensions;

-- ============================================================================
-- 1. THE TABLE
-- ============================================================================
-- Seat numbers are stored exactly as printed on the ticket. Most sections are
-- numbered on from the one before, some restart at 1, and the count per section
-- varies — so "the seat beside you" is matched within your own section and row
-- (seat ± 1), which holds whichever way a section is numbered. The one match
-- this misses is across the aisle into the next section.

create table if not exists public.seatmates (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  day             smallint not null check (day between 1 and 3),
  tier            smallint not null check (tier between 1 and 2),
  section         smallint not null
                    check (section between 101 and 146 or section between 201 and 246),
  row_no          smallint not null check (row_no between 1 and 12),
  seat            smallint not null,
  name            text not null check (char_length(name) between 1 and 40),
  -- Letters, numbers, dots and underscores only: it ends up in a profile link.
  handle          text not null check (handle ~ '^[A-Za-z0-9._]{1,30}$'),
  platform        text not null check (platform in ('X', 'Threads', 'Instagram', 'TikTok')),
  remove_key_hash text not null check (char_length(remove_key_hash) = 64)
);

-- Changes for a table made by an earlier version of this file, which had no
-- section column and only allowed seats 1–1,104. Safe to re-run.
alter table public.seatmates add column if not exists section smallint;
-- Old entries get the section their seat number placed them in back then.
update public.seatmates
  set section = tier * 100 + least(46, (seat - 1) / 24 + 1)
  where section is null;
alter table public.seatmates alter column section set not null;
alter table public.seatmates drop constraint if exists seatmates_seat_check;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'seatmates_seat_range') then
    alter table public.seatmates add constraint seatmates_seat_range check (seat between 1 and 3000);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'seatmates_section_range') then
    alter table public.seatmates add constraint seatmates_section_range
      check (section between 101 and 146 or section between 201 and 246);
  end if;
end $$;
drop index if exists public.seatmates_one_per_person;
drop index if exists public.seatmates_by_seat;

-- The same handle can't be saved twice for the same seat and day.
create unique index if not exists seatmates_one_per_person_v2
  on public.seatmates (day, section, row_no, seat, platform, lower(handle));

create index if not exists seatmates_by_seat_v2
  on public.seatmates (day, section, row_no, seat);

alter table public.seatmates enable row level security;

-- Nothing for anon. Signed-in admins can read and remove, nothing else.
revoke all on public.seatmates from anon, authenticated;
grant select, delete on public.seatmates to authenticated;

drop policy if exists "admins can read seatmates" on public.seatmates;
create policy "admins can read seatmates"
  on public.seatmates for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admins can remove seatmates" on public.seatmates;
create policy "admins can remove seatmates"
  on public.seatmates for delete
  to authenticated
  using (public.is_admin());

-- ============================================================================
-- 1b. SPAM CAPS
-- ============================================================================
-- Checked inside find_seatmates on every NEW save (renaming your own entry
-- doesn't count), so they hold even for someone calling the API directly.
-- Change the numbers here and re-run this file to adjust them.
--
--   per seat    at most 3 entries in one seat, per day
--   per handle  one handle can hold at most 2 seats, per day
--   per device  at most 20 new saves an hour from one internet connection.
--               Generous on purpose: Filipino mobile carriers put many
--               people behind one shared address.
--   fuse        no new entries at all past 150,000, so a flood can't fill the
--               free database (which the raffle shares)
--
-- For the per-device cap, only a SHA-256 hash of the connection's address is
-- kept, and each one is deleted a day later. Raw addresses are never stored.

create table if not exists public.seatmate_saves (
  device_hash text not null,
  saved_at    timestamptz not null default now()
);
create index if not exists seatmate_saves_by_device
  on public.seatmate_saves (device_hash, saved_at);

alter table public.seatmate_saves enable row level security;
revoke all on public.seatmate_saves from anon, authenticated;

create or replace function public.seatmate_caps()
returns table (per_seat int, per_handle int, per_device_hour int, total int)
language sql
immutable
as $$ select 3, 2, 20, 150000 $$;

-- ============================================================================
-- 2. THE FUNCTIONS THE PAGE CALLS
-- ============================================================================

-- The two neighbours of a saved entry, as a JSON list of
-- { seat, name, handle, platform }. Shared by the two functions below.
create or replace function public.seatmates_beside(p_entry public.seatmates)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'seat', s.seat, 'name', s.name, 'handle', s.handle, 'platform', s.platform
         ) order by s.seat), '[]'::jsonb)
  from public.seatmates s
  where s.day = p_entry.day
    and s.section = p_entry.section
    and s.row_no = p_entry.row_no
    and s.seat in (p_entry.seat - 1, p_entry.seat + 1);
$$;

-- Saves a seat and returns { id, seatmates }. Any seat number from 1 to 3,000
-- is accepted: numbering varies too much between sections to check it.
create or replace function public.find_seatmates(
  p_day int, p_section int, p_row int, p_seat int,
  p_name text, p_handle text, p_platform text, p_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_tier int := p_section / 100;
  v_number int := p_section % 100;
  v_handle text := regexp_replace(trim(coalesce(p_handle, '')), '^@+', '');
  v_hash text := encode(digest(coalesce(p_key, ''), 'sha256'), 'hex');
  v_entry public.seatmates;
  v_caps record;
  v_address text;
  v_device text;
begin
  if v_tier not in (1, 2) or v_number not between 1 and 46 or p_seat not between 1 and 3000 then
    raise exception 'seat_not_in_section';
  end if;
  if char_length(coalesce(p_key, '')) < 20 then
    raise exception 'bad_key';
  end if;

  select * into v_entry
  from public.seatmates
  where day = p_day and section = p_section and row_no = p_row and seat = p_seat
    and platform = p_platform and lower(handle) = lower(v_handle);

  if found then
    -- Already saved. The same browser (same key) can update its name; anyone
    -- else trying the same handle in the same seat is turned away.
    if v_entry.remove_key_hash <> v_hash then
      raise exception 'already_registered';
    end if;
    update public.seatmates set name = trim(p_name) where id = v_entry.id
    returning * into v_entry;
  else
    -- A new save: the caps apply.
    select * into v_caps from public.seatmate_caps();

    if (select count(*) from public.seatmates) >= v_caps.total then
      raise exception 'finder_full';
    end if;
    if (select count(*) from public.seatmates
        where day = p_day and section = p_section and row_no = p_row and seat = p_seat) >= v_caps.per_seat then
      raise exception 'seat_full';
    end if;
    if (select count(*) from public.seatmates
        where day = p_day and platform = p_platform and lower(handle) = lower(v_handle)) >= v_caps.per_handle then
      raise exception 'handle_limit';
    end if;

    -- The visitor's address, as Supabase passes it on: the first entry of
    -- X-Forwarded-For. Without one (a direct database call) there's no
    -- per-device cap to apply.
    v_address := nullif(trim(split_part(
      coalesce(current_setting('request.headers', true), '{}')::json ->> 'x-forwarded-for', ',', 1)), '');
    if v_address is not null then
      v_device := encode(digest('seatmates:' || v_address, 'sha256'), 'hex');
      delete from public.seatmate_saves where saved_at < now() - interval '1 day';
      if (select count(*) from public.seatmate_saves
          where device_hash = v_device and saved_at > now() - interval '1 hour') >= v_caps.per_device_hour then
        raise exception 'too_many_saves';
      end if;
      insert into public.seatmate_saves (device_hash) values (v_device);
    end if;

    insert into public.seatmates (day, tier, section, row_no, seat, name, handle, platform, remove_key_hash)
    values (p_day, v_tier, p_section, p_row, p_seat, trim(p_name), v_handle, p_platform, v_hash)
    returning * into v_entry;
  end if;

  return jsonb_build_object('id', v_entry.id, 'seatmates', public.seatmates_beside(v_entry));
end;
$$;

-- Checks again for an entry already saved: { id, seatmates }, or null if the
-- entry is gone (removed by its owner or an admin) or the key is wrong.
create or replace function public.my_seatmates(p_id uuid, p_key text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_entry public.seatmates;
begin
  select * into v_entry from public.seatmates
  where id = p_id and remove_key_hash = encode(digest(coalesce(p_key, ''), 'sha256'), 'hex');
  if not found then
    return null;
  end if;
  return jsonb_build_object('id', v_entry.id, 'seatmates', public.seatmates_beside(v_entry));
end;
$$;

-- Deletes an entry, given its private key. True if something was removed.
create or replace function public.remove_seatmate(p_id uuid, p_key text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  delete from public.seatmates
  where id = p_id and remove_key_hash = encode(digest(coalesce(p_key, ''), 'sha256'), 'hex');
  return found;
end;
$$;

-- Only the three page functions are callable from the site; the helper isn't.
revoke all on function public.seatmates_beside(public.seatmates) from public, anon, authenticated;
revoke all on function public.find_seatmates(int, int, int, int, text, text, text, text) from public;
revoke all on function public.my_seatmates(uuid, text) from public;
revoke all on function public.remove_seatmate(uuid, text) from public;
grant execute on function public.find_seatmates(int, int, int, int, text, text, text, text) to anon, authenticated;
grant execute on function public.my_seatmates(uuid, text) to anon, authenticated;
grant execute on function public.remove_seatmate(uuid, text) to anon, authenticated;

-- ============================================================================
-- 3. ADMIN
-- ============================================================================
-- To see or remove entries, use Table Editor → seatmates in the dashboard, or:
--
--   select created_at, day, section, row_no, seat, name, handle, platform
--   from public.seatmates order by created_at desc;
--
--   delete from public.seatmates where lower(handle) = 'somehandle';
--
-- If the fuse is hit (the finder says it's full), check what filled it before
-- raising the limit in seatmate_caps().

-- ============================================================================
-- 4. VERIFY
-- ============================================================================
-- Expect false on all three: the public can't read or write either table
-- directly, only through the functions above.
select
  has_table_privilege('anon', 'public.seatmates', 'select') as public_can_read,
  has_table_privilege('anon', 'public.seatmates', 'insert') as public_can_write,
  has_table_privilege('anon', 'public.seatmate_saves', 'select') as public_can_read_saves;
