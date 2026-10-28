Module 7: Ma’lumotlar bazasi bilan ishlash — 140 hours / 70 two-hour lessons.
Recommended author workplan: 7 sections, 35 theory lessons followed by 35 practical lessons.
Canonical build: $CODEX_PRIMARY_RUNTIME_PYTHON authoring/build_database_resources.py
Inputs: database_units.py, database_cases.py, database_schema.sql, database_seed.sql,
course_documents.py and database-project/.
Output: dist/database-data.js, 70 Calibri 14 single-spaced notes, workplan, notes ZIP and project ZIP.
Slides are native HTML resource slides; no separate PowerPoint files are claimed.

Practical modes: 22 SQLite lessons run real SQL via same-origin sql.js 1.13.0 WASM
in a dedicated worker. Each Run starts a fresh database; editor/report text is saved
in browser localStorage. Results: 10 result sets, 200 rows per set, 2000 characters
per cell. Remaining statements still execute. Stop or 8-second timeout terminates
worker. Database download exports the most recent successful run.
Seven report assignments, five PostgreSQL guides and one Node assignment run locally,
not in the SQLite workspace. PostgreSQL needs a locally configured server/account;
PostgreSQL server execution and video playback were not verified here.

Checks: node checks/database-module.test.cjs; node checks/database-sql.test.cjs;
node authoring/database-project/test.cjs (Node 24).
Real WASM examples, grading/routing and local SQLite project tests pass.
Browser visual/runtime QA is unavailable in the current session; no browser pass claimed.
All 71 DOCX files rendered and reviewed; workplan references use clickable titles.
Upstream MIT license is retained under dist/vendor/sqljs/.
