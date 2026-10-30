# O‘qituvchi guruhlari

`/teacher` — ro‘yxatdan o‘tgan o‘qituvchining o‘z guruhlari. O‘qituvchi o‘z hisobidagi texnikumda guruh yaratadi. Bu vakolat admin hisobotlarini yoki boshqa o‘qituvchining guruhlarini ochmaydi. Oldingi mustaqil hisoblar ism-familiya orqali avtomatik biriktirilmaydi va ularning parollari o‘zgartirilmaydi.

## Oqim

1. Guruh nomi (masalan, `3-IT`). Bir o‘qituvchining bir xil normallashgan guruh nomini takrorlashiga yo‘l qo‘yilmaydi. Bir xil nom boshqa o‘qituvchida mustaqil guruh sifatida mavjud bo‘lishi mumkin.
2. `.xlsx` ro‘yxat (5 MB gacha). Fayl brauzerda o‘qiladi. Varaq, sarlavha qatori, Ism/Familiya ustunlari yoki to‘liq ismning tartibi tanlanadi. Tayyor namuna ham mavjud. Eski `.xls` faylni Excelda `.xlsx` sifatida qayta saqlash kerak.
3. Ko‘rib chiqish va xatolarni tuzatish. Bitta guruhda 200 o‘quvchi, bitta o‘qituvchida 50 guruhgacha. Bir xil ism-familiya bo‘lsa otasining ismi bilan ajratish kerak. Formulali ism kataklari qabul qilinmaydi.
4. Server importni va shifrlangan boshlang‘ich parollarni saqlaydi. Har bir keyingi so‘rov bitta hisobni yaratadi; sahifani qayta ochganda davom ettirish mumkin. Import UUIDsi, ism kaliti va atomik D1 batch qayta jo‘natish paytida hisob ko‘payib ketishini cheklaydi.
5. Tayyor hisoblar Excel yoki Unicode shriftli ko‘p sahifali PDF sifatida yuklab olinadi. Guruh ro‘yxati o‘zida ochiq parollarni ko‘rsatmaydi; credential endpoint faqat egasi va same-origin POST so‘roviga javob beradi. Fayl yaratish brauzerda bajariladi, tayyor fayllar serverda saqlanmaydi.

## Kirish ma’lumotlari

Login lotin harfiga o‘girilgan ism-familiya va 10 ta tasodifiy hex belgidan iborat (32 belgigacha); hisoblar jadvalida unique. Parol `crypto.getRandomValues` orqali 120 bit tasodifiy qiymatdan yaratiladi, har bir hisob uchun alohida. Amaldagi parol mavjud bcrypt12 + server HMAC pepper tartibida xeshlanadi.

Boshlang‘ich parollar qayta yuklab olish uchun AES-GCM bilan shifrlanadi. Kalit mavjud `AUTH_PASSWORD_PEPPER`dan alohida maqsad prefiksi bilan olinadi; har bir satr uchun alohida IV va satr UUIDsi bilan additional authenticated data ishlatiladi. Pepperni almashtirish mavjud hashlar va boshlang‘ich ma’lumotlarga ta’sir qiladi; uni qayta yaratmang.

`/account`da foydalanuvchi amaldagi parolini tasdiqlab yangi parol qo‘yishi mumkin. Bu operatsiya barcha avvalgi sessiyalarni bekor qiladi, joriy qurilmada yangi sessiya ochadi va o‘qituvchi eksportidagi boshlang‘ich parolni o‘chiradi. Keyingi eksportda «O‘quvchi o‘zgartirgan» ko‘rinadi. Oldin yuklab olingan fayldagi eski parol yangi parol o‘rnatilgach ishlamaydi.

## Tekshiruv

- `node checks/teacher.test.mjs`: real SQLite, barcha migratsiyalar, sessiya/egalik/texnikum, CSRF, qayta import, uzilish/davom, login, parolni yangilash va shifrlangan parollar.
- `node checks/teacher-files.test.mjs`: app ishlatadigan Excel/PDF funksiyalari, XLSX qayta ochish, literal qiymatlar, formulalar, to‘liq ism, Unicode va ko‘p sahifali PDF.
- Builddan so‘ng `node checks/auth-runtime.test.mjs`: real Worker/D1 orqali guruh/import/login/parolni yangilash va autentifikatsiya regressiyalari. Test bazasi alohida, productionga ta’sir qilmaydi.

ExcelJS, PDF-LIB va fontkit brauzer to‘plamlari prebuildda lockfile bilan o‘rnatilgan paketlardan `public/vendor/teacher`ga ko‘chiriladi. DejaVu Sans shrifti va litsenziyasi `course/vendor/teacher`da saqlangan. Tashqi CDN talab qilinmaydi.
