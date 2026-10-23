# NEON Cyber exploration integration

## Baseline and scope
Date: 2026-10-23. Working branch: redesign/impeccable-balanced-motion (already active). User-provided neon-cyber-webgl/ and its ZIP are untracked inputs, preserved without edits. Installed Next.js Pages Router data-loading/lazy-loading docs and application architecture inspected before implementation.

Baseline lint passed. Baseline production build compiled in 2.2s, then failed with ENOTFOUND db collecting /notes/[slug]. The configured database hostname is Docker-only; use the isolated local preview PostgreSQL instance for verification. Existing backend, proxy/auth, storage, schema and queries remain outside the integration changes.

## Integration direction
Retain the established ink/mint editorial portfolio and immediately readable hero. Add a featured native React domain exploration section below it. The prototype's iframe route, CDN imports, full-window mouse capture, scanlines and invented percentage bars are not installed. Seven educational concept graphs use qualitative explanations and labelled relationships. All graph content is illustrative, distinct from actual published research links.

Direct Three.js is sufficient for six-node graphs and existing React controls; no Fiber/Drei renderer, physics, post-processing or texture dependencies needed. Existing Motion dependency remains available, with simple transitions authored in CSS. Current homepage getStaticProps, PostgreSQL queries and revalidate:60 remain unchanged.

## Components and ownership
- `lib/cyberDomains.js`: seven curated educational domains, six concepts each, distinct labelled relationships, qualitative GRC matrix context and real research matching. All examples are illustrative, including the reserved `example.invalid` indicator. No numeric coverage/risk claims.
- `CyberExplorer`: React selection/view state, viewport activation, loading/error state, opt-in/static mode, keyboard commands and lazy-import boundary.
- `CyberDomainSelector`, `CyberNode`, `CyberInfoPanel`: semantic HTML selection and explanations, relationship lists, framework reference links, published writeup links and honest empty states.
- `CyberFallback` and `CyberEdges`: server-rendered static SVG using the same data as 3D, supplemented by the HTML controls and descriptive caption.
- `CyberScene`: browser-only Three.js/OrbitControls, actual WebGL2 capability acquisition, camera, picking, on-demand labels and frame scheduling. No React state updates per frame.
- `sceneObjects`: bounded graph/backdrop factories and deduplicated disposal of geometries/materials/textures.

Only `three` 0.186.1 was added. Fiber/Drei were unnecessary for this six-node scene; Three is loaded through the optional dynamic scene rather than the homepage's initial React import graph. It is bundled locally, with no CDN allowance or CSP change. Existing Motion stays installed but is not needed for the CSS transitions.

## Interaction and performance policy
Desktop scenes activate when the map intersects. Mobile, coarse pointers, reduced motion and Save-Data default to the static map; explicit 3D opt-in remains available. A manual static choice survives scrolling. Scene dimensions are reserved (390/400/310px by breakpoint); information stays available while loading. Context loss, capability failure, render failure and failed chunks all retain the static map and HTML controls. A failed chunk offers an explicit reload because the module loader caches failure; a lost WebGL context can create a new renderer without reloading.

Drag/orbit and wheel/pinch zoom supplement visible HTML camera controls. Arrow keys orbit, plus/minus zoom and Home resets when the viewport is focused. Orbit distance is 7–17, polar angle .45–(π−.45), pan disabled, damping .07 and gentle automatic orbit speed .23. Reduced motion disables damping/ambient animation; the scene renders only after interaction. Ambient drawing is bounded by minimum intervals of 32ms desktop / 48ms compact. DPR is capped at 1.5 / 1.25; antialiasing is off compact; background points are 65 / 30 and pulses fewer compact. Hidden/offscreen scenes cancel animation frames, and unmount/domain rebuild dispose their resources. No textures are created, but disposal also accounts for future texture-bearing materials.

## Repairs found during QA
The first chunk-failure test showed that an empty `next/dynamic` loading renderer could leave the status at loading. The loader now catches import failure explicitly and provides a meaningful static state plus reload action. Resource checks await effect teardown before measuring; pointer tests scroll the actual viewport clear of the sticky navigation before picking.

Populated admin messages exposed an existing timestamp hydration mismatch between the server timezone and browser timezone. The display now uses explicit en-US/UTC formatting and a machine-readable dateTime. No message storage or API semantics changed. This repair is separately tested across UTC, Asia/Jerusalem and America/New_York browser contexts.

Development-mode StrictMode replay exposed canvas reuse after releasing a WebGL context. Each scene effect now owns a fresh native canvas inside a React-owned slot and removes it on cleanup. Development initialization and static/3D remounts pass without runtime or hydration errors.

## Validation results
Final lint passed with zero warnings/errors. Final production build passed against the isolated preview PostgreSQL database (see local build log for timing). The default environment still requires its Docker-only database hostname; no environment files were changed to hide that requirement.

| Suite | Result | Evidence |
| --- | --- | --- |
| WebGL, concepts, fallbacks and lifecycle | 81/81 | [checks.json](qa/webgl/checks.json) |
| Portfolio routes, filters, certifications, contact, login/admin | 30/30 | [portfolio-checks.json](qa/webgl/portfolio-checks.json) |
| Safe admin CRUD and Markdown editor | 17/17 | [admin-checks.json](qa/webgl/admin-checks.json) |
| Keyboard, no-JS navigation and image dialog | 7/7, plus five zero-violation axe scans | [accessibility-checks.json](qa/webgl/accessibility-checks.json) |
| Development StrictMode initialization and remount | 3/3 | [development.json](qa/webgl/development.json) |
| Populated admin messages across three browser timezones | 3/3 | [admin-timezones.json](qa/webgl/admin-timezones.json) |

The 81 explorer checks include all domains/concepts, live selection, true canvas raycasting, HTML and keyboard camera controls, GRC matrix, real research matching, lazy activation, manual static persistence, WebGL failure, context loss/recovery, failed chunks, no-JavaScript content, reduced-motion 3D, offscreen/hidden pauses, responsive widths and no hydration/runtime exceptions. Active GRC also passed axe. Final public-page and selected admin form scans reported zero violations. These checks target WCAG A/AA rules but do not replace a screen-reader user session.

Across 21 domain rebuilds, 366 GPU buffers were created and 366 disposed, with zero net growth in live buffers. Offscreen/hidden samples and reduced-motion idle 3D recorded zero draw calls. Route teardown disposed shader programs. These are instrumented browser resource/lifecycle samples, not a proof of zero leaks across all devices or a full heap analysis. Browser 3D validation used Chromium SwiftShader rather than physical mobile GPU hardware.

Final local mobile Lighthouse (simulated throttling): **97 performance / 100 accessibility / 100 best practices / 100 SEO**. LCP **1.8s**, CLS **0**, FCP **0.8s**, speed index **0.8s**, TBT **200ms**. TBT is not field INP. An earlier run was 92 with LCP 2.6s; converting the same variable Manrope font to WOFF2 (164,700 → 53,796 bytes) and preloading it improved delivery. Original TTF and OFL license remain as fallback/source. Font axes 200–800 were verified preserved. [Final audit](qa/webgl/lighthouse.json), [initial-load budget](qa/webgl/loading-budget.json).

The initial page requested only the 53,796-byte WOFF2 font and did not request the optional scene chunk. Physical-GPU performance, battery use, deployed scores/field INP and production content remain unmeasured. No real Cloudinary upload was sent; the upload endpoint's anonymous denial and unchanged storage/API code were checked. Existing data/credentials are never embedded into graph examples or documentation.

## Review and limitations
Impeccable context, craft guidance, one detector pass, independent finish review and separate design documenter were used. The detector found 92 advisory type/palette documentation warnings and three existing fallback-font warnings; none was a runtime or contrast blocker. New graph colors and existing code/ornament fonts were documented without suppressing rules. Independent review approved the integration source, controls, lifecycle and four responsive captures. It did not certify field performance or independently execute tests.

Screenshots were inspected at 1440, 768, 390 and 320px and retained locally under `.impeccable/review/webgl/`. They show explicitly labelled educational graphs and test writeup content. The source prototype and ZIP remain untouched untracked inputs. No production database was written, no schema migrated, no authentication/API contract rewritten, no main-branch commit/merge, and no deployment or remote push occurred in this task.

Run the app with `npm ci` then `npm run dev`, using a reachable existing PostgreSQL database. The current local preview remains at http://localhost:3001/#cyber-explorer. For a production preview, `npm run build` and `npm start` require that database as before. [QA setup and commands](../scripts/qa/README.md) describe isolated fixture requirements.

## Review summary
**Suggested PR title:** Integrate an accessible React/Three cybersecurity domain explorer

Adds an optional, locally bundled Three.js concept map to the existing homepage, with seven educational domains, complete SVG/HTML fallback, related published research and bounded accessible interaction. Preserves Pages Router/PostgreSQL ISR and all portfolio workflows. Includes explicit GPU/lifecycle cleanup, low-complexity mobile rendering, resource/failure tests, WOFF2 font delivery and a timestamp hydration repair in the admin message view.

Validation: lint/build pass, 141 checks pass, zero violations in tested accessibility scans, final local mobile Lighthouse 97/100/100/100. No automatic release; physical GPU testing, field INP and real upload verification remain staging follow-ups.

## Files changed

Modified:

- `.impeccable/design.json`
- `DESIGN.md`
- `README.md`
- `VALIDATION.md`
- `components/home/Hero.js`
- `components/layout/SiteHeader.js`
- `package-lock.json`
- `package.json`
- `pages/_document.js`
- `pages/admin/messages.js`
- `pages/index.js`
- `styles/globals.css`

Added:

- `components/cyber/CyberDomainSelector.js`
- `components/cyber/CyberEdges.js`
- `components/cyber/CyberExplorer.js`
- `components/cyber/CyberFallback.js`
- `components/cyber/CyberInfoPanel.js`
- `components/cyber/CyberNode.js`
- `components/cyber/CyberScene.js`
- `components/cyber/sceneObjects.js`
- `docs/WEBGL_INTEGRATION.md`
- `docs/qa/webgl/accessibility-checks.json`
- `docs/qa/webgl/admin-checks.json`
- `docs/qa/webgl/admin-timezones.json`
- `docs/qa/webgl/axe.json`
- `docs/qa/webgl/checks.json`
- `docs/qa/webgl/development.json`
- `docs/qa/webgl/lighthouse.json`
- `docs/qa/webgl/loading-budget.json`
- `docs/qa/webgl/portfolio-checks.json`
- `lib/cyberDomains.js`
- `public/fonts/manrope-variable.woff2`
- `scripts/qa/README.md`
- `scripts/qa/accessibility-regression.cjs`
- `scripts/qa/admin-regression.cjs`
- `scripts/qa/admin-timezones.cjs`
- `scripts/qa/cyber-development.cjs`
- `scripts/qa/cyber-explorer.cjs`
- `scripts/qa/portfolio-regression.cjs`
