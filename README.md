# NEON — Security research & field notes

A personal portfolio for practical cybersecurity labs, CTF writeups, vulnerability research, and learning notes. Built with Next.js 16 Pages Router, React 19, Tailwind CSS 4, and PostgreSQL.

## Local development

Install with `npm ci`, configure a reachable PostgreSQL database in `.env.local`, and run `npm run dev`. Open http://localhost:3000. The existing schema/migrations are under `db/`; applying them remains an explicit operator action.

Required environment names: `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_PATH`. Cloudinary uploads additionally use `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET`. Do not commit environment values. The existing Docker Compose workflow can be launched with `docker compose up --build` when Docker is available.

Run `npm run lint` and `npm run build` for validation. The production build requires database access to generate public research pages. Run `npm start` after a successful build.

## Redesign documentation

- [Product context](PRODUCT.md)
- [Design system, components, and motion](DESIGN.md)
- [Baseline behavior and existing failures](BASELINE.md)
- [Validation evidence and limitations](VALIDATION.md)
- [Change inventory and pull request summary](CHANGE_REPORT.md)

The redesign uses CSS and Canvas motion and preserves the existing database schema and APIs. QA used a disposable database; no production deployment was performed.

## Impeccable and animation tooling

Motion is installed as a dependency for presentation-layer work. Current effects continue to use CSS and Canvas; installing Motion does not add it to the client bundle unless imported. Homepage data loading remains PostgreSQL-backed `getStaticProps` with `revalidate: 60`.

Install the project-local Codex tooling after cloning:

```sh
npm ci
npx impeccable install --providers=codex --project --yes
```

The local Impeccable package/engine is regenerable and ignored by Git; the Codex hook manifest and shared hook settings are tracked. On the next agent turn, invoke `$impeccable init` to review product context and `$impeccable hooks on` to enable/repair hooks. These are agent-chat commands, not shell commands. The existing PRODUCT.md and DESIGN.md provide the initialized context.

The hook is enabled for this checkout. Codex requires approving a new hook through its `/hooks` interface before it can run automatically; project configuration does not bypass that approval. A direct shell status check is:

```sh
.agents/skills/impeccable/scripts/impeccable hooks status
```
