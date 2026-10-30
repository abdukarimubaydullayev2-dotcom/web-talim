# O‘qituvchining shaxsiy resurslari

`/teacher/resources`: o‘qituvchining mustaqil ish, prezentatsiya va videodarslari. Mavjud 405 mavzudan biriga biriktiriladi. Nom, izoh va biriktirilgan mavzuni keyin o‘zgartirish mumkin. Fayl va havolalar yangi resurs sifatida qayta yaratiladi; tayyor faylning ustidan yozilmaydi. Ro‘yxat modul, mavzu va matn bo‘yicha filtrlanadi. `/teacher` hamda `/account`da kirish havolalari bor.

## Saqlash

Metadata D1 `teacher_resources` jadvalida, fayllar `.openai/hosting.json`dagi yangi `BUCKET` R2 bindingida saqlanadi. Native Sites deploy resursni provision qiladi; hech qanday ommaviy bucket manzili yoki signed URL chiqarilmaydi. Har bir upload alohida, taxmin qilib bo‘lmaydigan object key oladi. Asl o‘qituvchi fayllari git yoki statik `public/`ga yozilmaydi. Hisobga boshqa qurilmadan kirilganda resurslar ham ochiladi.

Yaratish metadata POST + raw-body uploaddan iborat. Client UUID + payload hash qayta so‘rovni idempotent qiladi. R2ga request.body oqimi bevosita uzatiladi (butun videoni Worker xotirasiga buffer qilmaydi). Content-Length kutilgan hajmga teng bo‘lishi, R2 qaytargan yakuniy hajm ham teng bo‘lishi shart. Upload holati `pending → uploading → ready`. Atomik claim va har urinishga alohida key eski/parallel uploadlar yangi fayl ustidan yozishiga yo‘l qo‘ymaydi. Uzilgan upload pending holatga qaytadi; cheksiz qolgan uploading 15 daqiqadan so‘ng qayta claim qilinadi. UIda o‘sha nom/hajmdagi faylni qayta tanlash yoki resursni o‘chirish mavjud. Upload va delete bir paytda kelsa, kech qolgan upload o‘z objectini o‘chiradi. R2 o‘chirishdagi xato metadata holatini qaytaradi.

Bir hisob: jami 200 resurs, 500 MB; video 100 MB, hujjat 20 MB. Quota insertning bitta SQL shartida tekshiriladi. Link va fayllarga alohida 60 mutation/minute limit. Ushbu cheklovlar ilova cheklovlari; hosting tarifining kafolati emas.

Qabul qilinadigan fayllar: PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, TXT, ZIP, JPG/JPEG, PNG, MP4, WebM. Faqat MP4/WebM inline video sifatida ochiladi; qolganlari `attachment`, extensionga qarab server tanlagan MIME va `nosniff` bilan beriladi. HTML/SVG/JS/EXE yuklash yo‘q. HTTPS havolalar tekshiriladi; server tashqi URLni fetch qilmaydi. YouTube embed faqat tanilgan host + 11-belgili video IDdan yig‘iladi; boshqa havolalar yangi tabda noopener/noreferrer bilan ochiladi. Hujjatlar va prezentatsiyalar yuklab olinadi yoki ularning tashqi havolasi ochiladi; PPTXni brauzerda avtomatik slaydga aylantirish yo‘q.

## Maxfiylik va mavzu integratsiyasi

API har bir so‘rovda server sessiyasi, teacher roli va immutable owner IDni tekshiradi. Boshqa o‘qituvchiga, o‘quvchiga yoki mehmonlarga fayl/metadata ochilmaydi. Hatto to‘g‘ridan-to‘g‘ri object/resource ID topilsa ham. Admin roliga alohida bypass yo‘q.

Course HTMLga `personal-resources.js` faqat o‘qituvchi uchun qo‘shiladi. U mavjud renderResources zanjirini (analitika va dars kontenti) saqlagan holda, mavzuning yuqorisiga «Mening resurslarim»ni qo‘shadi. Har safar faqat joriy moduleId/lessonId va own teacher ID bilan tayyor resurslar olinadi. AbortController va generation tekshiruvi oldingi mavzuning kech javobini chiqarmaydi. Bosh sahifaga qaytganda panel/video olib tashlanadi. Mavzuga resurs qo‘shish linki formani oldindan tanlaydi; resursdagi «Mavzuni ochish» tegishli darsga olib boradi.

Video download/seek uchun same-origin, owner-gated `/api/resources/:id/file` Range, suffix range, HEAD va 416 bilan ishlaydi. Har bir oqim boshida ruxsat tekshiriladi, javoblar private/no-store.

## Tekshiruvlar

- `node checks/resources.test.mjs` — SQLite + in-memory bucket: ruxsatlar, mavzu bindingi/tahrir, CSRF, metadata idempotency, R2 oqimi, retry/delete race, Range, video MIME, kvota, student sahifasiga hook qo‘shilmasligi.
- `node checks/personal-resources.test.cjs` — haqiqiy course hook: render zanjiri, mavzu parametrlari, eski fetchni bekor qilish, home cleanup.
- Builddan keyin `node checks/auth-runtime.test.mjs` — real Worker, lokal D1 va lokal R2 orqali upload/download/privacy va oldingi funksiyalar regressiyasi. Productionga test ma’lumoti yozilmaydi.

Kelgusida account deletion qo‘shilsa, D1 cascade bilan birga R2 own objectlarini ham o‘chirish kerak. Hozirgi ilovada account delete endpoint mavjud emas.
