# Shaxsiy vazifalar

Web Ta’lim 6-moduli uchun Node.js 24 LTS, Express 5 va SQLite asosidagi kichik o‘quv loyiha. Muallif: Ubaydullayev Abdukarim. Namangan shahar 3-sonli texnikum, 2026/2027.

Bu loyiha o‘quvchi uchun alohida tajriba ilovasi. Ochiq ta’lim platformasiga login qo‘shmaydi.

## Ishga tushirish

1. Node.js 24 LTS o‘rnating. `node --version` bilan tekshiring.
2. ZIPni yangi katalogga oching. Terminalni shu katalogda ishga tushiring.
3. `npm ci` bajaring. ZIP bilan package-lock.json birga beriladi.
4. `.env.example` nusxasini `.env` nomida saqlang. SESSION_SECRET uchun `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` orqali tasodifiy qiymat yarating va o‘sha maydonga kiriting.
5. `npm test` bajaring. Testlar o‘z vaqtinchalik bazasini ochadi.
6. `npm start` bajaring. Brauzerda `http://localhost:3000` oching.
7. Sun’iy mashq emaili va 15–128 belgili parol bilan hisob yarating, keyin kiring.

Server Ctrl+C bilan to‘xtatiladi. Baza standart holda `data/school.sqlite`da qoladi. Muhit bazasi va .env arxivga qo‘shilmagan. `node:sqlite` uchun ExperimentalWarning chiqishi versiyaga bog‘liq va misolning sintaksis xatosi degani emas.

## Tuzilma va o‘rganish ketma-ketligi

- `app.cjs`: ilova fabrikasi, validatorlar, parol xeshlash, sessiya ombori va API yo‘llari.
- `server.cjs`: muhitni o‘qish, listen va xizmatni yopish.
- `public/`: shu origindan xizmat qiladigan HTML, CSS va brauzer JavaScripti.
- `test/`: unit, HTTP, egalik, CSRF va diskda saqlanish sinovlari.

APIga kirishni darslar ketma-ketligida o‘rganing: HTTP → Node → Express → SQL → autentifikatsiya → ruxsat → frontend → test. Boshlang‘ich darsda butun yakuniy loyihani ko‘chirib yozish talab qilinmaydi. Sessiya store adapterida get/set/destroy/touch funksiyalari SQLitega bog‘lanadi; bu darsda ko‘riladigan funksiyalar va obyektlardan tuzilgan namuna.

## API

| Metod | Yo‘l | Natija |
| --- | --- | --- |
| GET | /health | 200, xizmat holati |
| GET | /api/csrf | 200, sessiyaga bog‘langan token |
| POST | /api/signup | 201, hisob yaratish; JSON email va password |
| POST | /api/login | 200, user va yangi csrfToken |
| GET | /api/me | 200, joriy hisob; kirilmasa 401 |
| GET | /api/tasks?page=1&limit=10 | 200, faqat o‘z vazifalari |
| POST | /api/tasks | 201, title 1–120 belgi |
| GET | /api/tasks/:id | 200, o‘z vazifasi |
| PATCH | /api/tasks/:id | 200, title va/yoki done |
| DELETE | /api/tasks/:id | 204, tana yo‘q |
| POST | /api/logout | 204, sessiyani bekor qilish |

Barcha POST/PATCH/DELETE so‘rovlari X-CSRF-Token talab qiladi. Login sessiya idsini yangilaydi; javobdagi yangi token ishlatiladi. Noto‘g‘ri format 400, kirish zarur 401, CSRF/origin 403, yo‘q yoki begona resurs 404, takroriy email 409, katta tana 413, urinish chegarasi 429 oladi.

## Joylashtirish va cheklovlar

Bu ZIPni ochiq ta’lim platformasining statik hostingiga yuklash Node serverni ishga tushirmaydi. Node runtime hosting kerak. O‘qituvchi hisob va provayderni tanlab, quyidagilarni sozlaydi:

- Node 24, `npm ci`, `npm start`, hosting PORTi va kerak bo‘lsa HOST=0.0.0.0.
- APP_ORIGIN tashqi aniq HTTPS origin bo‘ladi, oxirida `/` yozilmaydi.
- DB_PATH doimiy disk katalogiga yo‘naltiriladi. Vaqtinchalik disk bazani yo‘qotishi mumkin.
- Sessiya kaliti hosting sirlarida saqlanadi. TRUST_PROXY=1 faqat bitta ishonchli proksi uchun.
- HTTPS originda Secure cookie ishlatiladi. Frontend va API bir originda xizmat qiladi; cross-origin CORS bu namunada ochilmagan.
- Yangi baza sxemasi avtomatik yaratiladi; mavjud ishlab chiqarish bazasi uchun versiyali migratsiyalar alohida kerak.

Namuna bitta jarayon va kichik yuklama uchun. DatabaseSync sinxron amallari katta so‘rovda event loopni ushlab turadi. Kirish limitlari IP bo‘yicha shu jarayon xotirasida va qayta ishga tushganda yangilanadi; keng xizmat uchun taqsimlangan hisob/IP limitlari va qo‘shimcha hisob himoyasi kerak. Sessiya bir soatlik cookie siyosati bilan diskda saqlanadi. Email tasdiqlash, parol tiklash, MFA va rol boshqaruvi kiritilmagan. Takroriy emailning 409 javobi hisob mavjudligini oshkor qiladi; sezgir xizmatlar umumiy ro‘yxatdan o‘tish javobini tanlashi mumkin.

Faqat mashq ma’lumotlarini ishlating. Backup uchun ishlayotgan WAL faylini tasodifan ko‘chirish o‘rniga SQLite backup interfeysi yoki yopilgan bazaning to‘liq nusxasidan foydalaning va alohida joyda tiklashni tekshiring.

## Manbalar

- https://nodejs.org/en/learn/getting-started/introduction-to-nodejs
- https://nodejs.org/api/sqlite.html
- https://nodejs.org/api/crypto.html
- https://expressjs.com/en/guide/routing.html
- https://expressjs.com/en/resources/middleware/session.html
- https://www.sqlite.org/lang.html
- https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
