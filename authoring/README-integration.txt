Module 8: Web ilovani integratsiyalash, testlash va joriy etish.
90 hours / 45 two-hour lessons; 5 sections of 18 hours. Each section contains
4 theory/practice pairs plus one consolidation assignment: 20 theory, 25 practice.
Canonical build: $CODEX_PRIMARY_RUNTIME_PYTHON authoring/build_integration_resources.py
Inputs: integration_units.py, course_documents.py and integration-project/.
Outputs: integration-plan.json, dist/integration-data.js, 45 notes, workplan, ZIPs.
Word: Calibri 14, single spacing, Atamalar. Native HTML resource slides, no PPTX claimed.

Four pure-JavaScript exercises run via integration-js-worker.js, with console.log
and assert, output cap and parent timeout. No DOM or Node environment is provided.
Other assignments are local multi-file project work or written analysis.
Draft text is saved in localStorage; code run does not grade the full assignment.
Quiz pass boundary: 60%; quiz scoring remains separate from teacher-assessed practical work.

Project: Node 24 built-in HTTP, SQLite, test and assert. No runtime npm dependencies.
16 actual Node unit/store/HTTP/backup tests pass; smoke script exercised on temporary HTTP server.
All 4 browser JS example handlers tested in Node VM. Navigation/render/threshold/timeout mocks pass.
46 DOCX files rendered (94 pages) and reviewed. Prior frontend/backend/database/sidebar regression tests pass.
Browser QA unavailable in this session due to unresolved browser infrastructure failures.
Docker build, remote GitHub Actions, actual Playwright browser run and external hosting not tested;
README labels these limits explicitly. Student deployment practice can remain local.
Video selection is title/description based: Git and Docker image lessons; playback unverified.
No prior-module content is regenerated. Shared index only adds module8 routing/resources/cleanup.
