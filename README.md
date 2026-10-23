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

No animation dependencies, database migrations, or API changes were introduced by the redesign. QA used a disposable database; no production deployment was performed.
