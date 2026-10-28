# Web Ta’lim

Namangan shahar 3-sonli texnikum · Tayyorlovchi Ubaydullayev Abdukarim · 3-IT · 2026/2027.

Platforma: https://web-talim-abdukarim-2026.satinyacorn67.chatgpt.site

## Kirish

Platformaga login/parol bilan ro‘yxatdan o‘tib kiriladi. Google yoki ChatGPT hisobi talab qilinmaydi.
Viloyat → tuman/shahar → texnikum → o‘quvchi/o‘qituvchi tanlanadi.
O‘quvchi guruhini o‘zi yozishi majburiy, o‘qituvchida guruh maydoni chiqmaydi.
Keyin ism, familiya, noyob login va kamida 10 belgili parol kiritiladi.
Hisoblar D1da saqlanadi; parollar saltli PBKDF2 hash, sessiyalar HttpOnly cookie bilan ishlaydi.
Rol tanlovi tasniflash uchun, administrator vakolatini bermaydi.

## Mazmun

8 modul: kasbiy faoliyat va mehnat muhofazasi; kompyuter arxitekturasi;
kompyuter tarmoqlari; dasturlash asoslari; Frontend; Backend; ma’lumotlar bazasi;
integratsiyalash, testlash va joriy etish.
Konspekt, slayd, javobli savol, 10 savolli test va tegishli amaliy mashqlar mavjud.
Test o‘tish chegarasi 60%. Word konspektlar Calibri 14, interval 1, Atamalar bilan.

## Tuzilma

- `course/` — darslar, statik JS, rasmlar, Word va ZIP materiallarining kanonik manbasi.
- `auth/` — kirish, ro‘yxatdan o‘tish, profil, server validatsiyasi va rasmiy muassasalar katalogi.
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
npm start
```

Wrangler ko‘rsatgan lokal URLni oching. Hostingda D1 binding kerak; serverli versiya oddiy statik GitHub Pagesda avtomatik ishlamaydi.
`.openai/hosting.json` mavjud Sites loyihasiga tegishli, uni boshqa loyiha IDsi bilan almashtirmang.

## Tekshiruv

```sh
node checks/auth-ui.test.cjs
node checks/auth-runtime.test.mjs
node checks/integration-module.test.cjs
node checks/database-module.test.cjs
```

Auth runtime testi alohida lokal test bazasini yaratadi; real foydalanuvchi yoki production bazasiga tegmaydi.
Ishchi qoralamalar shu brauzerda hisob idsi bilan ajratiladi, qurilmalar orasida avtomatik sinxronlanmaydi.
O‘qituvchi boshqaruv paneli va parolni email/SMS orqali tiklash hali qo‘shilmagan.

## Ma’lumotlar va manbalar

Texnikum katalogi: Lex.uz PF-190, 4-ilova amaldagi tahriri (2026-10-28):
https://www.lex.uz/uz/acts/-7792559 . 14 hudud, 203 tuman/shahar, 636 davlat texnikumi.
Nodavlat yoki boshqa tizimdagi muassasalar to‘liq qamralmagan.

sql.js MIT litsenziyasi `course/vendor/sqljs/` ichida saqlangan; YouTube videolari o‘z mualliflariga tegishli.
O‘quv materiallariga alohida umumiy litsenziya belgilanmagan.
Foydalanuvchilar bazasi, parollar, sessiya tokenlari va mahalliy maxfiy sozlamalar bu repozitoriyga kiritilmaydi.

GitHubdagi o‘zgarishlar amaldagi hostingga avtomatik chiqarilmaydi; build va alohida publish kerak.
