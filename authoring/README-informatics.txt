Informatika va axborot texnologiyalari

Source: user-supplied 60-topic work plan, 2026-10-31. The N/A flag is preserved exactly: 26 theory lessons (52 hours), 34 practical lessons (68 hours), six chapters with hours 20/14/32/26/16/12. No independent-education rows, hours, sections or assignments are published for this subject.

Build content: python authoring/build_informatics.py
Then node scripts/build-assessment-registry.mjs and the standard Sites build.

Content sources are informatics-1/2/3.json. Each contains original Uzbek explanations, a worked example with steps/result/pitfall, 10 answered theory questions, 10 four-option questions with explanations and a glossary. Slides are derived from the same explanatory sections and split for readability. They are HTML slide presentations in the course UI, not downloadable PowerPoint decks.

Videos: informatics-video-candidates.json records URLs discovered via the ministry's public announcement https://t.me/s/uzedu?before=25296. informatics-video-checks.json stores YouTube oEmbed title/channel checks on 2026-10-31. Selected per-topic videos are in informatics-videos.json. Metadata validation is not a guarantee of player availability, geographic rights, or future availability. Coverage descriptions distinguish related supplements from complete coverage. Videos are embedded from the original publisher and not downloaded or copied.

Subject isolation: existing Web module IDs 1-8 remain unchanged. Informatics uses stable internal assessment namespace 9 with lesson IDs1-60, exposed in the UI as a separate subject, not as Web module9. No schema migration is necessary. Old test versions/IDs are preserved. New lesson visits/scores use existing authenticated server grading, owner-only resources and admin reporting. Teacher resources/admin options include the new subject. No real accounts, test results, passwords or uploads are altered by content generation.

Checks: checks/informatics.test.cjs tests navigation, switching, chapter coverage, content count, tab ordering, threshold/boundary behavior and server registry parity. checks/auth-runtime.test.mjs additionally verifies namespace9 server scoring, resource association and admin filtering through a real local Worker+D1+R2 environment.
