# Oshpaz Ta’lim

Umarova Zulfiya uchun 1-kurs platformasi. Faqat UKM-2, UKM-3, UKM-4, UKM-5, KM-1.1 va KM-1.2. 125 mavzu, 336 auditoriya soati, 118 mustaqil ta’lim soati.

`course/data.json` mavzu, soat va o‘quv izohlarini saqlaydi. `build-content.py` tekshirilgan manbadan bu faylni hosil qiladi. `course/app.js` dars sahifalari, qidiruv va mashqlarni taqdim etadi. `auth/` avvalgi platformadan olingan kirish va ro‘yxatdan o‘tish tuzilmasidir. Foydalanuvchilar bazasi ushbu sayt uchun alohida.

Har mavzuda veb-konspekt, 6 ekranlik taqdimot, javobli savollar, 10 savollik test va amaliy yoki mustaqil topshiriq mavjud. Konspekt HTML formatida yuklanadi, chop etish orqali PDF saqlash mumkin. Bu versiyada Word va PowerPoint fayllari hamda videolar biriktirilmagan. Retsept me’yorlari va harorat-vaqt rejimlari o‘qituvchi tasdiqlagan texnologik xaritadan olinadi.

D1: hisoblar, sessiyalar, o‘zlashtirish, test urinishlari, shaxsiy amaliy hisobotlar va taklif kodi bilan o‘qituvchi guruhlari. Parol pepperi `AUTH_PASSWORD_PEPPER` hosting secretida turadi. Maxfiy qiymatlar manbaga qo‘shilmaydi.

Build: `npm run build`. Runtime tekshiruv: `node checks/runtime.mjs`. Mahalliy API testlari ajratilgan vaqtinchalik D1 bilan ishlaydi va production ma’lumotlariga tegmaydi.

## Administrator panel

`/admin` contains filtered account, quiz, group and practice reports. `administrators` is the only administrator grant source. Teacher self-registration does not grant access. Initial login is reserved by `ADMIN_INITIAL_LOGIN`; the first matching login is validated against `ADMIN_INITIAL_PASSWORD_SHA256`, then the normal peppered bcrypt account is created and atomically granted admin access. The initial password digest uses SHA-256 over the fixed prefix `oshpaz-admin-initial:` and the configured password; it stays in hosting secrets. No real credentials are included in source. After the account exists, normal password verification and password changes apply.

The interface supports paginated reports and CSV export with spreadsheet formula escaping. Admin endpoints omit password hashes and salts, and use parameterized SQL with role checks. All browser QA fixtures are kept outside this repository.
