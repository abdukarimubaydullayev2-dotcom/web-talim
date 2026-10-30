# Web Ta’lim admin panel

Owner-only reporting at /admin. ADMIN_ACCOUNT_IDS is a server environment allowlist
of existing immutable account IDs, configured in hosting. Selecting teacher at
registration never grants admin rights. No passwords, session tokens or hashes
are returned by reporting endpoints. No admin signup or first-user admin rule.

Tracking starts with this release on 2026-10-29. Prior local browser quizzes/views
cannot be reconstructed. Account totals cover all currently registered accounts;
activity and attempts respect the selected date/module/lesson filters. Date bounds
are inclusive calendar days in Asia/Tashkent (UTC+05). Group normalization treats
2-it, 2 IT and 2_IT as 2IT, scoped separately to each institution.

Tables added by append-only migration: activity_events, test_attempts, login_events.
Each quiz completion has a per-account client UUID and immutable assessment version.
The server validates option indexes and calculates the grade from the canonical
405-lesson registry; claimed percent and account ID from the client are ignored.
Replayed UUIDs do not create another attempt. Retakes use fresh UUIDs and are shown
as distinct attempts. Average is the arithmetic mean of all filtered attempts,
not a best-only or latest-only score. “Viewed” means the lesson was opened, not
proof the student read it or watched all video content.

Offline events are queued per account in browser storage and retried. Server time
is recorded at receipt, so offline delivery can be later than the original action.
A save status appears under quiz results. Login events are recorded server-side.

Filters: region, district/city, institution, role, normalized group, name/login,
module, lesson, inclusive start/end dates, optional selected account. Reports:
groups, users, attempts, opened lessons. Pagination is 50 rows. CSV exports the
currently displayed page, UTF-8 BOM and escaped spreadsheet formula prefixes.

Source of grading: node scripts/build-assessment-registry.mjs, invoked in prebuild.
Changing a quiz changes its version. A stale version submission gets 409 and asks
the user to reload rather than silently grading against changed questions.

Validation: checks/admin.test.mjs (SQLite queries/access/scoring/filtering),
checks/activity-client.test.cjs (actual client hooks and offline replay), and
checks/auth-runtime.test.mjs (real workerd+D1 HTTP including admin routes).
Browser appearance has not been verified in this session.

Admission panel uses the provided school building photograph and the five subject
areas in the user's original directions image, plus requested IT and jewellery.
It omits unsupported phone numbers, dates, guaranteed jobs, grant or fee claims.
No personal account data is committed to this repository.


## O‘qituvchilar resurslari

`/admin/resources` va admin menyusidagi «O‘qituvchi resurslari» orqali barcha o‘qituvchilarning mavzuga biriktirgan materiallarini ko‘rish mumkin. O‘qituvchi ismi/login, aniq account ID, modul, mavzu, resurs turi, manba, holat hamda resurs matni bo‘yicha server filtrlari mavjud. Natijalar 25 tadan sahifalanadi. Har kartada egasining ism-familiyasi, logini, texnikumi va mavzusi ko‘rsatiladi.

GET/HEAD endpointlar `/api/admin/resources` ostida bo‘lib, faqat mavjud ADMIN_ACCOUNT_IDS allowlistiga tayanadi. Fayl va video oqimlari ham shu ruxsat bilan tekshiriladi; Range va HEAD qo‘llanadi. Admin uchun tahrirlash, o‘chirish yoki upload amallari ochilmagan. Oddiy o‘qituvchining `/api/resources` endpointi boshqa egalar ma’lumotini bermaydi. O‘qituvchiga administrator resurslarni ko‘rishi interfeysda ko‘rsatilgan.

Bu imkoniyat uchun yangi DB migratsiyasi yoki yangi secret kerak emas. `checks/resources.test.mjs` va haqiqiy Worker/D1/R2 `checks/auth-runtime.test.mjs` admin ko‘rish huquqini hamda boshqa rollarning rad etilishini tekshiradi.
