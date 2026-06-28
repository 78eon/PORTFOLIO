# Security Research Portfolio

A personal portfolio and blog for documenting cybersecurity lab work, CTF writeups, and learning notes. Built with Next.js and PostgreSQL, deployed on Vercel.

## Features

- **Writeups** — structured security lab reports (overview, impact, attack vector, exploitation walkthrough, mitigation, screenshots)
- **Learning Notes** — documentation for tools, protocols, algorithms, and concepts
- **Certifications** — credential showcase
- **Contact form** — GDPR-compliant with rate limiting
- **Admin panel** — password-protected, accessible via a secret URL
- **Image uploads** — Cloudinary integration for screenshots and evidence
- **ISR** — public pages auto-update within 60 seconds of new content

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (Pages Router) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Neon for production) |
| Image storage | Cloudinary |
| Hosting | Vercel |

## Local Development

**Prerequisites:** Docker and Docker Compose

```bash
# Clone the repo
git clone https://github.com/78eon/PORTFOLIO.git
cd PORTFOLIO

# Copy and fill in environment variables
cp .env.local.example .env.local

# Start the database and app
docker compose up
```

The app runs at `http://localhost:3000`.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset name |
| `ADMIN_PATH` | Secret URL segment for the admin panel |
| `ADMIN_PASSWORD` | Admin session password (used to sign session tokens) |

## Database Setup

Run migrations in order against your PostgreSQL instance:

```bash
psql $DATABASE_URL -f db/init.sql
psql $DATABASE_URL -f db/migration_001.sql
psql $DATABASE_URL -f db/migration_002.sql
psql $DATABASE_URL -f db/migration_003.sql
```

## Deployment

Push to `main` — Vercel auto-deploys. Add all environment variables in the Vercel dashboard under Project Settings → Environment Variables.
