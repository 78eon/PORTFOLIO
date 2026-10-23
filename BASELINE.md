# Baseline audit — 2026-10-23

Branch: redesign/impeccable-balanced-motion. Original checkout clean on main.

## Functionality inventory
- Homepage: parallel PostgreSQL published-writeup and certification queries; descending lab dates, ordered credentials; date serialization; ISR 60 seconds.
- Research: seven category values preserved; slug links; dynamic paths with blocking fallback, not-found handling and ISR. Detail retains overview, CIA impact, CVSS, environment, walkthrough, mitigation, takeaways, tags, tools, screenshots and references.
- Notes: published listing, category filters, featured latest item, reading time, Markdown rendering, examples, references, tools, heading navigation and progress indicator. Dynamic paths/ISR preserved.
- Contact: POST /api/contact, required name/email/message, 2,000-character limit, PostgreSQL storage, persistent IP rate limit (3/hour); frontend consent and privacy link.
- Cookies: accepted/declined choice in cookie_consent localStorage; authentication session cookie independent of optional preference. Banner on every page.
- Authentication: /login posts /api/auth/check, signed admin_session cookie, server authorization guards and proxy protection with configurable admin route.
- Admin: writeup create/edit/delete/publish, notes CRUD, certifications CRUD/order, tag CRUD, received messages. Markdown toolbar/preview, screenshot upload and descriptions.
- Storage: lib/storage.js uses Cloudinary; @aws-sdk/client-s3 installed but not used here. No storage or backend rewrite planned.
- Environment names: DATABASE_URL, ADMIN_PASSWORD, ADMIN_PATH, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET. Values never recorded.
- Database schema/migrations, proxy, API handlers and auth behavior remain outside redesign scope.

## Existing validation failures
`npm run lint`: 17 errors: cookie state effect; six NoteForm literal // labels; nested CertForm component; three homepage literal // labels; two note detail literal // labels; four privacy quote escapes.
`npm run build`: compilation succeeds (4.9s); page-data collection fails with ENOTFOUND db. Configured database host unavailable from host shell. No production data or migrations touched.

## Initial critique / priority
1. Hero's slow typewriter withholds identity; large generic headline and empty social configurations weaken navigation. Replace with immediately readable editorial composition.
2. Low-contrast gray text and intense neon lack hierarchy. Centralize restrained palette and raise secondary text contrast.
3. Certification placement interrupts the path to research. Feature latest actual research, then complete filtered archive.
4. Contact lacks network/non-JSON recovery, associated field labels and duplicate guard. Repair frontend only.
5. Repeated card treatment, inconsistent admin palette, weak focus and missing reduced-motion rules. Share tokens across surfaces and retain simple admin interactions.
