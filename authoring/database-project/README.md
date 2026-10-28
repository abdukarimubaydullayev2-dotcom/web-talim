# Kutubxona ma’lumotlar bazasi

Web Ta’lim 7-moduli, Ubaydullayev Abdukarim. Namangan shahar 3-sonli texnikum, 3-IT, 2026/2027.

Bu kichik o‘quv loyihasida categories, books, members va loans jadvallari bor. Price_sum butun so‘mda; SQLite sanalari YYYY-MM-DD matni bo‘yicha kelishilgan. Sxema sana tartibini tekshiradi, ammo matnning barcha kalendar holatlarini qat’iy tekshirishni da’vo qilmaydi. PostgreSQL varianti DATE tipidan foydalanadi. Haqiqiy xizmatda har nusxaga inventar, shaxsiy ma’lumot siyosati va parallel kitob berish qoidasi qo‘shiladi.

## SQLite variantini bajarish

1. Node.js 24 LTS o‘rnating; tashqi npm paket kerak emas.
2. ZIPni alohida katalogga oching. `node test.cjs` bajaring.
3. Testlar vaqtinchalik bazada 25 ta assertni tekshiradi va o‘z fayllarini tozalaydi. Asosiy shaxsiy bazangizga tegmaydi.
4. DB Browser for SQLite yoki sqlite3 bilan yangi demo baza oching. `schema.sqlite.sql`, keyin `seed.sql`ni bir martadan bajaring.
5. `reports.sql`ni ishlating. Qarzdorlar 1 va 3, kitob olmagan a’zo Nodir bo‘lishi kerak.
6. Baza yopilganidan keyin nusxasini boshqa katalogga ko‘chiring. O‘sha nusxada hisobotlarni qayta tekshiring. Ishlayotgan WAL bazasi uchun rasmiy backup interfeysi kerak; bitta faylni ko‘chirish yetarli bo‘lmasligi mumkin.

Sxema va seed yangi baza uchun. Ularni ishlab turgan bazaga qayta qo‘llash migratsiya hisoblanmaydi. Platforma muharriridagi har Run yangi xotira demo bazasidan boshlanadi; avvalgi Run o‘zgarishlari avtomatik qolmaydi. Kod shu brauzerda saqlanadi. Natija bazasini yuklab olish tugmasi aynan oxirgi mashq bazasini beradi.

## PostgreSQL varianti

Kurs PostgreSQL 18 qo‘llanmasiga tayanadi. Lokal server, psql va CREATE SCHEMA huquqi bor demo hisob kerak. Faqat yangi bazada quyidagi buyruqlarni bajaring:

```
psql -h localhost -U student -d library_demo -f schema.postgresql.sql
psql -h localhost -U student -d library_demo -f seed.postgresql.sql
```

Seed aniq idlarni kiritgach identity ketma-ketligini setval bilan moslaydi. PostgreSQL hisobotlarida jadvallarni `library.books`, `library.loans` kabi to‘liq nom bilan yozing yoki nazoratli sessiyada `SET search_path TO library` tanlang.

PostgreSQLga xos schema, role, GRANT, FOR UPDATE va pg_dump buyruqlari brauzerdagi SQLite mexanizmida bajarilmaydi. Ular lokal PostgreSQLda alohida tekshiriladi. Ushbu paketdagi avtomatik 25 test SQLite variantiga tegishli; PostgreSQLga to‘liq avtomatik test o‘tkazildi deb hisoblamang.

Ruxsatlarni sinashda schema egasi read-only rol yaratadi va test loginiga a’zolik beradi. Read-only foydalanuvchi bilan SELECT o‘tishi va INSERT rad etilishi tekshiriladi. Eng kam huquq qoidasini saqlang; veb ilovani superuserda ishlatish talab etilmaydi.

## Himoya uchun dalillar

- ER diagramma va ustunlar lug‘ati.
- Uch hisobotning kutiladigan natijasi.
- Manfiy stock, takroriy card, noto‘g‘ri FK va sana tartibi rad etilishi.
- Tranzaksiya xatosidan keyin rollback natijasi.
- Alohida nusxadan tiklangan baza va uning hisobotlari.
- SQLite va PostgreSQL farqlari, qolgan cheklovlar.

## Manbalar

- https://sqlite.org/lang.html
- https://sqlite.org/foreignkeys.html
- https://sqlite.org/backup.html
- https://www.postgresql.org/docs/18/tutorial.html
- https://www.postgresql.org/docs/18/backup-dump.html
- https://nodejs.org/api/sqlite.html
