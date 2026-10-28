# Web Ta’lim

Namangan shahar 3-sonli texnikum uchun ochiq raqamli ta’lim resursi.

Tayyorlovchi: **Ubaydullayev Abdukarim** · 3-IT · 2026/2027.

Amaldagi platforma: https://web-talim-abdukarim-2026.satinyacorn67.chatgpt.site

## Tarkib

1. Kasbiy faoliyatga kirish, mehnat muhofazasi va kasbiy etika.
2. Kompyuter arxitekturasi va operatsion tizimlar.
3. Kompyuter tarmoqlari asoslari.
4. Algoritm va dasturlash asoslari.
5. Web interfeysini ishlab chiqish (Frontend).
6. Server dasturlash (Backend).
7. Ma’lumotlar bazasi bilan ishlash.
8. Web ilovani integratsiyalash, testlash va joriy etish.

Mavzularda konspektlar, slaydlar, javobli savollar, testlar, mos videolar va tegishli amaliy mashqlar bor. 10 savolli testning o‘tish chegarasi 60%.

## Lokal ochish

Statik sayt `dist/` ichida. Node yoki Python HTTP server bilan oching (faylni file:// orqali ochish Worker/WASMni cheklashi mumkin):

```sh
python -m http.server 8000 --directory dist
```

Brauzerda http://localhost:8000 . Saytga kirish uchun hisob talab etilmaydi. Mashq qoralamalari shu brauzerning localStorage xotirasida saqlanadi.

## Fayllar

- `dist/` — platforma va yuklab olinadigan materiallar.
- `authoring/` — o‘quv mazmuni va materiallarni qayta yaratish skriptlari.
- `checks/` — navigatsiya, test baholashi va mashq muhitlari tekshiruvlari.
- `authoring/integration-project/` — 8-modul uchun Node 24 HTTP API, SQLite, frontend va avtomatik testli alohida demo.

Word konspektlar Calibri 14 va interval 1 bilan tayyorlangan. Mualliflik ish rejalari tavsiya etiladigan rejalar sifatida belgilangan.

## Tekshirish

```sh
node checks/integration-module.test.cjs
node checks/integration-js.test.cjs
node --test authoring/integration-project/test/*.test.mjs
```

Loyiha ishga tushishi va boshqa modullarni qayta yaratish tartibi tegishli `authoring/README-*.txt` va demo README fayllarida berilgan. Word yaratish skriptlariga `python-docx` kerak; `CODEX_PRIMARY_RUNTIME_PYTHON` ishlatilgan buyruq misollari ish muhiti yo‘liga tegishli, oddiy kompyuterda mos Python interpreter bilan almashtiriladi.

Docker, masofaviy CI va brauzer E2E sinovlari bajarilgani da’vo qilinmaydi; tegishli lokal ko‘rsatmalar bor. Node demo serverlar statik hostingda avtomatik ishga tushmaydi.

## Uchinchi tomon materiallari

SQLite brauzer muhiti uchun sql.js va uning MIT litsenziyasi `dist/vendor/sqljs/` ichida saqlangan. YouTube videolari o‘z mualliflariga tegishli va rasmiy player orqali ko‘rsatiladi. Kurs materiallari uchun alohida umumiy litsenziya belgilanmagan.

Bu repozitoriy saytning joriy manba nusxasi. Repozitoriydagi o‘zgarishlar hozirgi hostingga avtomatik chiqarilmaydi.
