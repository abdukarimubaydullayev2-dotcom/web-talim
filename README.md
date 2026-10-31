# Web Ta’lim

Namangan shahar 3-sonli texnikum · Tayyorlovchi Ubaydullayev Abdukarim · 3-IT · 2026/2027.

Platforma: https://web-talim-abdukarim-2026.satinyacorn67.chatgpt.site

## Kirish

Platformaga login/parol bilan ro‘yxatdan o‘tib kiriladi. Google yoki ChatGPT hisobi talab qilinmaydi.
Viloyat → tuman/shahar → texnikum → o‘quvchi/o‘qituvchi tanlanadi.
O‘quvchi guruhini o‘zi yozishi majburiy, o‘qituvchida guruh maydoni chiqmaydi.
Keyin ism, familiya, noyob login va kamida 10 belgili parol kiritiladi.
Hisoblar D1da saqlanadi; parollar bcrypt va serverdagi HMAC secret bilan himoyalangan hash, sessiyalar HttpOnly cookie bilan ishlaydi.
Rol tanlovi tasniflash uchun, administrator vakolatini bermaydi.

## O‘qituvchi imkoniyatlari

- `/teacher` — o‘z guruhlarini yaratish, Excel ro‘yxatidan o‘quvchi hisoblarini noyob login va tasodifiy boshlang‘ich parollar bilan ochish. Tayyor ma’lumotlarni Excel/PDFda yuklab olish, uzilgan importni davom ettirish.
- Guruhdagi oraliq nazoratlar — Word `.docx`dagi `*` bilan belgilangan test bankini yuklash, masalan 300 savoldan 25 yoki 30 tasini berish. Savollar to‘plami har bir o‘quvchida turli, javoblar aralash; baholash serverda. `/controls` — o‘quvchi nazoratlari.
- `/teacher/resources` — o‘z mustaqil ish, prezentatsiya va videodarslarini fayl/havola sifatida mavzuga biriktirish. Darsda o‘sha o‘qituvchiga ko‘rinadi; administrator ham alohida panelda ko‘ra oladi; fayllar shaxsiy R2 xotirasida saqlanadi.
- `/admin/resources` — administrator barcha o‘qituvchilar resurslarini filtrlaydi, fayl va videolarni ochadi.
- `/account` — profil va parolni yangilash. O‘quvchi parolni yangilaganda boshlang‘ich parol o‘qituvchi eksportidan olib tashlanadi.
- Bosh sahifa/dars yuqorisida rolga mos Admin panel, Mening resurslarim, Guruhlarim va Hisobim havolalari mavjud. Admin havolasi faqat serverda ruxsat berilgan hisobga chiqadi.

Batafsil: `teacher/README.md`, `exams/README.md`, `resources/README.md`, `admin/README.md`.

## Mazmun

8 modul: kasbiy faoliyat va mehnat muhofazasi; kompyuter arxitekturasi;
kompyuter tarmoqlari; dasturlash asoslari; Frontend; Backend; ma’lumotlar bazasi;
integratsiyalash, testlash va joriy etish.
Konspekt, slayd, javobli savol, 10 savolli test va tegishli amaliy mashqlar mavjud.
Test o‘tish chegarasi 60%. Word konspektlar Calibri 14, interval 1, Atamalar bilan.

## Tuzilma

- `course/` — darslar, statik JS, rasmlar, Word va ZIP materiallarining kanonik manbasi.
- `auth/` — kirish, ro‘yxatdan o‘tish, profil, server validatsiyasi va rasmiy muassasalar katalogi.
- `teacher/`, `exams/`, `resources/` — o‘qituvchi guruhlari, oraliq nazoratlar va shaxsiy fayllar.
- `db/schema.ts` va `drizzle/` — D1 sxema va ketma-ket migratsiyalar.
- `worker/` — barcha so‘rovlarda sessiyani tekshiradigan gateway.
- `authoring/` — o‘quv materiallarini yaratish skriptlari va alohida demo loyihalar.
- `checks/` — autentifikatsiya, navigatsiya, test baholashi va mashq muhitlari tekshiruvlari.
- `public/` va `dist/` — build vaqtida hosil bo‘ladi, Gitga kiritilmaydi.

## Lokal muhit

Node 24 va npm kerak. `npm ci`, keyin `npm run build`.
Har bir `drizzle/*.sql` faylini tartib bilan lokal DBga qo‘llang:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_tan_pet_avengers.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_married_rumiko_fujikawa.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_flat_jigsaw.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0003_spotty_cable.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0004_crazy_gargoyle.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0005_gray_ultragirl.sql
npm start
```

Lokal ro‘yxatdan o‘tish uchun `.dev.vars` faylida `AUTH_PASSWORD_PEPPER`ga kamida 32 belgili tasodifiy maxfiy qiymat belgilang. Fayl Gitga kiritilmaydi; production qiymatini hosting secrets boshqaradi.

Wrangler ko‘rsatgan lokal URLni oching. Hostingda D1 `DB` va shaxsiy fayllar uchun R2 `BUCKET` bindinglari kerak; serverli versiya oddiy statik GitHub Pagesda avtomatik ishlamaydi.
`.openai/hosting.json` mavjud Sites loyihasiga tegishli, uni boshqa loyiha IDsi bilan almashtirmang.

## Tekshiruv

```sh
node checks/teacher.test.mjs
node checks/teacher-files.test.mjs
node checks/exams.test.mjs
node checks/exam-docx.test.mjs
node checks/exam-client.test.cjs
node checks/resources.test.mjs
node checks/personal-resources.test.cjs
node checks/admin.test.mjs
node checks/activity-client.test.cjs
node checks/auth-ui.test.cjs
node checks/auth-runtime.test.mjs
node checks/integration-module.test.cjs
node checks/database-module.test.cjs
```

Auth runtime testi alohida lokal test bazasini yaratadi; real foydalanuvchi yoki production bazasiga tegmaydi.
Ishchi qoralamalar shu brauzerda hisob idsi bilan ajratiladi, qurilmalar orasida avtomatik sinxronlanmaydi.
Admin panel `/admin` orqali egasining mavjud hisobiga ochiladi. Hudud, texnikum, guruh, foydalanuvchi, mavzu va sana bo‘yicha foydalanuvchi faolligi hamda test natijalari filtrlanadi. O‘qituvchini tanlash admin huquqini bermaydi.

Mavzu va test statistikasi 2026-10-29 dagi ushbu yangilanishdan boshlab yig‘iladi. Oldingi qurilmadagi mahalliy testlarni tiklash ko‘zda tutilmagan. Parolni email/SMS orqali tiklash hali qo‘shilmagan.

## Ma’lumotlar va manbalar

Texnikum katalogi: Lex.uz PF-190, 4-ilova amaldagi tahriri (2026-10-28):
https://www.lex.uz/uz/acts/-7792559 . 14 hudud, 203 tuman/shahar, 636 davlat texnikumi.
Nodavlat yoki boshqa tizimdagi muassasalar to‘liq qamralmagan.

sql.js MIT litsenziyasi `course/vendor/sqljs/` ichida saqlangan; YouTube videolari o‘z mualliflariga tegishli.
O‘quv materiallariga alohida umumiy litsenziya belgilanmagan.
Foydalanuvchilar bazasi, parollar, sessiya tokenlari va mahalliy maxfiy sozlamalar bu repozitoriyga kiritilmaydi.

GitHubdagi o‘zgarishlar amaldagi hostingga avtomatik chiqarilmaydi; build va alohida publish kerak.


## Informatika va axborot texnologiyalari

A separate subject with six chapters, 60 lessons and 120 teaching hours, preserving the supplied theory/practical flags. The subject selector switches between Web and Informatics; each Informatics lesson has a conspect, matching slide presentation, 10 answered questions and 10 scored test questions, with related videos where selected. No independent-education section is included. See `authoring/README-informatics.txt` for source generation and stable assessment IDs.
