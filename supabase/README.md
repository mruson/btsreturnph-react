# Supabase setup — raffles & entries

One-time setup, ~15 minutes. Everything here is done in the Supabase dashboard;
nothing needs the CLI.

At the end you'll have: a database holding raffles and entries, an admin account
that can see them, and a site that can write entries but never read them back.

---

## Two projects: preview and production

Run **everything below twice** — once for a preview project and once for
production. They are entirely separate databases: separate raffles, separate
entries, and **separate admin accounts** (an account created in one does not
exist in the other).

Which one the site talks to is decided from the hostname at runtime, so there is
no flag to set and no way to point a build at the wrong database:

| Where the site is running | Database |
|---|---|
| `www.btsreturnph.com` / `btsreturnph.com` | **production** |
| Netlify draft URLs (`…--celadon-pavlova-…netlify.app`) | preview |
| `localhost` | preview |
| anything else | preview |

The same `dist/` is therefore correct whether you deploy it to a draft URL or to
production — which is what makes `netlify deploy --dir=dist` and
`netlify deploy --dir=dist --prod` safe to run off one build.

Put each project's URL and anon key in the matching slot in
[`../src/data/supabase.js`](../src/data/supabase.js). The admin dashboard shows a
dark **"Preview database"** banner whenever it isn't talking to production, so
you can always tell which set of entries you're looking at.

---

## 1. Create the project

1. Sign up at [supabase.com](https://supabase.com) and click **New project**.
2. Fill in:
   - **Name** — `btsreturnph` (anything)
   - **Database password** — generate one and **save it in your password
     manager**. You won't need it for this app (the site uses the API, not a
     direct connection), but it's the only way to reach the database directly
     later, and it can't be recovered — only reset.
   - **Region** — **Southeast Asia (Singapore)**. This is the closest region to
     the Philippines; picking a US region adds a few hundred milliseconds to
     every entry submission for no reason.
3. Wait ~2 minutes while it provisions.

> **Free tier, worth knowing:** projects pause after ~1 week with no activity,
> and a paused project means the raffle page can't load. Any traffic counts as
> activity, so a live raffle keeps it awake — but if you go a month between
> raffles, open the dashboard and resume it *before* you announce the next one.

---

## 2. Create the tables and security policies

1. Left sidebar → **SQL Editor** → **New query**.
2. Paste the entire contents of [`setup.sql`](./setup.sql) and click **Run**.
   - First time: leave the two `drop table` lines at the top commented out.
   - Re-running after a schema change: uncomment them **only** if you're willing
     to lose every entry. Fine before launch, never afterwards.
3. The script ends with a verification query. Check its output against the table
   in the comment above it. The row that matters:

   | tablename | cmd | roles |
   |---|---|---|
   | `raffle_entries` | SELECT | `{authenticated}` |

   **If `anon` ever appears on that row, stop.** Every entrant's name, email and
   phone number is publicly downloadable at that moment.

---

## 3. Turn off public sign-ups

Authentication → **Sign In / Providers** → **Email** → turn **off** "Allow new
users to sign up", and save.

Admin accounts are created by hand (next step). Leaving sign-ups on would let
anyone create an account on your project — they still couldn't read entries,
because that needs a row in `admins`, but there's no reason to allow it.

---

## 4. Create your admin account

1. Authentication → **Users** → **Add user** → **Create new user**.
2. Enter an email and password, and **tick "Auto Confirm User"**. Without that
   the account sits unconfirmed and sign-in fails with an unhelpful error.
3. Back in **SQL Editor**, grant it admin rights:

   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'you@example.com'
   on conflict (user_id) do nothing;
   ```

   Repeat steps 1–3 per admin.

> **If you skip step 3**, signing in works but the dashboard shows zero entries
> and zero raffles. That's not a bug — it's the policies correctly refusing an
> account that isn't on the admin list.

---

## 5. Connect the site

Project Settings → **API**. Copy two values into the matching slot in
[`../src/data/supabase.js`](../src/data/supabase.js) — `PROJECTS.preview` or
`PROJECTS.production`:

| Dashboard label | Goes to |
|---|---|
| **Project URL** | `url` |
| **anon** / **public** key (newer projects: *publishable* key) | `anonKey` |

**Never paste the `service_role` / secret key.** It bypasses row-level security
entirely — in a browser bundle it would hand every visitor full read and write
access to entrants' personal data.

The anon key being public is expected and safe: the policies, not the key, are
what protect the data.

---

## 6. Test locally before deploying

```bash
npm run dev
```

1. Open <http://localhost:5173/admin/raffles> and sign in.
2. **Raffles** tab → **+ New raffle**. Give it a title, a prize, mechanics, and
   set **Closes** a few hours in the future so it counts as open.
3. Open <http://localhost:5173/raffle> — your raffle should be live with a
   countdown.
4. Submit a test entry. It should appear in the **Entries** tab within a second,
   without refreshing (the green "Live" dot means the realtime channel is up).
5. Submit the same email again — you should get *"Naka-sali ka na"* rather than a
   second row. Same for reusing the same post link.

Entries submitted from localhost go to the **real** database — there's no
separate dev environment. Mark test entries invalid, or delete them from the
Supabase table editor, before you launch.

---

## 7. Deploy

```bash
npm run build && netlify deploy --dir=dist          # draft URL
npm run build && netlify deploy --dir=dist --prod   # live
```

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Dashboard signs in but shows nothing | No row in `admins` for that user — step 4.3 |
| Sign-in fails on a brand-new account | "Auto Confirm User" wasn't ticked |
| Entry form returns 403 / "new row violates row-level security" | The raffle isn't open: check `active`, `opens`, `closes`, and that `winners` is still blank. Late entries are rejected by the database on purpose. |
| Raffle page shows "Walang raffle sa ngayon" with a raffle you just made | Its `opens` is in the future, `active` is unticked, or `winners` is filled in |
| Everything 404s / "Failed to fetch" | Project paused (free tier) or the URL in `src/data/supabase.js` is wrong |
| Sign-in works on the draft URL but not on the live site | Admin accounts don't carry over — create the account and run the `admins` insert in the production project too |
| Live site says "not configured" | `PROJECTS.production` still holds placeholders |

## Where things live

| File | What it is |
|---|---|
| `setup.sql` | Schema, policies, indexes, realtime — the whole database |
| `../src/data/supabase.js` | Project URL + anon key |
| `../src/lib/raffles.js` | Reading raffles; status lifecycle shared by both views |
| `../src/pages/AdminRaffles.jsx` | Dashboard: entries + raffle management |
| `../src/components/RaffleEditor.jsx` | The form that replaced the spreadsheet |
