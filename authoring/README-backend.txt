6-modul: Server dasturlash (Backend), 180 soat, 90 para.
Reja mualliflik tavsiyasi; tasdiqlangan davlat dasturi deb belgilanmagan.
45 nazariy va har biridan keyin tegishli 45 amaliy dars; 90/90 soat.

Canonical build:
  "$CODEX_PRIMARY_RUNTIME_PYTHON" authoring/build_backend_resources.py
Content: backend_units.py (45 units), backend_cases.py (applied questions).
Output: backend-plan.json, dist/backend-data.js, 91 DOCX files and two ZIPs.
Do not map old Frontend lesson numbers into this module.

Word: Calibri 14, single line spacing, Atamalar; render DOCX before delivery.
Lesson notes contain clickable source links; the work plan contains full URLs.
Videos: authors' titles/descriptions checked 2026-10-27; playback not reviewed.
Version differences and partial coverage are stated in each video description.

Source project: authoring/backend-project (Node 24, Express 5, node:sqlite).
Install dependencies there with npm ci; validate with npm test.
The ZIP excludes node_modules, actual databases and .env.
The reference project runs locally or on a separately selected Node host.
The learning Site remains static and public; no new login requirement.

Validation:
  node checks/backend-module.test.cjs
  npm test --prefix authoring/backend-project
Navigation, score threshold, code execution and real HTTP integration are tested.
Browser layout, external YouTube and OneCompiler playback remain unverified
when the managed browser infrastructure is unavailable.
