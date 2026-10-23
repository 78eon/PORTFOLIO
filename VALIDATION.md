# Validation and delivery — 2026-10-23

## Result
Implemented on `redesign/impeccable-balanced-motion`, preserving Pages Router, API handlers, authentication/proxy, schema, storage and 60-second ISR. No production deployment, remote push, main merge, production database write or migration was performed.

## Environment and baseline
The supplied `.env.local` points to a Docker-internal `db` hostname, unavailable from this shell. Baseline lint had 17 errors; baseline build compiled then failed collecting database content. Docker daemon access was denied. For meaningful validation, created an independent PostgreSQL 17 cluster under `/tmp/neon-qa-pg` on port 55432, loaded the repository schema only there, and seeded clearly labelled disposable QA content. Local TLS and a temporary trusted certificate allowed testing the production database connection settings unchanged. Test environment variables were command-scoped; project env files were not edited. Live reference website could not be opened by web tooling; repository source was the implementation authority.

## Executed checks
- `npm run lint`: PASS, zero errors and warnings. Fixed the 17 baseline errors without disabling rules.
- `npm run build`: PASS, Next.js 16.2.9 Turbopack, compiled in 2.6s in the final formatted rebuild, all public and admin/API routes generated/registered. Requires a reachable PostgreSQL database at build time as before.
- `git diff --check`: PASS.
- Browser suite: 27/27 checks pass, no browser exceptions. Published-only research, category filtering/reset/empty state, no horizontal overflow at 320/390/768px, mobile disclosure/Escape/focus, reduced-motion CSS, non-JSON and aborted-network contact recovery with input retention, real contact POST success, notes/writeup/privacy/login routes, login redirect and authenticated admin route access. [Evidence](docs/qa/browser-checks.json).
- CRUD/editor suite: 17/17 checks pass. Unauthenticated update rejected; login succeeds; create/update/delete writeups, notes, certifications and tags via real local APIs; certification form retains input focus; Markdown toolbar edits and preview renders. Only records created by this suite were deleted. [Evidence](docs/qa/crud-checks.json).
- Additional interaction suite: 7/7 checks pass. Native image dialog opens, Escape closes and restores trigger focus; skip link receives keyboard focus and targets main; mobile native navigation and hero remain visible without JavaScript. [Evidence](docs/qa/accessibility-and-keyboard.json).
- Axe WCAG 2 A/AA, 2.1 AA, 2.2 AA: zero violations on home, notes listing/detail, writeup detail, privacy, login, admin certification/tag forms, new writeup and new note forms. Two initial privacy link-distinction findings fixed with underlines and rechecked. These are automated checks, not certification or an assistive-technology user test. [Public scans](docs/qa/public-axe-summary.json), [final targeted scans](docs/qa/accessibility-and-keyboard.json).
- Visual inspection: final full-page captures at 1440, 768, 390 and 320px, each opened and inspected. No clipping/overflow found. Captures are local ignored artifacts under `.impeccable/review/`; content is explicitly labelled disposable QA data.
- Canvas lifecycle sampling: 45 requestAnimationFrame callbacks in a 750ms visible sample; zero callbacks while hero is offscreen, after route unmount and under reduced motion. Drawing itself is capped at approximately 30 FPS independently of RAF scheduling. [Evidence](docs/qa/animation-profile.json).
- Independent Impeccable finish review: initial performance and interrupted-suite findings resolved after sequential rerun; About eyebrow removed; final disposition **ship for local implementation scope**, not approval to deploy.

## Performance measurements
Final Lighthouse mobile, simulated throttling, local production server, fixture dataset:

| Metric | Final result | Target |
| --- | --- | --- |
| Performance | 92 | ≥90 |
| Accessibility | 100 | ≥95 |
| Best practices | 100 | — |
| SEO | 100 | — |
| LCP | 2.0s | ≤2.5s |
| CLS | 0.025 | ≤0.1 |
| Total blocking time | 320ms | Diagnostic only |
| FCP | 0.9s | — |
| Speed index | 2.5s | — |

Earlier concurrent run scored 85; an isolated sequential run scored 97. Final source measured 92, illustrating local run variability. TBT is not INP; deployed real-user INP remains unverified. Actual production content, badge hosts, hardware and network can change these results. [Machine-readable report](docs/qa/lighthouse-summary.json). Full raw Lighthouse HTML/JSON were generated under `/tmp` and were not added to application assets.

## Remaining verification limits
- Production PostgreSQL content and credentials were not used; repeat content-dependent checks against a staging database before release.
- No actual Cloudinary upload was made. Existing file-to-base64, upload endpoint and storage implementation remain intact; image presentation/lightbox and editor routes were checked with local fixtures.
- No deployed Lighthouse/field INP, full heap-leak analysis or battery profiling was performed.
- No screen-reader user session or external credential-link verification was performed. Keyboard and automated accessibility checks passed.
- Existing backend/security semantics were preserved rather than audited or rewritten. No schema or dependency migration.
- Impeccable's upstream skill/references were read; its engine launcher was unavailable, so engine context/detector commands were not claimed as executed. Product/design documents, code-first implementation, independent review and documenter verification were completed directly.

## Run locally
Use a reachable database containing the existing schema/migrations. Existing required environment names: `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_PATH`; image uploads additionally need `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET`. Keep actual values private.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For a production check with the same reachable database:

```sh
npm run lint
npm run build
npm start
```

The existing Docker Compose workflow is also available via `docker compose up --build` when Docker access is configured; it was not executable in this shell. Existing schemas/migrations remain a separate operator responsibility, not an automatic redesign action. Temporary QA server/database were stopped after validation, and the QA-generated `.next` output removed so test content cannot be mistaken for production content. No new npm dependency is needed by the application; Playwright, axe, Lighthouse and formatting tools ran outside the project dependencies.

## Follow-up setup — 2026-10-23

Applied the user's additional setup instructions in the existing checkout and redesign branch. `npm ci` succeeded; `npx impeccable install --providers=codex --project --yes` installed Impeccable 4.7.0 and engine v0.1.16. Its context command recognized the existing PRODUCT.md and DESIGN.md; no product/design content was overwritten. `impeccable hooks on` enabled shared hook settings and installed `.codex/hooks.json`; status confirmed enabled. Codex first-use hook approval remains a native `/hooks` action, as required by the installed skill. Downloaded skill/engine files and private consent stay local and are ignored; README documents reinstallation.

`npm install motion` added Motion 14.6.0 and its dependencies. The library is available but not imported by current presentation code. Application routes, PostgreSQL queries and homepage `revalidate: 60` are unchanged. ESLint excludes installed third-party `.agents` tooling. Lint and production build passed again against the same disposable PostgreSQL test database. No UI changes occurred, so earlier browser/accessibility evidence remains applicable; Lighthouse was not rerun for this dependency-only follow-up. QA services were stopped and generated fixture build output removed afterward.

The context command reported a timestamp-based stale design-sidecar notice. It does not block installation or alter the design; `$impeccable document` is the offered refresh command. No automatic drift repair was performed. npm reported the same 15 audit findings before and after Motion installation; dependency remediation was outside these setup instructions.
