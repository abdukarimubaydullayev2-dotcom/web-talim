# Guruh oraliq nazoratlari

O‘qituvchi `/teacher`da o‘z guruhini ochib Word `.docx` savollar bankini yuklaydi, nom va bir o‘quvchiga savollar sonini belgilaydi. 2–1000 ta savol, 2–6 javob varianti, har savolda aynan bitta to‘g‘ri javob. Standart format: raqamlangan savol, alohida qatordagi `A)`, `B)` javoblar; to‘g‘ri variant `*B) ...` yoki `B) *...` bilan belgilanadi. Raqamlangan savoldan keyingi harfsiz javoblar ham qo‘llanadi (`*` oldida). Rasm, formula obyekti yoki skan emas, oddiy matn kerak. Eski `.doc` avval Wordda `.docx` sifatida saqlanadi. Brauzerda namuna yuklab olish va dastlabki besh savolni tekshirish bor; belgilash xatolari nashrni to‘sadi.

## Saqlash va ruxsat

DOCX brauzerda JSZip + DOMParser bilan matnga ajratiladi. HTML sifatida render qilinmaydi. Fayl 5 MB, document.xml ochilgan matni 4 MB, API tanasi 2 MB, yakuniy JSON banki 1.5 MB bilan cheklangan. Server bank tuzilmasini mustaqil qayta tekshiradi. Bank D1 `group_exams.bank_json`da maxfiy saqlanadi, ommaviy asset yoki brauzer saqlash joyiga yozilmaydi. Yaratish UUIDsi idempotent. Berilgan bank keyinchalik o‘zgartirilmaydi; yangisi alohida nazorat sifatida yaratiladi.

Faqat guruh egasi o‘qituvchi nazorat yaratishi, ochib-yopishi va natijalarini ko‘rishi mumkin. O‘quvchi `roster_students.account_id` orqali shu guruhga biriktirilgan bo‘lishi shart; shunchaki ro‘yxatdan o‘tishda bir xil guruh nomini yozish ruxsat bermaydi. Texnikum ham tekshiriladi. Yangi o‘quvchi keyinchalik guruhga qo‘shilsa, mavjud ochiq nazoratlar unga ham ko‘rinadi.

## Variantlar

Bir o‘quvchiga 1–100 savol, bank hajmidan kam. Nashr paytida `C(bankSize,questionCount)` guruhdagi o‘quvchilar soniga yetishi tekshiriladi. Masalan, 300 tadan 25 yoki 30. Savollar va javoblar Fisher–Yates orqali `crypto.getRandomValues`dan olingan xolis indekslar bilan aralashtiriladi. Har o‘quvchining savollar **to‘plami** fingerprinti `UNIQUE(exam_id,variant_key)` bilan himoyalangan. Tasodifiy tanlash to‘qnashsa qayta tanlanadi; kombinatsiyalar kam qolganda deterministik qidiruv bo‘sh to‘plamni topadi. Keyinchalik guruh kengayib variantlar tugasa, bir xil variant berish o‘rniga tushunarli xato qaytadi.

`UNIQUE(exam_id,account_id)` har o‘quvchiga bitta urinish beradi. Savol tartibi va har savolning javob tartibi serverda o‘sha urinishga bog‘lab saqlanadi. Yangilash, boshqa qurilma yoki nazoratni yopib-ochish yangi variant yoki yangi urinish bermaydi. Savollarning ayrimlari o‘quvchilarda ustma-ust kelishi mumkin; butun to‘plamlar bir xil bo‘lmaydi. Javob tartibi har urinish uchun mustaqil aralashadi; bitta savolning variant tartibi hamma o‘quvchida mutlaqo noyob bo‘lishi matematik jihatdan talab qilinmaydi.

## Bajarish va natijalar

`/controls` — o‘quvchining nazoratlari. Javoblar 450 msdan keyin navbat bilan serverga saqlanadi, revision bilan eski oynaning ustidan yozishi bloklanadi. Saqlanmagan javoblar bilan chiqishda ogohlantirish bor; internet qaytganda qayta saqlanadi. O‘quvchi yakunlashni yana bir marta tasdiqlaydi, javobsiz savollar sonini ko‘radi. Server saqlangan variant bo‘yicha javoblarni tekshiradi; brauzerdan kelgan foiz, accountId va claimed correct hisobga olinmaydi. Yakunlash atomik, qayta POST natijani o‘zgartirmaydi. Natija 0–100%, to‘g‘ri/umumiy soni bilan ko‘rinadi. O‘quvchiga answer key va boshqa o‘quvchining varianti yuborilmaydi. Yakunlangach hatto o‘zining to‘g‘ri javoblari ham ko‘rsatilmaydi.

O‘qituvchi guruh a’zolari bo‘yicha «Boshlamagan / Boshlagan / Yakunlangan», to‘g‘ri javoblar, foiz va yakunlagan vaqtni ko‘radi. Bu alohida oraliq nazorat natijalari; eski mavzu testlarining admin hisobotiga aralashtirilmaydi. Vaqt chegarasi va qayta urinish hozirgi bosqichda yo‘q.

## Tekshiruv

`node checks/exams.test.mjs`: 300 savoldan 200 ta turli 25-savollik variant, javoblarni aralashtirish, takrorlanmaydigan to‘plamlar, variantlar tugashi, resume, server baholash, key maxfiyligi, ruxsatlar, revision va yopish/ochish.

`node checks/auth-runtime.test.mjs`: builddan keyin haqiqiy Worker + lokal D1 orqali yangi oqim ham tekshiriladi. Test ma’lumotlari productionga yozilmaydi.
