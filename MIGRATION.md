# Migrating off DigitalOcean

Written 26 Aug 2026, after the DigitalOcean team was terminated and the app,
database, object storage and DNS zone were all destroyed with it.

## The rule this time

**Take permanently-free tiers, not credits.** Credits are what just happened. The
$200 GitHub Student Pack DigitalOcean credit ran out, the team was terminated, and
everything inside it was deleted rather than paused. Azure's $100, MongoDB's $50 and
the rest of the Student Pack credit offers all fail the same way, just later. Every
piece below is free with no clock on it.

Keep the Student Pack for things where expiry is harmless: JetBrains licences,
Sentry, domain vouchers. Not for anything holding your data.

## The replacement stack

| Was | Becomes | Free tier | Notes |
|---|---|---|---|
| DO App Platform | **Vercel Hobby** | permanent | Built by the Next.js team. Zero-config for Next 16, server actions, middleware. Hobby is non-commercial only, a personal portfolio qualifies. |
| DO Managed Postgres | **Neon** | permanent, 0.5 GB | Serverless Postgres. Drop-in for the `postgres` driver and Drizzle already in this repo. |
| DO Spaces | **Cloudflare R2** | permanent, 10 GB | S3-compatible, so the existing `@aws-sdk/client-s3` code mostly carries over. Egress is free, unlike S3. |
| DO DNS | **Cloudflare DNS** | permanent | Required regardless. The old zone is gone and the domain currently resolves nowhere. |
| hello@anurag.studio | **Cloudflare Email Routing** | permanent | Forwards to Gmail. Free, about 5 minutes. |
| Resend | **Resend**, unchanged | 3,000/mo | Account survived. Only needs its DNS records re-added. |

**One caveat on R2:** Cloudflare asks for a payment method on file before enabling it,
even on the free tier. Nothing is charged under the limits. If you would rather not
put a card down, use **Supabase Storage** instead (1 GB free, also S3-compatible, no
card), or skip object storage entirely at first, see step 6.

## Steps

### 1. Get the domain resolving again

The most urgent item. `anurag.studio` currently has no nameserver delegation, so
nothing can be served on it by anyone.

1. Add `anurag.studio` to Cloudflare as a site (free plan).
2. Cloudflare gives you two nameservers.
3. At your registrar, replace the old DigitalOcean nameservers with those two.
4. Propagation is usually well under an hour.

### 2. Put the maintenance page up

See `maintenance/README.md`. Cloudflare Pages, drag-and-drop, then attach
`anurag.studio` and `www.anurag.studio` as custom domains.

### 3. Restore hello@anurag.studio

Cloudflare, **Email**, **Email Routing**. Add a rule forwarding
`hello@anurag.studio` to your Gmail. It writes the MX records itself.

### 4. Database on Neon

1. Create a Neon project, region closest to you.
2. Copy the **pooled** connection string, the one with `-pooler` in the host.
   Serverless functions open a lot of short-lived connections and the direct
   string will exhaust Neon's limit.
3. Set `DATABASE_URL` to it. Keep `?sslmode=require`, `lib/db/index.ts` already
   keys its SSL setting off that substring.
4. Apply the schema: `npx drizzle-kit push`. `drizzle/0000_remarkable_winter_soldier.sql`
   has all ten tables.

Also worth lowering `max: 10` in `lib/db/index.ts`. On Vercel that is 10 connections
*per concurrent function instance*, which adds up fast against a free-tier limit.
`max: 1` is the usual serverless setting.

### 5. Hosting on Vercel

1. Import `github.com/Dexterityofrag/Anurag-studio-v3`.
2. Framework preset detects Next.js. No build config needed.
3. Add every env var from `app.yaml` except the four `DO_SPACES_*` ones.
4. Set `AUTH_URL=https://anurag.studio` and `AUTH_TRUST_HOST=true`.
5. `app.yaml` can be deleted, it is DigitalOcean-specific.
6. Point `anurag.studio` at Vercel once you are ready to cut over from the
   maintenance page. DNS stays on Cloudflare, just change the records.

### 6. Storage on R2

`lib/storage/spaces.ts` needs real edits, not just new credentials:

- **R2 does not support ACLs.** `ACL: 'public-read'` on `PutObjectCommand` will
  fail, and `PutObjectAclCommand` / `makeObjectPublic()` have to be deleted
  outright. Public access on R2 comes from making the bucket public or binding a
  custom domain to it, not from per-object ACLs.
- Endpoint becomes `https://<account_id>.r2.cloudflarestorage.com`, region `auto`.
- `getPublicUrl()` returns your R2 public bucket URL or, better, a custom domain
  like `media.anurag.studio`.
- `next.config.ts` needs the new hostname in both `images.remotePatterns` and the
  `img-src` / `connect-src` / `media-src` CSP directives. The Spaces hostnames can
  all go.

If you want to defer this: there are only five projects and their images are already
in `public/projects/`. Serving media straight out of `public/` works fine and costs
nothing. Wire up R2 later, when you next need the admin uploader.

## Urgent: a live credential is in the public repo

`seed-blogs.mjs` line 4 hardcodes the production DigitalOcean Postgres connection
string, password included. That file is **tracked in git**, and
`github.com/Dexterityofrag/Anurag-studio-v3` is **public**. The password has been
readable by anyone for as long as it has been pushed.

The database it opens is already destroyed, so that specific string is inert. It
still matters:

1. **If you reused that password anywhere else, change it there now.**
2. Before you put the Neon URL anywhere, move it into `.env.local` and read it with
   `process.env.DATABASE_URL`. Never inline it again.
3. Rewriting git history to purge the old string is optional given the cluster is
   gone. Rotating any reuse is not.

Nothing else tracked in the repo contains a secret. `.env.local` is correctly ignored.

## Recovering the content

**Correction to a first impression: `.next/` is not the content backup.** Its
prerendered HTML was generated after the database had already gone away, so every
`work/*` and `blog/*` page in it is a "Not Found" shell. Only the static pages
(`about`, `contact`, `index`, `menu`, and the two index pages) carry real text.
`content-backup/` holds what there was, which is worth keeping but is not the case
studies.

The actual sources, and together they are complete:

**1. `scripts/seed-descriptions.ts`, the real prize.** Full case study bodies as
Tiptap JSON for all eight projects: `evolusis-landing-page`,
`evo-dashboard-evo-by-evolusis`, `evo-chat-ai-coaching-chatbot`,
`evo-coach-ai-voice-coaching`, `mission-control`, `awr`, `cloudqa`, `orange`. Re-run
it against Neon and the case studies come back.

**2. `seed-blogs.mjs`** has all seven posts with title, slug, excerpt, cover image,
tags, reading time and publish date. The bodies were never in the database anyway,
each post links out to Medium via `external_url`, and those articles are untouched.
Strip the hardcoded credential before running it.

**3. The Wayback Machine crawled the whole site on 17 April 2026**, every case study
and every blog post, all HTTP 200:

```
https://web.archive.org/web/20260417*/anurag.studio/*
```

Use it to check the reseeded pages against what was actually live, and to recover any
copy edits made through the admin panel after the seed scripts were written.

**4. Local media**, all intact: `public/projects/` (34 MB across awr, cloudqa,
evolusis, mission-control, orange), `public/portrait.jpg`, `public/toolkit/`,
`public/cv/`, and both showreel renders in `out/`.

The one real gap is media uploaded through the admin panel that existed only in the
Spaces bucket. The Wayback snapshots still hold those image URLs, and some of the
files themselves may be archived, so check there before treating anything as lost.

## After it is back up

Two habits that would have made this a non-event:

1. `pg_dump` to a file in a private repo, or Neon's own branching, on a schedule.
2. Keep a local copy of anything uploaded through the admin panel. Right now the
   uploader is the only place some of that media ever lived.
