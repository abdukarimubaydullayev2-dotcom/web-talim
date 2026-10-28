# Web Ta’lim hisoblari

Ro‘yxatdan o‘tish tartibi: viloyat → tuman/shahar → texnikum → student/teacher.
Student uchun groupName majburiy; teacher uchun server ham uni nullga aylantiradi.
Ism, familiya, noyob login va parol talab qilinadi. Google yoki ChatGPT hisobi talab qilinmaydi.
Rol bu bosqichda tasniflash uchun; teacher tanlash boshqa hisoblarni o‘qish yoki administrator huquqini bermaydi.

636 davlat texnikumi va ularga tegishli 203 tuman/shahar, 14 hudud.
Manba: https://www.lex.uz/uz/acts/-7792559 , 4-ilova, 2026-10-28 kuni olingan amaldagi tahrir.
Davlat tizimidan tashqaridagi muassasalar to‘liq qamralmagan. Yo‘q texnikumlarni katalogga manbali yangilash kerak.
Catalog serverda ham to‘liq tekshiriladi; mijozdagi selectga ishonilmaydi.
Guruhning asl yozilishi saqlanadi, group_key NFKC/katta harf/separatorlarni olib tashlash bilan guruhlash uchun tayyorlanadi.
Muassasa va group_key bo‘yicha indeks bor. O‘quvchi natijalari va o‘qituvchi boshqaruv paneli ushbu o‘zgarishga kiritilmagan.

D1: accounts, auth_sessions, auth_rate_limits. Drizzle schema va ketma-ket migratsiyalar.
Parollar: bcrypt cost 12, HMAC-SHA384 prehash va hosting secretidagi AUTH_PASSWORD_PEPPER.
Bu Workers PBKDF2 iteratsiya chegarasini chetlab o‘tuvchi maxsus KDF yaratmaydi; standart bcrypt ishlatiladi.
Legacy PBKDF2 yozuvlari o‘qiladi; yangi hisoblar bcrypt ishlatadi.
Parolning to‘liq 128 belgisi ishlatiladi, bcryptning 72-byte chegarasida qirqilmaydi.
Sessiya: 32-byte tasodifiy token, D1da faqat SHA256; HttpOnly Secure SameSite=Lax __Host cookie.
Login/registration IP va login bo‘yicha cheklangan; statuslar uchun umumiy login xatosi.
JSON body 8192 byte; faqat same-origin POST; ro‘yxatdagi region/district/college aloqasi va role serverda tekshiriladi.
Parolni qayta tiklash ushbu bosqichga kiritilmagan: telefon yoki email tasdiqlash kanali hali yo‘q.
Hech qanday master login, default admin yoki birinchi ro‘yxatdan o‘tgan kishiga admin berish yo‘q.
Haqiqiy foydalanuvchilar yoki parollar manba/fayl/GitHubga yozilmaydi; testlar faqat lokal test bazasiga yozadi.

course/ — eski dist/ o‘rnidagi kanonik kurs manbasi. public/ va dist/ build vaqtida hosil qilinadi.
Worker barcha so‘rovlarni oldin oladi (assets.run_worker_first=true), dars/Word/ZIP/WASM/JS uchun sessiyani tekshiradi.
Faqat login UI, catalog va texnikumning brend rasmi anonim ochiladi. Server HTMLni authdan keyin beradi.
Mavzudagi qoralamalar browserda qoladi, kalitlari account id bilan ajratilgan; boshqa qurilmaga ko‘chmaydi.

Tekshiruv:
node checks/auth-ui.test.cjs
node checks/auth-runtime.test.mjs
Runtime testi real workerd va lokal D1 bilan alohida .wrangler/auth-tests bazasini yaratib tekshiradi.
Builddan so‘ng bajariladi. Production bazasini ishlatmaydi.
Browser ko‘rinishi infratuzilma cheklovi sabab bu sessiyada tekshirilmagan.
