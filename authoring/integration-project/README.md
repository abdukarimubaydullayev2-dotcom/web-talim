# Web ilovani integratsiyalash testlash va joriy etish
Ubaydullayev Abdukarim, Namangan shahar 3-sonli texnikum, 3-IT, 2026/2027.
O‘quv demo: frontend + Node HTTP API + SQLite; tashqi runtime paket kerak emas.
Node 24 kerak. `node:sqlite` shu versiyada experimental ogohlantirish berishi mumkin.
Login va foydalanuvchi ajratishi YO‘Q. Faqat ishonchli lokal o‘quv muhitida va demo ma’lumot bilan ishlating.

## Ishga tushirish
ZIPdan chiqarilgan integration-project katalogida:
```
node --version
npm run check
npm test
npm start
```
Brauzer: http://localhost:3000 . Baza odatda loyiha/data/tasks.sqlite.
`PORT` va `DATA_DIR` jarayon muhitidan olinadi; `.env.example` avtomatik yuklanmaydi.
POSIX: `PORT=3001 DATA_DIR=./data node server.mjs`
PowerShell: `$env:PORT="3001"; $env:DATA_DIR="./data"; node server.mjs`
Chiqish: Ctrl+C; signal server va bazani yopadi.

## Shartnoma
GET /api/tasks → 200 {tasks:[{id,title,done}],truncated}; eng so‘nggi 100, to‘liq pagination emas.
GET /api/tasks?done=0 yoki 1 → filter; boshqa qiymat 400.
POST /api/tasks, application/json {title} → 201 {task}; trimdan keyin 1–80 belgi, noto‘g‘ri kirish 400.
PATCH /api/tasks/:id, application/json {done:boolean} → 200 {task}; yo‘q id 404.
DELETE /api/tasks/:id → 204; yo‘q id 404.
JSON buzilgan bo‘lsa 400, tana 16 KiBdan oshsa 413, noto‘g‘ri Content-Type 415.
Xatolar {error:{code,message}}; ichki stack mijozga qaytmaydi.
GET /health/live va /health/ready; readiness SELECT 1 bilan baza mavjudligini tekshiradi.
Frontend va API bir originda. CORS alohida yoqilmagan.
Loglar requestId, method, pathname, status, msni yozadi; tana va query kiritilmaydi.

## Sinovlar
`npm test`: sof validator, SQLite CRUD/cheklov/filter/izolyatsiya, haqiqiy lokal HTTP va offline backup/restore.
Testlar doimiy demo bazani ishlatmaydi. `node smoke.mjs http://127.0.0.1:3000` faqat o‘qiydigan 3 tekshiruv.
Brauzerdagi qo‘lda qabul: qo‘shish → tugallash → o‘chirish; server to‘xtaganda xabar; klaviatura; 320 px/200% zoom; HTMLga o‘xshash title oddiy matn bo‘lishi.

Ixtiyoriy E2E uchun o‘z kompyuteringizda `npm install --save-dev @playwright/test`, keyin `npx playwright install chromium`.
Alohida test data katalogi bilan server oching. `npx playwright test docs/e2e.spec.mjs --workers=1 --browser=chromium`.
Bu qo‘shimcha paket/renderer o‘rnatish internet va disk talab qiladi. Oddiy npm test E2Eni bajarmaydi.

## Backup va tiklash
Avval serverni Ctrl+C bilan to‘xtating. backup skripti faol writer yo‘qligini o‘zi to‘liq aniqlay olmaydi.
`node backup.mjs ./data ./backups/demo.sqlite`
`node restore.mjs ./backups/demo.sqlite ./restore-demo`
Keyin boshqa port va DATA_DIR=./restore-demo bilan oching; satr va CRUDni tekshiring.
Mavjud target fayl ustidan yozilmaydi. Backup faol SQLite faylini oddiy nusxalash usuli emas.

## Joriy etish
Node jarayoni, yoziladigan doimiy disk va HTTPS reverse proxy beradigan muhit kerak. Statik hosting bu serverni bajarmaydi.
Docker mavjud bo‘lsa: `docker build -t web-integration-demo .`, keyin `docker volume create web-integration-data` va
`docker run --rm -p 3000:3000 -v web-integration-data:/app/data web-integration-demo`.
Docker build, GitHub masofaviy CI, Playwright brauzeri va haqiqiy ommaviy hosting ushbu paketni tayyorlashda sinovdan o‘tkazilmadi.
Real ko‘p foydalanuvchili xizmatdan oldin login/avtorizatsiya, CSRF strategiyasi, rate limit, kuzatish va boshqaruv siyosati qo‘shiladi.
Kurs topshirig‘i to‘lov yoki majburiy tashqi hisob ochishni talab qilmaydi. Platformaning o‘zi ochiqligicha qoladi.
Reliz/rollback dalil jadvali: docs/release.md .
