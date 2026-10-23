# NEON redesign change report

## Delivered behavior
A complete editorial homepage with immediately readable animated hero, abstract network illustration, latest published research feature, complete category-filtered archive, real-topic exploration row, database-backed credentials, student introduction, resilient contact form and consistent footer. Shared navigation serves reading pages with functional native anchors, mobile disclosure, current-section indication and no-JavaScript fallback. Reading/admin/login/privacy surfaces use centralized tokens and self-hosted typography. Existing data and workflows remain the content authority.

## Architecture and dependencies
Pages Router and React state remain in place. Added shared header/footer, small SVG icon component, homepage hero/contact components and a dynamically imported Canvas component. CSS handles entrance/hover/filter feedback; no Motion, WebGL or animation package was added. Manrope variable font is self-hosted with its OFL license. New `lib/date.js` preserves PostgreSQL calendar dates during serialization. API, proxy/auth, database pool, schema and Cloudinary storage implementation are unchanged.

## Functional repairs found during redesign
Contact now handles network/non-JSON failures, guards duplicate requests, preserves typed input on failure and exposes loading/error/success to assistive technology. Cookie preference loading uses a hydration-safe external store and tolerates unavailable storage. Native image dialog adds focus containment/restoration and keyboard controls. Moved the certification form out of render to stop remounting while typing. Serialized certification/tag creation timestamps required by Next.js, and preserved calendar dates rather than shifting them through UTC. Existing lint failures were resolved without turning off rules. Admin form labels and editor toolbar names were improved.

## Animation and accessibility
Hero reveal starts from readable opacity and staggers at most 160ms. Card lift is 4px, simple feedback 180–200ms, entry 400–650ms. Canvas uses 44 desktop / 16 small-container nodes, capped DPR, bounded pointer highlight, ResizeObserver, hidden/offscreen pauses and complete lifecycle cleanup. Reduced motion removes CSS effects and keeps a static canvas. Native landmarks/links, skip links, visible focus, pressed filter states, polite result announcements, explicit consent and status feedback are implemented.

## Validation and limitations
Final lint and production build passed using an isolated local PostgreSQL fixture database. 51 interaction/CRUD/editor checks passed (27 + 17 + 7). Automated accessibility scans report zero violations on all tested public reading/login and selected admin forms. Final local mobile Lighthouse: **92 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 2.0s, CLS .025**. Tests and limitations, including no live upload, no real-user INP and no production-database validation, are detailed in [VALIDATION.md](VALIDATION.md). Baseline behavior is recorded in [BASELINE.md](BASELINE.md); product and reusable design rules are in [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md).

## Pull request summary
**Title:** Redesign NEON as an accessible animated research portfolio

Replaces the neon/terminal homepage with an editorial research experience built from the existing published content. Introduces shared responsive navigation, restrained CSS and Canvas motion, reusable design tokens, readable secondary surfaces and robust contact feedback while retaining Pages Router, PostgreSQL ISR, APIs, authentication, CRUD and uploads.

Validation: lint and production build pass against a disposable PostgreSQL database; 51 behavior checks pass; automated accessibility scans have zero violations; final local mobile Lighthouse 92/100/100/100. No production deployment or schema change. Review staging content and real upload integration before release.

## File inventory

### Added

- `.impeccable/design.json`
- `BASELINE.md`
- `CHANGE_REPORT.md`
- `DESIGN.md`
- `PRODUCT.md`
- `VALIDATION.md`
- `components/Icon.js`
- `components/home/ContactForm.js`
- `components/home/Hero.js`
- `components/layout/SiteFooter.js`
- `components/layout/SiteHeader.js`
- `components/visuals/NetworkBackground.js`
- `docs/qa/accessibility-and-keyboard.json`
- `docs/qa/animation-profile.json`
- `docs/qa/browser-checks.json`
- `docs/qa/crud-checks.json`
- `docs/qa/lighthouse-summary.json`
- `docs/qa/public-axe-summary.json`
- `lib/date.js`
- `public/fonts/OFL-Manrope.txt`
- `public/fonts/manrope-variable.ttf`

### Modified

- `.gitignore`
- `README.md`
- `components/CookieBanner.js`
- `components/ImageLightbox.js`
- `components/MarkdownEditor.js`
- `components/NoteForm.js`
- `components/WriteupCard.js`
- `components/WriteupForm.js`
- `pages/_app.js`
- `pages/admin/certifications.js`
- `pages/admin/edit/[id].js`
- `pages/admin/index.js`
- `pages/admin/messages.js`
- `pages/admin/new.js`
- `pages/admin/notes.js`
- `pages/admin/notes/edit/[id].js`
- `pages/admin/notes/new.js`
- `pages/admin/tags.js`
- `pages/index.js`
- `pages/login.js`
- `pages/notes/[slug].js`
- `pages/notes/index.js`
- `pages/privacy.js`
- `pages/writeups/[slug].js`
- `styles/globals.css`

Dependencies added: none. Application package manifests and lockfile unchanged. No PR was published or pushed; summary is ready for review.
