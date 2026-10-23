# Local QA

These suites target `http://localhost:3100` and the isolated `neon_qa` database used for this task. Never point them at a production-backed server. The regression suites require the existing QA fixtures: three published writeups (Web, Network, CTF), one unpublished writeup, the `qa-protocols` note, certification records and a screenshot named `QA evidence image`. `QA_PASSWORD` must match the disposable server's admin password; `ADMIN_PATH=qa-admin` is used by those suites. The browser suite exercises real contact submission and the admin suite creates/updates/deletes only its own test records.

Install test runners outside application dependencies:

```sh
npm install --prefix /tmp/neon-qa playwright @axe-core/playwright lighthouse
/tmp/neon-qa/node_modules/.bin/playwright install chromium
```

With the production preview running and its isolated database configured:

```sh
NODE_PATH=/tmp/neon-qa/node_modules node scripts/qa/cyber-explorer.cjs
QA_DISPOSABLE=1 QA_PASSWORD='<disposable-test-password>' NODE_PATH=/tmp/neon-qa/node_modules node scripts/qa/portfolio-regression.cjs
QA_DISPOSABLE=1 QA_PASSWORD='<disposable-test-password>' NODE_PATH=/tmp/neon-qa/node_modules node scripts/qa/admin-regression.cjs
QA_DISPOSABLE=1 QA_PASSWORD='<disposable-test-password>' NODE_PATH=/tmp/neon-qa/node_modules node scripts/qa/accessibility-regression.cjs
```

The WebGL suite uses Chromium SwiftShader to exercise 3D in a headless environment. It does not measure physical GPU performance. It also tests blocked WebGL2, context loss/recovery, reduced motion, absent JavaScript, failed dynamic imports, keyboard equivalents, actual picking, resource disposal, lazy loading and small-screen static defaults. It makes no backend writes. `QA_BASE_URL`/`QA_OUTPUT` override its local base URL and output directory. Lifecycle profiling instruments browser WebGL calls, not production globals.

Test evidence is stored under `docs/qa/webgl/`. Screenshots live in ignored `.impeccable/review/webgl/`. Earlier portfolio regression scripts also preserve detailed axe outputs under `/tmp`; the final report summarizes these. Live third-party uploads, production access and real-user INP are outside the tests.

Timezone coverage uses `QA_DISPOSABLE=1 QA_PASSWORD=... NODE_PATH=/tmp/neon-qa/node_modules node scripts/qa/admin-timezones.cjs`. With the development preview at localhost:3001, run `NODE_PATH=/tmp/neon-qa/node_modules node scripts/qa/cyber-development.cjs` to verify StrictMode initialization and static/3D remounts.
