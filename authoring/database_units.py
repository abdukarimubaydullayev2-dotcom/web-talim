"""35 topic units, each followed by a two-hour practice lesson."""
UNITS=[]
def unit(group,title,concepts,code,expected,task,pitfall,mode='sqlite',fixture=True):
 UNITS.append(dict(group=group,title=title,concepts=[x.split('~',1) for x in concepts.split('|')],code=code,expected=expected,task=task,pitfall=pitfall,mode=mode,fixture=fixture))

unit(1,'Ma’lumotlar bazasi va boshqaruv tizimining vazifalari',
'Ma’lumot~Saqlanadigan fakt yoki qiymat. Kitob nomi va uning narxi ikki boshqa xususiyat; ularning ma’nosi ustun nomi hamda qoida bilan tushuntiriladi.|Baza~O‘zaro bog‘liq ma’lumotlarning tartibli to‘plami. Alohida Excel fayllari orasidagi takror va nomuvofiqlikni kamaytirish uchun yagona model kerak bo‘ladi.|MBBT~Bazani yaratish, o‘qish, o‘zgartirish, ruxsat va tiklashni boshqaradigan dastur. SQLite bilan PostgreSQL bir xil turdagi vazifani turli arxitekturada bajaradi.|Yaxlitlik~Qiymat va bog‘lanishlarning belgilangan qoidalarga mos qolishi. Masalan mavjud bo‘lmagan kitobga berilganlik yozuvi yaratilmasligi kerak.|Ma’lumot hayot sikli~Yig‘ish, tekshirish, saqlash, foydalanish, arxivlash va belgilangan tartibda o‘chirishni o‘z ichiga oladi. Cheksiz saqlash har doim to‘g‘ri qaror emas.',
'Kutubxona → kitoblar → a’zolar → berilgan kitoblar → qaytarish hisobi',
'Baza, uni boshqaruvchi dastur va undan foydalanadigan ilova vazifalari ajratiladi.',
'Texnikum kutubxonasi saqlaydigan 10 ta qiymatni yozing. Ularni qaysi obyektga tegishli ekaniga ko‘ra guruhlang; ikki yaxlitlik qoidasini belgilang.',
'Baza fayli bilan MBBT dasturini bitta tushuncha deb qabul qilmang.','report',False)
unit(1,'Jadval satr ustun va ma’lumot lug‘ati',
'Jadval~Bir turdagi mavjudlik yozuvlarini saqlaydi. Kitob jadvaliga har bir qarz berish hodisasini yangi kitob sifatida kiritish modelni buzadi.|Satr~Bitta yozuvning ustunlarga mos qiymatlari. Satrlarning fizik turish tartibi doimiy mantiqiy tartib hisoblanmaydi.|Ustun~Bitta xususiyatni ifodalaydi. books.title nomni, books.price_sum narxni saqlaydi; bir ustunga bir necha mustaqil ma’noni tiqishtirmang.|Domen~Ustun uchun ruxsat etilgan tip, oraliq va ma’no. Narx manfiy bo‘lmasligi domen qoidasiga misoldir.|Ma’lumot lug‘ati~Har ustunning nomi, ma’nosi, tipi, majburiyligi va cheklovini hujjatlashtiradi. Jamoa bir xil nomdan bir xil ma’noni tushunishi kerak.',
'books: id | title | price_sum | stock\n1 | JavaScript asoslari | 50000 | 3',
'Bitta kitob yozuvi to‘rtta ustun bilan tasvirlanadi.',
'Books jadvali uchun kamida beshta ustunli ma’lumot lug‘atini tuzing. Narxni butun so‘mda saqlash qarori va stock chegarasini izohlang.',
'Raqamga o‘xshagan telefon yoki inventar kodini avtomatik arifmetik son deb belgilamang.','report',False)
unit(1,'Birlamchi nomzod va tashqi kalitlar',
'Primary key~Satrni bir ma’noli aniqlaydi va NULL bo‘la olmaydi. Faqat ismga tayanish bir xil ismli ikki a’zoni adashtirishi mumkin.|Nomzod kalit~Yozuvni yagona ajratishga yaroqli minimal atribut yoki atributlar to‘plami. Ulardan biri primary key qilib tanlanadi.|UNIQUE~Takrorlanmas qiymatga talab beradi. NULL bilan ishlashi MBBT qoidalariga bog‘liq, shu sabab kerak bo‘lsa NOT NULL bilan birga belgilanadi.|Foreign key~Bir jadval qiymatini boshqa jadval kalitiga bog‘laydi. Bola jadvaldagi son oddiy yozuv emas, bog‘lanish qoidasining bir qismidir.|Sun’iy kalit~Ma’nodan mustaqil id. Ism yoki guruh nomi o‘zgarganda identifikatorni o‘zgartirishga majbur qilmaydi, ammo biznes noyobligi alohida cheklanishi mumkin.',
'members.id ← loans.member_id\nbooks.id ← loans.book_id\nmembers.card_no — takrorlanmas a’zolik kodi',
'Kitob berish yozuvi a’zo va kitob kalitlariga bog‘lanadi.',
'Members, books va loans kalitlarini belgilang. Ikki a’zoning ismi bir xil bo‘lganda yozuvlar nega aralashmasligini ko‘rsating.',
'Foreign key son yozish bilan emas, bazada tegishli cheklovni e’lon qilish bilan himoyalanadi.','report',False)
unit(1,'ER diagramma va bog‘lanish kardinalligi',
'Entity~Kitob, a’zo yoki berish hodisasi kabi mustaqil mavjudlik. Har biri o‘z ma’nosi va hayot sikliga ega.|Birga ko‘p~Bitta kategoriya ko‘p kitobga tegishli bo‘lishi mumkin. Tashqi kalit ko‘p tomondagi jadvalda saqlanadi.|Ko‘pga ko‘p~Bitta talaba ko‘p kursga, bitta kurs ko‘p talabaga bog‘lanadi. Bunday aloqa odatda oraliq jadval orqali ifodalanadi.|Oraliq jadval~Ikki tomon kalitlarini va bog‘lanish xususiyatlarini saqlaydi. Enrollment yozuvida talaba, kurs va ro‘yxatdan o‘tish sanasi turishi mumkin.|Kardinallik~Bog‘lanishda nechta yozuv ishtirok etishini bildiradi. Majburiy yoki ixtiyoriy qatnashish ham alohida ko‘rsatiladi.',
'categories 1 → N books\nmembers 1 → N loans\nbooks 1 → N loans',
'Kutubxona ER modelida loans hodisasi ikkita birga-ko‘p bog‘lanishni birlashtiradi.',
'Kutubxona ER diagrammasini chizing. Keyin talaba va kurs uchun ko‘pga-ko‘p aloqani oraliq jadvalga ajrating.',
'Bir katakka vergul bilan bir nechta id yozish to‘liq boshqariladigan bog‘lanish o‘rnini bosmaydi.','report',False)
unit(1,'Normalizatsiya va takroriy ma’lumot muammolari',
'Anomaliya~Takroriy ma’lumot sabab yangilash, qo‘shish yoki o‘chirishdagi nomuvofiqlik. Kategoriya nomini o‘n satrda alohida tuzatish bunga misoldir.|Birinchi normal shakl~Har atribut qiymati tanlangan domen doirasida yaxlit bo‘ladi va takrorlanuvchi ustun guruhlari ajratiladi. Bitta katakdagi mustaqil kitoblar ro‘yxati alohida yozuvlarga chiqariladi.|Ikkinchi normal shakl~Birinchi shaklga qo‘shimcha ravishda kalit bo‘lmagan atribut nomzod kalitning faqat bir qismiga bog‘lanib qolmaydi. Ayniqsa qo‘shma kalitlarda tekshiriladi.|Uchinchi normal shakl~Funksional bog‘liqliklar tekshiriladi: har bir notrivial bog‘liqlikning aniqlovchisi superkalit yoki bog‘liq atribut nomzod kalit tarkibida bo‘lishi kerak. Oddiy holatda kalit bo‘lmagan atribut orqali boshqa nomni takror saqlashdan qochiladi.|Denormalizatsiya~O‘lchangan o‘qish talabi uchun nazoratli takror kiritish. Qaysi nusxa asosiyligi va yangilanish tartibi hujjatlashtirilmasa ma’lumotlar ajralib ketadi.',
'Oldin: book_id | title | category_name\nKeyin: categories(id,name) va books(id,title,category_id)',
'Kategoriya nomi bitta joyda saqlanadi; kitob uni tashqi kalit bilan bildiradi.',
'Kitob, kategoriya va a’zo nomi takrorlangan jadvalni ajrating. Qo‘shma kalitli enrollment misolida qisman bog‘liqlikni ko‘rsating.',
'Jadvalni shunchaki ko‘p bo‘lakka bo‘lish normalizatsiya qoidalariga rioya etilganini isbotlamaydi.','report',False)

unit(2,'SQLite muhitida ishlash va SQL buyruqlari',
'SQLite~Ilova ichida ishlaydigan relatsion MBBT. Platformadagi mashq bazasi vaqtincha xotirada ochiladi va haqiqiy texnikum bazasiga ulanmaydi.|SQL~Jadval tuzilishi va yozuvlar bilan ishlash tili. Buyruqning natijasi tanlangan MBBT va mavjud sxemaga bog‘liq.|DDL~CREATE, ALTER va DROP orqali tuzilmani boshqaradi. Ular yozuvlarni tanlaydigan SELECT bilan bir vazifa emas.|DML~INSERT, UPDATE va DELETE yozuvlarni o‘zgartiradi; SELECT o‘qish uchun ishlatiladi. Bu buyruqlar avval demo ma’lumotda sinaladi.|Muharrir~SQL yoziladigan joy bilan uni bajaradigan baza mexanizmi farq qiladi. Run matnni mexanizmga uzatadi, natija yoki xato esa pastda ko‘rinadi.',
'SELECT sqlite_version() AS version;',
'version nomli bitta ustunda SQLite versiyasi chiqadi; raqam foydalanilayotgan muhitga bog‘liq.',
'Platformadagi SQL muharririni oching, versiyani oling. Keyin ataylab SELECT so‘zini xato yozib sintaksis xabarini kuzating.',
'Muharrirdagi kod saqlanishi bazadagi barcha yozuvlar doimiy saqlanadi degani emas.','sqlite',False)
unit(2,'Ma’lumot turlari aniqlik va NULL',
'SQLite tiplash~Oddiy SQLite jadvalida ustun affinitysi qiymatlarni saqlashga ta’sir qiladi, lekin PostgreSQLdagi qat’iy tip bilan bir xil emas. STRICT jadvallar alohida qat’iylik beradi.|INTEGER~Butun sonlar uchun. Narxni butun so‘mda saqlash ushbu kursda kasrli hisoblash noaniqligini chetlab o‘tish uchun tanlangan.|REAL~Suzuvchi nuqtali son. Ayrim o‘nli kasrlar aynan ifodalanmaydi; moliyaviy aniqlik talabini shunchaki REAL tanlash bilan hal qilmang.|NULL~Qiymat yo‘qligi yoki noma’lumligini bildiradi. Bo‘sh matn va nol bilan bir xil emas; tekshirish IS NULL bilan bajariladi.|PostgreSQL tiplari~NUMERIC aniqligi belgilangan o‘nli son, BOOLEAN mantiqiy qiymat, DATE sana uchun. Tiplarni SQLitega avtomatik aynan ko‘chirib bo‘lmaydi.',
'CREATE TABLE type_demo(id INTEGER PRIMARY KEY, price_sum INTEGER, note TEXT);\nINSERT INTO type_demo VALUES(1,50000,NULL);\nSELECT price_sum, note IS NULL AS no_note FROM type_demo;',
'price_sum 50000, no_note 1 chiqadi.',
'Narx, ism, sana, telefon va mantiqiy holat uchun tip tanlang. NULL va bo‘sh matnni ikki alohida yozuv bilan taqqoslang.',
'NULL= NULL ham odatiy TRUE natija bermaydi; IS NULL ishlating.','sqlite',False)
unit(2,'CREATE TABLE va ma’lumot cheklovlari',
'CREATE TABLE~Jadval nomi, ustunlar va cheklovlar bilan tuzilma yaratadi. IF NOT EXISTS mavjud jadvalning tuzilishini yangilamaydi.|NOT NULL~Qiymat bo‘lishini talab qiladi. Matnning bo‘sh bo‘lmasligi uchun bu cheklovga qo‘shimcha CHECK kerak bo‘lishi mumkin.|CHECK~Qator sharti bajarilishini nazorat qiladi. NULL natijasi SQLite CHECKni har doim buzmaydi; majburiylik NOT NULL bilan birga belgilanadi.|DEFAULT~INSERTda ustun ko‘rsatilmaganda boshlang‘ich qiymat beradi. Mijoz aniq NULL yuborsa DEFAULT uni avtomatik almashtiradi deb o‘ylamang.|Biznes cheklovi~Masalan stock>=0 ombor sonini himoya qiladi. Bir necha jadvalga tegishli murakkab qoida servis va tranzaksiya orqali ham boshqariladi.',
'CREATE TABLE items(\n id INTEGER PRIMARY KEY,\n title TEXT NOT NULL CHECK(length(trim(title))>0),\n stock INTEGER NOT NULL DEFAULT 0 CHECK(stock>=0)\n);\nINSERT INTO items(title) VALUES(\'Kitob\');\nSELECT title,stock FROM items;',
'Kitob nomli yozuvning stock qiymati 0 bo‘ladi.',
'Stock manfiy, title NULL va title bo‘sh holatlarini alohida sinang. Har bir xato qaysi cheklovga tegishli ekanini yozing.',
'Yaroqsiz kirishni faqat frontendda tekshirish bazaning o‘zidagi qoidani almashtirmaydi.','sqlite',False)
unit(2,'Foreign key o‘chirish siyosati va referensial yaxlitlik',
'Foreign key nazorati~SQLite ulanishida PRAGMA foreign_keys=ON yoqiladi. Jadvalda e’lon qilish bilan ulanishdagi tekshiruvni birgalikda tushunish kerak.|RESTRICT~Bog‘liq satr mavjud bo‘lsa ota yozuvni o‘chirishni rad etadi. Kutubxona tarixini yo‘qotmaslik uchun ongli tanlov bo‘lishi mumkin.|CASCADE~Ota o‘chirilganda bog‘liq bola yozuvlarini ham o‘chiradi. Tarixni saqlash talabiga zid bo‘lmasligi tekshiriladi.|SET NULL~Bog‘lanish o‘chsa bola ustunini NULL qiladi. Bu ustun NOT NULL bo‘lsa bunday siyosat bilan mos kelmaydi.|Yaxlitlik sinovi~Mavjud bo‘lmagan parent id bilan INSERT va bog‘liq parentni DELETE qilish orqali tanlangan siyosatning ishlashi isbotlanadi.',
'PRAGMA foreign_keys=ON;\nCREATE TABLE parents(id INTEGER PRIMARY KEY);\nCREATE TABLE children(id INTEGER PRIMARY KEY,parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE RESTRICT);\nINSERT INTO parents VALUES(1);\nINSERT INTO children VALUES(1,1);\nSELECT * FROM children;',
'id 1 va parent_id 1 yozuvi olinadi. Mavjud bog‘lanish bilan parentni o‘chirish RESTRICTga zid.',
'Demo jadvalda RESTRICT va CASCADE siyosatini alohida tajribalarda solishtiring. So‘ng kutubxona tarixi uchun qaysi siyosatni tanlashingizni asoslang.',
'CASCADE tarixiy yozuvlarni ham olib tashlashi mumkin; uni o‘ylamasdan hamma joyga qo‘shmang.','sqlite',False)
unit(2,'ALTER DROP va sxemani o‘zgartirish tartibi',
'ALTER TABLE~Mavjud jadval tuzilishini qo‘llab-quvvatlanadigan amallar doirasida o‘zgartiradi. Har MBBTning imkoniyati va sintaksisi tekshiriladi.|ADD COLUMN~Yangi ustun qo‘shadi. Eski satrlardagi qiymat va yangi majburiylik talabi oldindan rejalashtiriladi.|RENAME~Jadval yoki ustun nomini o‘zgartiradi. Ilovadagi SQL va hisobotlarda eski nom qolmaganini tekshirish kerak.|DROP TABLE~Jadval tuzilishi va yozuvlarini olib tashlaydi. DELETE faqat tanlangan satrlarni o‘chiradi; maqsadlari boshqa.|Migratsiya~O‘zgarishning versiyali, takrorlanishi nazorat qilingan tartibi. Test nusxada sinash, backup va tiklash rejasi bilan bajariladi.',
'CREATE TABLE draft_items(id INTEGER PRIMARY KEY,title TEXT);\nALTER TABLE draft_items ADD COLUMN note TEXT;\nALTER TABLE draft_items RENAME TO archived_items;\nPRAGMA table_info(archived_items);',
'archived_items jadvali id, title va note ustunlari bilan ko‘rinadi.',
'Faqat demo jadvalga note ustunini qo‘shing va nomini almashtiring. DROP va DELETE farqini yozma izohlang; haqiqiy bazada sinamang.',
'CREATE TABLE IF NOT EXISTS yangi ustunni eski jadvalga o‘zi qo‘shmaydi.','sqlite',False)

unit(3,'INSERT va yangi yozuvlarni boshqarish',
'Ustun ro‘yxati~INSERTda qiymatning qaysi ustunga tegishliligini ochiq yozadi. Jadval ustunlari o‘zgarganda tartibga ko‘r-ko‘rona tayanishdan saqlaydi.|Ko‘p satrli INSERT~Bir buyruqda bir nechta satr kiritadi. Ularning barchasi jadval cheklovlariga mos bo‘lishi kerak.|DEFAULT qo‘llash~Ustun tashlab ketilganda sxemadagi boshlang‘ich qiymat ishlatiladi. Bu yo‘q qiymatning ma’nosi bilan kelishilgan bo‘lishi lozim.|Identifikator~Kurs SQLite jadvalida INTEGER PRIMARY KEY qiymati berilmasa yangi id ajratiladi. id har doim uzluksiz ketma-ket bo‘lishiga tayanmang.|Tasdiqlash~INSERTdan keyin aniq SELECT bilan qiymat tekshiriladi. Xabar chiqmaganini ko‘rishning o‘zi to‘g‘ri yozuv yaratildi degan to‘liq dalil emas.',
'INSERT INTO books(title,category_id,price_sum,stock)\nVALUES(\'Yangi SQL kitob\',1,60000,4);\nSELECT title,price_sum,stock FROM books WHERE title=\'Yangi SQL kitob\';',
'Yangi SQL kitob, 60000 va 4 qiymatlari olinadi.',
'Ikki yangi kitob kiriting va to‘g‘ri kategoriyaga bog‘lang. Majburiy ustun yo‘q holatni ham sinang.',
'Qiymatlar soni bilan ko‘rsatilgan ustunlar soni mos bo‘lishi kerak.')
unit(3,'SELECT WHERE mantiqiy shartlar va NULL filtri',
'Proyeksiya~SELECTda qaysi ustunlarni qaytarishni tanlash. Keraksiz yoki maxfiy ustunlar tasodifan chiqmasligi uchun ro‘yxat aniq beriladi.|WHERE~Shartga mos satrlarni qoldiradi. AND ikkala shartni, OR kamida bittasini talab qiladi; aralash shartlarda qavs tushunarlilik beradi.|Ustuvorlik~AND odatda ORdan oldin baholanadi. Qavsni yozish niyatni aniq ko‘rsatadi va noto‘g‘ri guruhlashning oldini oladi.|IS NULL~Noma’lum yoki berilmagan qiymatni tekshiradi. Qaytarilmagan kitoblar returned_on IS NULL orqali tanlanadi.|DISTINCT~Natijadagi tanlangan ustunlar kombinatsiyasi takrorini olib tashlaydi. U noto‘g‘ri JOIN sababini avtomatik tuzatmaydi.',
'SELECT id,title FROM books\nWHERE category_id=1 AND price_sum>=50000;\nSELECT id FROM loans WHERE returned_on IS NULL ORDER BY id;',
'Birinchi natijada 1 va 2-kitob; ikkinchi natijada 1 va 3-qarz yozuvi chiqadi.',
'IT kategoriyasidagi arzon va qimmat kitoblarni shart bilan tanlang. Qaytarilgan va qaytarilmagan berishlarni alohida oling.',
'returned_on = NULL sharti IS NULL bilan bir xil ishlamaydi.')
unit(3,'UPDATE DELETE va ta’sir qamrovini nazorat qilish',
'UPDATE~Mavjud satrning belgilangan ustunlarini o‘zgartiradi. Qaysi satrga ta’sir qilishi WHERE bilan chegaralanadi.|DELETE~Tanlangan satrni o‘chiradi. Jadval tuzilishi qoladi; cheklov va bog‘lanishlar o‘chirishni rad etishi mumkin.|Oldindan SELECT~O‘zgartirish shartini avval SELECTda sinash qamrovni ko‘rishga yordam beradi. Ko‘p foydalanuvchili holatda tranzaksiya ham hisobga olinadi.|Ta’sirlangan satr~SQLite changes() oxirgi o‘zgartiruvchi amal qamrovini kuzatishga yordam beradi. Uni natijani tekshirishdan ajratmang.|Qaytarish rejasi~O‘chirishdan avval backup yoki tranzaksion sinov rejasi bo‘ladi. Tasdiqlangan o‘chirishni ROLLBACK har doim qaytaradi deb bo‘lmaydi.',
'SELECT id,stock FROM books WHERE id=3;\nUPDATE books SET stock=stock+1 WHERE id=3;\nSELECT id,stock FROM books WHERE id=3;',
'3-kitob stock qiymati 1 dan 2 ga oshadi.',
'Faqat 3-kitob qoldig‘ini yangilang. Keyin o‘zingiz qo‘shgan, loans bilan bog‘lanmagan demo kitobni o‘chiring.',
'WHERE yo‘q UPDATE yoki DELETE barcha mos jadval satrlariga ta’sir qilishi mumkin.')
unit(3,'ORDER BY LIMIT va matn bo‘yicha qidiruv',
'ORDER BY~Natijani tanlangan ustunlar bo‘yicha tartiblaydi. Teng qiymatlarda ikkinchi id tartibi barqaror natija beradi.|LIMIT OFFSET~Qaytariladigan satrlar soni va o‘tkazib yuborishni boshqaradi. Limit bo‘lmasa katta ro‘yxat keraksiz trafik keltiradi.|LIKE~Matn namunasi bo‘yicha qidiradi. Foiz istalgan uzunlikdagi, pastki chiziq bitta belgini ifodalaydi.|Kollatsiya~Matnlarni taqqoslash va tartiblash qoidasi. O‘zbekcha barcha harf va registrlar har bir standart funksiyada bir xil taniladi deb bo‘lmaydi.|Barqaror sahifa~Aniq ORDER BY bilan LIMIT birga ishlatiladi. Ma’lumot bir vaqtda o‘zgarsa OFFSET sahifalari siljishi mumkin; bu cheklov tushuntiriladi.',
'SELECT id,title,price_sum FROM books\nWHERE title LIKE \'%SQL%\' ORDER BY price_sum DESC,id ASC LIMIT 2;',
'SQL amaliyoti nomli 2-kitob 70000 narx bilan chiqadi.',
'Kitoblarni narx bo‘yicha kamayish tartibida chiqaring. Teng narxlar kiriting va id bilan qo‘shimcha tartibni ko‘rsating.',
'LIMITning o‘zi tartibni belgilamaydi; ORDER BY bo‘lmasa natija barqaror deb olinmaydi.')
unit(3,'Satr sana CASE va COALESCE funksiyalari',
'Satr funksiyasi~length, trim va substr kabi amallar matnni o‘lchaydi yoki ajratadi. O‘zbek belgilarida bayt uzunligi bilan belgilar sonini aralashtirmang.|Sana formati~Kurs SQLite bazasida ISO YYYY-MM-DD matni saqlanadi. Bir xil format sana bo‘yicha taqqoslashni tushunarli qiladi; vaqt mintaqasi talabi alohida qaror.|CASE~Shartga ko‘ra natija qiymatini tanlaydi. SELECTdagi CASE satrni bazada o‘zgartirmaydi, faqat chiqarilgan ko‘rinishni shakllantiradi.|COALESCE~Berilgan qiymatlardan birinchi NULL bo‘lmaganini oladi. Nol va bo‘sh matn NULL hisoblanmaydi.|Hisoblash vaqti~Hisobotda hozirgi sana o‘rniga aniq as_of sanasi berilsa mashq takrorlanuvchi bo‘ladi. Shu kurs qarzdorlikni 2026-10-20 sanasiga hisoblaydi.',
'SELECT id,COALESCE(returned_on,\'Qaytmagan\') AS holat,\n CASE WHEN returned_on IS NULL AND due_on<\'2026-10-20\'\n THEN \'Kechikkan\' ELSE \'Boshqa\' END AS belgi\nFROM loans ORDER BY id;',
'1 va 3-yozuv Kechikkan, 2-yozuv Boshqa deb belgilanadi.',
'Qaytmagan kitoblar uchun holat matni va kechikish belgisini yarating. Nol qiymatga COALESCE qo‘llanganda nima chiqishini alohida sinang.',
'CASE natija yorlig‘i beradi; u o‘z-o‘zidan UPDATE bajarmaydi.')

unit(4,'COUNT SUM AVG GROUP BY va HAVING',
'Agregat~Bir nechta satrdan jamlangan qiymat oladi. COUNT, SUM va AVG hisobotdagi turli savollarga javob beradi.|COUNT farqi~COUNT(*) satrlarni, COUNT(ustun) esa shu ustundagi NULL bo‘lmagan qiymatlarni sanaydi. Ular har vaziyatda bir xil natija bermaydi.|GROUP BY~Satrlarni tanlangan kalitlar bo‘yicha guruhlaydi. Har guruh uchun agregat alohida hisoblanadi.|HAVING~Guruhlashdan keyingi natijani shart bilan cheklaydi. WHERE esa guruhlashdan oldingi satrlarni tanlaydi.|Noaniq ustun~Guruh kalitida yoki agregatda bo‘lmagan ustunni natijaga chiqarish turli MBBTlarda boshqacha baholanadi. Portativ SQLda barcha tanlov ma’nosi aniq bo‘ladi.',
'SELECT category_id,COUNT(*) AS total,SUM(stock) AS copies\nFROM books GROUP BY category_id HAVING COUNT(*)>=2;',
'category_id 1, total 2 va copies 5 chiqadi.',
'Kategoriya bo‘yicha kitob soni va o‘rtacha narxni hisoblang. Kamida ikki kitobli kategoriyalarni HAVING bilan qoldiring.',
'WHERE ichida to‘g‘ridan-to‘g‘ri COUNT(*)>1 yozish guruh filtri o‘rnida to‘g‘ri emas.')
unit(4,'INNER JOIN va bir nechta jadvaldan axborot olish',
'INNER JOIN~ON shartiga mos kelgan ikki tomon satrlarini qaytaradi. Mosligi yo‘q satrlar natijaga kirmaydi.|ON sharti~Qaysi ustunlar orasida bog‘lanish ekanini bildiradi. books.category_id categories.idga tenglashtiriladi.|Alias~Jadval va ustunga qisqa nom beradi. Bir xil id nomlari bo‘lsa qaysi jadval nazarda tutilganini aniq yozish kerak.|Natija ko‘payishi~Birga-ko‘p aloqada bitta a’zo bir nechta berish satrida chiqishi tabiiy. Bu har doim dublikat xatosi emas.|Uch jadval~Loanni a’zo va kitob bilan bog‘lab to‘liq hisobot olinadi. Bog‘lanish yo‘li ER modelga mos bo‘lishi kerak.',
'SELECT b.title,c.name AS category\nFROM books b INNER JOIN categories c ON c.id=b.category_id\nORDER BY b.id;',
'Uch kitob o‘z kategoriya nomi bilan chiqadi.',
'Loans, members va booksni bog‘lab a’zo nomi, kitob nomi va due_on sanasini chiqaring.',
'ON shartini unutish natijani kartezian ko‘paytmaga aylantirishi mumkin.')
unit(4,'LEFT JOIN NULL va bog‘lanmagan yozuvlar',
'LEFT JOIN~Chap jadvalning barcha satrlarini saqlaydi. O‘ng tomonda moslik bo‘lmasa uning ustunlari NULL bo‘ladi.|Bog‘lanmagan satr~Masalan hech kitob olmagan a’zo. O‘ng jadval kaliti IS NULL bilan bunday a’zolar ajratiladi.|COUNT tanlovi~LEFT JOINdan keyin berishlar soni COUNT(loans.id) bilan olinadi. COUNT(*) mosligi yo‘q a’zo uchun ham bitta natija satrini sanaydi.|Shart joyi~O‘ng jadval ustuniga WHERE sharti NULL satrlarni chiqarib tashlashi mumkin. Shartning ON yoki WHEREda turishi natijaga ta’sir qiladi.|Qamrov~Hisobot barcha a’zolarni ko‘rsatishi kerakmi yoki faqat faol qatnashganlarnimi, oldindan aniqlanadi. JOIN turi shu talabga qarab tanlanadi.',
'SELECT m.id,m.name,COUNT(l.id) AS borrowed\nFROM members m LEFT JOIN loans l ON l.member_id=m.id\nGROUP BY m.id,m.name ORDER BY m.id;',
'Ali uchun 2, Vali uchun 1, Nodir uchun 0 berish chiqadi.',
'Hech kitob olmagan a’zolarni toping. COUNT(*) va COUNT(l.id) farqini Nodir misolida ko‘rsating.',
'O‘ng jadvalga noto‘g‘ri WHERE yozish LEFT JOINni amalda INNER JOINga o‘xshatib qo‘yishi mumkin.')
unit(4,'Ichki so‘rov EXISTS va to‘plamlarni birlashtirish',
'Ichki so‘rov~Boshqa SQL ichida ishlaydigan SELECT. Natijasi bitta qiymat, ro‘yxat yoki mavjudlik sharti bo‘lishi mumkin.|EXISTS~Ichki so‘rov kamida bitta satr berganini tekshiradi. Natijadagi ustun qiymatining o‘ziga tayanmaydi.|IN~Qiymatni berilgan ro‘yxat bilan taqqoslaydi. NULL qatnashgan NOT IN kutilmagan noma’lum natija berishi mumkin.|Korrelyatsiya~Ichki so‘rov tashqi satr qiymatiga murojaat qiladi. members.id bilan loans.member_id bog‘lanishi bunga misoldir.|UNION ALL~Ikki mos shakldagi natijani birlashtirib takrorlarni saqlaydi. UNION esa takrorlarni olib tashlash xarajati va semantikasiga ega.',
'SELECT m.name FROM members m\nWHERE EXISTS(SELECT 1 FROM loans l WHERE l.member_id=m.id AND l.returned_on IS NULL)\nORDER BY m.id;',
'Ali va Vali chiqadi; Nodirda qaytmagan kitob yo‘q.',
'NOT EXISTS bilan kitob olmagan a’zoni toping. Xuddi shu natijani LEFT JOIN orqali oling va izohlang.',
'NULL bo‘lishi mumkin bo‘lgan ichki natijaga NOT IN qo‘llashdan oldin uch qiymatli mantiqni hisobga oling.')
unit(4,'CTE va oynali funksiyalar bilan hisobot',
'CTE~WITH orqali so‘rov ichida nomlangan oraliq natija beradi. Murakkab hisobotni o‘qiladigan bosqichlarga ajratadi.|Oynali funksiya~Satrlarni yo‘qotmay, ular ustida guruhiy hisoblash bajaradi. GROUP BY kabi har guruhni bitta satrga yig‘ib qo‘ymaydi.|OVER~Oynaning bo‘linishi va tartibini belgilaydi. PARTITION BY kategoriya kesimida, ORDER BY esa shu kesimdagi tartibni beradi.|ROW NUMBER~Tanlangan tartib bo‘yicha ketma-ket raqam beradi. Teng narxlarda id bilan qo‘shimcha tartib yozish natijani barqaror qiladi.|Hisobot semantikasi~Raqam va reyting ma’nosi talabga mos tanlanadi. RANK teng qiymatlarda bo‘shliq qoldirishi mumkin, ROW_NUMBER esa har satrga alohida raqam beradi.',
'WITH ranked AS(\n SELECT id,title,category_id,ROW_NUMBER() OVER(PARTITION BY category_id ORDER BY price_sum DESC,id) AS rn\n FROM books\n) SELECT id,title FROM ranked WHERE rn=1 ORDER BY id;',
'Har kategoriyadagi eng qimmat kitob: id 2 va id 3 chiqadi.',
'CTE bilan kategoriya bo‘yicha kitoblarni raqamlang. Teng narxli ikkita kitob qo‘shib tartibni id bilan aniq belgilang.',
'Oynadagi ORDER BY yakuniy natijaning tashqi tartibini avtomatik kafolatlamaydi.')

unit(5,'VIEW va triggerdan maqsadli foydalanish',
'VIEW~Saqlangan SELECT ta’rifidir. Oddiy view natijani doimiy materiallashtirib qo‘ymaydi; o‘qilganda bazadagi holatga qarab natija olinadi.|Abstraksiya~Murakkab JOINga barqaror nom berib hisobotni soddalashtiradi. Bazaviy ustun o‘zgarsa view va ilova birga tekshiriladi.|Trigger~Belgilangan jadval hodisasida bajariladigan baza amali. Kichik audit yoki qoida uchun ishlatiladi, yashirin murakkab biznes jarayoniga aylantirilmaydi.|Audit~Qachon qaysi obyektga nima bo‘lganini qayd etadi. Parol va maxfiy qiymatlar auditga ko‘chirilmaydi.|Yashirin ta’sir~Trigger qo‘shimcha yozuv yoki xato keltirishi mumkin. Testda faqat asosiy jadval emas, shu yon ta’sirlar ham tekshiriladi.',
 'CREATE VIEW open_loans AS SELECT id,member_id,book_id,due_on FROM loans WHERE returned_on IS NULL;\nSELECT id FROM open_loans ORDER BY id;\nCREATE TABLE audit(id INTEGER PRIMARY KEY,loan_id INTEGER);\nCREATE TRIGGER audit_returns AFTER UPDATE OF returned_on ON loans\nBEGIN INSERT INTO audit(loan_id) VALUES(NEW.id); END;',
'Viewdan id 1 va 3 olinadi; bazada loans yozuvlari saqlanadi.',
'Qaytmagan berishlar viewini yarating. Alohida demo jadvalda INSERT hodisasini auditga yozadigan sodda trigger tuzing.',
'View barcha hollarda tezroq ishlaydi deb bo‘lmaydi; reja va real o‘lchov kerak.')
unit(5,'Tranzaksiya ACID COMMIT va ROLLBACK',
'Atomiklik~Bir biznes amalining barcha o‘zgarishi birgalikda tasdiqlanadi yoki bekor qilinadi. Kitob qoldig‘i va berish yozuvi yarim holatda qolmasligi kerak.|Izchillik~Tranzaksiya belgilangan cheklov va biznes qoidalariga mos holatni saqlashi kerak. Tranzaksiya noto‘g‘ri yozilgan biznes qoidani o‘zi tuzatmaydi.|Izolyatsiya~Bir vaqtda bajarilayotgan tranzaksiyalar bir-birining oraliq holatini qanchalik ko‘rishini belgilaydi. MBBT va isolation darajasiga bog‘liq.|Doimiylik~Tasdiqlangan o‘zgarishning saqlanish xususiyati. Disk, jurnal va sozlama siyosati ham ahamiyatli; elektr uzilishiga oid kafolatlar sozlamaga qarab baholanadi.|COMMIT va ROLLBACK~Birinchisi joriy tranzaksiyani tasdiqlaydi, ikkinchisi uning o‘zgarishini bekor qiladi. Avval tasdiqlangan boshqa amallar avtomatik qaytmaydi.',
'BEGIN;\nUPDATE books SET stock=stock-1 WHERE id=1 AND stock>0;\nSELECT stock FROM books WHERE id=1;\nROLLBACK;\nSELECT stock FROM books WHERE id=1;',
'Tranzaksiya ichida stock 2, ROLLBACKdan keyin 3 chiqadi.',
'Kitob qoldig‘ini kamaytirish bilan loansga yozishni bitta tranzaksiyaga birlashtiring. Ikkinchi qadam xato bo‘lsa birinchi o‘zgarish qolmasligini tekshiring.',
'Xatoni ushlab turib baribir COMMIT qilish yarim bajarilgan holatni saqlashi mumkin.')
unit(5,'SAVEPOINT va bir vaqtdagi yozuvlar',
'SAVEPOINT~Tranzaksiya ichida nomlangan oraliq nuqta yaratadi. Ayrim o‘zgarishlarni bekor qilib tashqi tranzaksiyani davom ettirishga yordam beradi.|ROLLBACK TO~Tanlangan savepointdan keyingi amallarni bekor qiladi. Tashqi tranzaksiya hali faol qolishi mumkin.|RELEASE~Savepointni yakunlaydi. Ichki nuqtani release qilish tashqi tranzaksiyaning har doim diskka COMMIT bo‘lishi degani emas.|Yozuv raqobati~SQLite odatda bir vaqtda bitta yozuvchi bilan ishlaydi. Uzun tranzaksiya boshqa yozuvlarni kutdirishi yoki busy xatosi keltirishi mumkin.|Qayta urinish~Faqat o‘ylangan idempotent amal va cheklangan urinish siyosati bilan bajariladi. Har xatoda buyruqni cheksiz takrorlash muammoni kuchaytiradi.',
'BEGIN;\nUPDATE books SET stock=4 WHERE id=1;\nSAVEPOINT draft;\nUPDATE books SET stock=9 WHERE id=1;\nROLLBACK TO draft;\nRELEASE draft;\nCOMMIT;\nSELECT stock FROM books WHERE id=1;',
'stock 4 bo‘lib qoladi; savepointdan keyingi 9 qiymati bekor qilingan.',
'Ikki o‘zgarishli tajribada ikkinchisini SAVEPOINT bilan bekor qiling. Ikki lokal ulanish bilan band baza holatini kuzating va hisobot yozing.',
'Brauzerdagi bitta mashq ulanishi ikki haqiqiy server ulanishi izolyatsiyasini to‘liq namoyish qilmaydi.')
unit(5,'Indeks va EXPLAIN QUERY PLAN',
'Indeks~Ayrim qidirish va tartiblashni tezlashtiradigan yordamchi tuzilma. Disk hamda INSERT va UPDATE xarajatini oshirishi mumkin.|Qo‘shma indeks~Bir nechta ustun tartibini saqlaydi. (member_id,due_on) bilan (due_on,member_id) har so‘rov uchun bir xil emas.|Reja~MBBT so‘rovni qanday bajarishni tanlaganini ko‘rsatadi. SQLite EXPLAIN QUERY PLAN skan va indeksdan foydalanishni kuzatishga yordam beradi.|Selektivlik~Shart nechta satrni tanlashiga bog‘liq xususiyat. Juda kichik jadvalda to‘liq skan tanlanishi indeks ishlamaydi degani emas.|O‘lchov~Bir xil ma’lumot, shart va muhitda vaqt solishtiriladi. Uch satrli demo natijasidan katta baza unumdorligini umumlashtirmang.',
'CREATE INDEX idx_loans_member_due ON loans(member_id,due_on);\nEXPLAIN QUERY PLAN SELECT id FROM loans WHERE member_id=1 ORDER BY due_on;',
'Rejada idx_loans_member_due nomi ko‘rinishi mumkin; tanlov SQLite versiyasi va statistikaga bog‘liq.',
'Berilgan so‘rov rejasini indeksdan oldin va keyin oling. Qaysi ustun tartibi mosligini izohlang; kichik jadval bo‘yicha tezlik haqida katta xulosa bermang.',
'Har ustunga indeks qo‘shish har doim unumdorlikni oshirmaydi.')
unit(5,'Migratsiya parametrli SQL va sxema versiyasi',
'Migratsiya versiyasi~Qaysi sxema o‘zgarishi qo‘llanganini qayd etadi. SQLite PRAGMA user_version o‘quv loyihasida shu belgi sifatida ishlatilishi mumkin.|Boshqarilgan o‘zgarish~Sxema va ma’lumot mosligi tekshirilib keyin yangi dastur versiyasi ishga tushiriladi. Migratsiya backupning o‘rnini bosmaydi.|Parametr~Foydalanuvchi qiymati SQL tuzilmasiga matn sifatida qo‘shilmaydi. SQLite ? va Node pg uchun $1 kabi placeholderlar haydovchiga bog‘liq.|Nomlar ro‘yxati~Jadval yoki sort ustuni qiymat placeholderi bo‘la olmaydi. Dinamik nom oldindan ruxsat etilgan ro‘yxatdan olinadi.|SQL injection~Ishonchsiz qiymat so‘rov tuzilishini o‘zgartirishi xavfi. Parametrli so‘rov va ruxsatlar birga ishlatiladi; faqat qo‘shtirnoqni almashtirishga tayanilmaydi.',
'PRAGMA user_version=1;\nALTER TABLE books ADD COLUMN shelf TEXT;\nPRAGMA user_version=2;\nPRAGMA user_version;',
'user_version 2 chiqadi va booksga shelf ustuni qo‘shilgan bo‘ladi.',
'Sxemaga shelf qo‘shadigan bir martalik migratsiya rejasini yozing. So‘ng qiymat placeholderi va jadval nomi tanlovi farqini Node misolida ko‘rsating.',
'Bir migratsiyani takroran bajarish ustun allaqachon mavjud xatosiga olib kelishi mumkin.')

unit(6,'PostgreSQL server psql va SQLite bilan farqlar',
'Mijoz server modeli~PostgreSQL alohida server jarayonida ishlaydi, psql va ilovalar unga ulanadi. SQLite esa odatda jarayon ichida baza fayliga murojaat qiladi.|psql~PostgreSQL buyruq qatori mijozi. Uning teskari chiziqli meta-buyruqlari SQL emas va SQLite muharririda ishlamaydi.|Ulanish~Host, port, baza, foydalanuvchi va autentifikatsiya orqali bajariladi. Parolni buyruq tarixiga ochiq yozmaslik uchun xavfsiz prompt yoki muhit siyosati tanlanadi.|Dialekt~Umumiy SELECT bilimlari ko‘chadi, ammo tip, identity, sana va boshqaruv buyruqlari farqlanadi. Kurs PostgreSQL 18 qo‘llanmasiga tayanadi.|Tekshirish~SELECT version() aynan qaysi serverga ulanganingizni ko‘rsatadi. Muharrir nomini ko‘rish server versiyasini tasdiqlamaydi.',
'psql -h localhost -U student -d library_demo\n# psql ichida:\nSELECT version();\n\\conninfo',
'Lokal PostgreSQL server versiyasi va ulanish ma’lumoti chiqadi. SQLite oynasida bu buyruqlar bajarilmaydi.',
'O‘qituvchi nazoratidagi lokal PostgreSQLga student hisobida ulaning. Server, baza va foydalanuvchini qayd eting.',
'psql o‘rnatilgani PostgreSQL serveri ham ishlayapti degani emas.','postgres',False)
unit(6,'PostgreSQL schema identity va qat’iy turlar',
'Schema~Baza ichidagi obyekt nomlari makoni. library.books to‘liq nomi qaysi jadvalga murojaat qilinayotganini aniqlashtiradi.|Identity~GENERATED ALWAYS AS IDENTITY server boshqaradigan sonli identifikator beradi. Bu avtomatik UNIQUE yoki primary key qoidasini o‘zi almashtirmaydi.|NUMERIC~Belgilangan aniqlikdagi o‘nli qiymat uchun. Narx siyosati scale va yaxlitlash qoidasi bilan birga yoziladi.|DATE~Sanani maxsus tipda saqlaydi. TIMESTAMP va TIMESTAMPTZ vaqt bilan ishlashda boshqa ma’noga ega; vaqt mintaqasi talabi tanlanadi.|Qat’iy tip~Noto‘g‘ri turdagi qiymat baza tomonidan rad etilishi mumkin. SQLite oddiy jadvalidagi affinity bilan aynan bir xil deb bo‘lmaydi.',
'CREATE SCHEMA library;\nCREATE TABLE library.sample_books(\n id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n title TEXT NOT NULL,price NUMERIC(12,2) CHECK(price>=0),published_on DATE\n);',
'PostgreSQLda library.sample_books yaratiladi; buyruqlar vakolatli demo hisobda bajariladi.',
'PostgreSQL demo schema ichida identity, NUMERIC va DATE ustunli jadval yarating. Noto‘g‘ri sana va noto‘g‘ri narx holatini sinang.',
'PostgreSQL DDLni SQLite muharririda tekshirish uning PostgreSQLda to‘g‘riligini isbotlamaydi.','postgres',False)
unit(6,'Rollar GRANT REVOKE va eng kam huquq',
'Rol~PostgreSQL huquqlari va obyektlarga egalik bilan bog‘liq identifikator. LOGIN atributli rol ulanish uchun ishlatilishi mumkin.|GRANT~Muayyan obyektga belgilangan amal huquqini beradi. Bitta bazaga ulanish boshqa barcha jadvallarni o‘qish huquqini avtomatik bermaydi.|REVOKE~Berilgan huquqni qaytaradi. Meros orqali olingan boshqa huquqlar qolishi mumkin; haqiqiy foydalanuvchi bilan qayta sinash kerak.|Eng kam huquq~Ilova faqat kerakli jadval va amallarga ruxsat oladi. Oddiy veb ilovani superuser sifatida ishlatish zarur emas.|Egalik va sxema~Jadval egasi bilan o‘quvchining read-only roli boshqa. Schema USAGE va jadval SELECT kabi huquqlar birgalikda talab qilinishi mumkin.',
'-- Faqat demo baza egasi yoki ruxsatli administrator bilan\nCREATE ROLE library_reader NOLOGIN;\nGRANT USAGE ON SCHEMA library TO library_reader;\nGRANT SELECT ON ALL TABLES IN SCHEMA library TO library_reader;\nREVOKE INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA library FROM library_reader;',
'Reader guruh roli mavjud jadvallarni o‘qishga mo‘ljallanadi. Kelajak jadvallari uchun default privilege alohida boshqariladi.',
'Demo bazada read-only rol tayyorlang. Shu rolga a’zo test hisobida SELECT o‘tishini, INSERT rad etilishini ko‘rsating.',
'ALL TABLES hozirgi obyektlarga ta’sir qiladi; keyin yaratiladigan jadvallar avtomatik aynan shu huquqni oladi deb o‘ylamang.','postgres',False)
unit(6,'MVCC izolyatsiya va blokirovkani kuzatish',
'MVCC~Bir vaqtdagi tranzaksiyalar uchun satr versiyalari orqali ko‘rinishni boshqaradi. Har SELECT barcha boshqa tranzaksiyalarning tasdiqlanmagan holatini ko‘rmaydi.|Read Committed~PostgreSQLning odatiy darajasi. Bir tranzaksiya ichidagi ikki buyruq orasida boshqa tasdiqlangan o‘zgarish ko‘rinishi mumkin.|Repeatable Read~Tranzaksiya uchun barqarorroq snapshot beradi. Serialization xatolari kabi holatlarda butun tranzaksiyani qayta urinish kerak bo‘lishi mumkin.|Row lock~FOR UPDATE tanlangan satrni yozuv nizosida boshqarishga yordam beradi. Uzun tranzaksiya boshqa ishlarni kutdiradi.|Deadlock~Tranzaksiyalar bir-biri ushlab turgan resursni kutganda yuz berishi mumkin. Izchil lock tartibi va qisqa tranzaksiyalar xavfni kamaytiradi.',
'-- PostgreSQL 1-oyna\nBEGIN;\nSELECT id FROM library.sample_books WHERE id=1 FOR UPDATE;\n-- Kuzatuv tugagach:\nROLLBACK;',
'1-oyna tanlangan satr lockini ushlaydi; mos satrni yangilovchi boshqa ulanish kutishi mumkin.',
'Ikki lokal ulanishda bitta demo satrni yangilang. Biri ochiq tranzaksiyada turganda ikkinchisi holatini kuzating; so‘ng ikkisini ham xavfsiz tugating.',
'Bitta brauzer SQLite ulanishi PostgreSQL MVCC yoki ikki server ulanishi lock sinovining o‘rnini bosmaydi.','postgres',False)
unit(6,'Zaxira nusxa pg dump va alohida bazaga tiklash',
'Mantiqiy backup~Sxema va ma’lumotni qayta yaratishga yaroqli ko‘rinishda chiqaradi. PostgreSQL pg_dump bitta baza uchun bunday vosita beradi.|Custom format~pg_dump -Fc pg_restore bilan mos arxiv yaratadi. Bu oddiy matnli SQL dump bilan bir xil tiklash buyrug‘iga ega emas.|Tiklash~Yangi alohida demo bazada bajarilib yozuvlar va cheklovlar solishtiriladi. Ishlab turgan bazaning ustiga yozish tiklash sinovi uchun shart emas.|Huquq obyektlari~pg_dump odatda klasterdagi barcha rol obyektlarini qamramaydi. Rollar va umumiy obyektlar siyosati alohida rejalashtiriladi.|Versiya mosligi~Dump vositasi serverdan eski bo‘lsa qo‘llab-quvvatlash cheklovi bo‘lishi mumkin. Manba, vosita va maqsad versiyalari tekshiriladi.',
'pg_dump -h localhost -U student -d library_demo -Fc -f library_demo.dump\ncreatedb -h localhost -U student library_restore\npg_restore -h localhost -U student -d library_restore --no-owner library_demo.dump',
'Vakolat va vositalar mavjud bo‘lsa alohida library_restore bazasida nusxa tiklanadi.',
'Faqat demo bazaning nusxasini oling va yangi bazaga tiklang. Jadvallar, satrlar soni va foreign key holatini solishtiring.',
'Backup fayli borligi tiklash muvaffaqiyatli bo‘lishini o‘zi isbotlamaydi.','postgres',False)

unit(7,'Yakuniy kutubxona bazasi talablari va ER modeli',
'Talab~Qaysi ma’lumot, amal va hisobot kerakligini tekshirib bo‘ladigan shaklda yozadi. Kutubxonada kitob, a’zo va berish hodisasi alohida ko‘riladi.|Qabul mezoni~Masalan mavjud bo‘lmagan kitobga loan qo‘shilmasligi aniq salbiy testga aylanadi. Faqat baza yaxshi ishlasin degan ibora o‘lchanmaydi.|Tarix~Qaytarilgan berish yozuvini o‘chirmay returned_on bilan belgilash tarixni saqlaydi. Bu loyiha siyosati cheklovlar bilan mos bo‘ladi.|Ma’lumot lug‘ati~Ustun ma’nosi, birlik va NULL siyosatini ko‘rsatadi. price_sum butun so‘mda, sana ISO formatida deb kelishiladi.|Loyiha chegarasi~Bu kichik o‘quv katalogi. Haqiqiy kutubxonada nusxa inventari, shaxsiy ma’lumot va parallel band qilish kabi qo‘shimcha talablar alohida loyihalanadi.',
'categories → books → loans ← members\nQoidalar: stock>=0; due_on>=issued_on; FKlar mavjud; returned_on NULL bo‘lishi mumkin.',
'Tekshiriladigan to‘rtta jadval modeli va qabul mezonlari tayyorlanadi.',
'Yakuniy bazaning ER diagrammasi va 10 bandli ma’lumot lug‘atini tuzing. Beshta ijobiy va beshta salbiy qabul mezonini yozing.',
'Faylda jadval borligini ko‘rish barcha biznes qoidalar tekshirilganini bildirmaydi.','report',False)
unit(7,'Loyiha sxemasi cheklov va boshlang‘ich ma’lumotlar',
'Sxema skripti~Yangi demo baza uchun barcha jadvallarni bog‘lanish tartibida yaratadi. Mavjud baza yangilanishi alohida migratsiya masalasidir.|Seed~Dars va testni bir xil boshlang‘ich ma’lumot bilan ta’minlaydi. Seedning qayta bajarilishi takroriy kalit bermasligi yoki bir martalik ekani ochiq yoziladi.|Foreign key tartibi~Avval parent, keyin unga murojaat qiladigan child yozuvlar kiritiladi. O‘chirishda bog‘lanish siyosati hisobga olinadi.|Sana qoidasi~Due sana issued sanadan oldin bo‘lmasligi tekshiriladi. Kurs SQLite matn sanasi uchun ISO format kelishuviga tayanadi; qat’iy kalendar tekshiruvi alohida qo‘shilishi mumkin.|Portativlik~SQLite va PostgreSQL sxemalari bir xil modelni ifodalashi mumkin, lekin id va sana tiplarining yozilishi farq qiladi. Ikkita skript ochiq ajratiladi.',
'SELECT name FROM sqlite_master WHERE type=\'table\' AND name NOT LIKE \'sqlite_%\' ORDER BY name;',
'books, categories, loans va members jadvallari ko‘rinadi.',
'Loyiha ZIPidagi schema va seedni yangi demo bazada ishga tushiring. Takroriy kalit, manfiy stock va noto‘g‘ri FK holatini tekshiring.',
'Sxema va seedni haqiqiy ma’lumot bazasiga ko‘r-ko‘rona qayta qo‘llamang.')
unit(7,'Loyiha hisobotlari qarzdorlik va kitob harakati',
'As of sana~Hisobot qaysi sanaga tuzilganini bildiradi. Kurs 2026-10-20 ni ishlatadi, shuning uchun testlar kalendar o‘tishi bilan o‘zgarmaydi.|Qarzdorlik~returned_on NULL va due_on hisobot sanasidan kichik bo‘lsa kechikkan deb olinadi. Muddat aynan teng bo‘lgandagi qoida ham belgilanadi.|JOIN hisobot~A’zo nomi, kitob nomi va muddat bir natijada beriladi. Har ustunning qaysi jadvaldan kelgani aniq bo‘ladi.|Jamlanma~Bir kitob necha marta berilganini tarixiy loans satrlaridan hisoblaydi. Joriy stock bilan tarixiy berishlar soni bir xil ko‘rsatkich emas.|Tekshirish~Kutiladigan id va qiymatlar oldindan yozilib so‘rov natijasi bilan solishtiriladi. Faqat jadval chiroyli ko‘ringaniga tayanilmaydi.',
'SELECT l.id,m.name,b.title,l.due_on FROM loans l\nJOIN members m ON m.id=l.member_id\nJOIN books b ON b.id=l.book_id\nWHERE l.returned_on IS NULL AND l.due_on<\'2026-10-20\' ORDER BY l.id;',
'1 va 3-loan yozuvlari a’zo, kitob va muddat bilan olinadi.',
'Qarzdorlar, eng ko‘p berilgan kitoblar va kitob olmagan a’zolar hisobotlarini yarating. Natijalarni demo ma’lumot bilan tekshiring.',
'Qaytarilgan kitobni faqat due_on eski ekan deb hozirgi qarzdorlar ro‘yxatiga qo‘shmang.')
unit(7,'Backenddan parametrli so‘rov va baza integratsiyasi',
'Driver~Ilova tili bilan MBBT orasida ulanish va so‘rov interfeysini beradi. Node ichki SQLite va pg drayveri boshqa APIlarga ega.|Parametrli SELECT~Qidiruv qiymati SQL matnidan alohida beriladi. Qo‘shtirnoqli ism oddiy ma’lumot sifatida ishlashi kerak.|Ulanish hayoti~Baza ochilishi, qayta foydalanilishi va yopilishi boshqariladi. Har so‘rovda cheksiz ulanish ochish resurs sarfini oshiradi.|Xato chegarasi~Baza cheklov xatosi izchil ilova xatosiga aylantiriladi. Mijozga parol, ulanish satri va to‘liq SQL xatosi qaytarilmaydi.|Tranzaksiya bog‘lanishi~Bir biznes amaliga tegishli so‘rovlar bitta ulanishdagi tranzaksiyada yuradi. Pooldan turli ulanish olib BEGIN va COMMITni ajratib yubormang.',
'// Node.js 24, db avval ochilgan bo‘lsin\nconst query=db.prepare("SELECT id,title FROM books WHERE title=?");\nconst rows=query.all("SQL amaliyoti");\nconsole.log(rows);\n// PostgreSQL pg: client.query("SELECT id,title FROM library.books WHERE title=$1",[title]);',
'Bu Node kodi tegishli driver va ochiq baza bilan ishlaydi. Uni SQL muharririga butunlay ko‘chirish mumkin emas.',
'Node 24 orqali tayyor SQLite bazasiga parametrli qidiruv yozing. Oddiy nom va qo‘shtirnoqli matnni tekshiring; so‘rov tuzilishi o‘zgarmasin.',
'SQL matniga foydalanuvchi qiymatini + orqali ulash parametrli so‘rov hisoblanmaydi.','node',False)
unit(7,'Loyiha sinovlari zaxiradan tiklash va himoya',
'Unit sinov~Alohida tekshiruv yoki natija hisobini sinaydi. Baza cheklovlari haqiqiy SQLite muhitidagi integratsion sinov bilan ham tasdiqlanadi.|Salbiy sinov~Manfiy stock, takroriy card_no, noto‘g‘ri foreign key va sana tartibi rad etilishini tekshiradi. Xato xabari chiqishi bilan birga holat buzilmaganligi ham ko‘riladi.|Rollback sinovi~Tranzaksiyaning ikkinchi amali xato bo‘lganda birinchi o‘zgarish qolmasligi isbotlanadi. Har bir test yangi demo holatdan boshlanadi.|Tiklash dalili~Yopilgan demo SQLite faylining nusxasi alohida joyda ochilib yozuv va hisobotlar tekshiriladi. Ishlayotgan WAL bazasini faqat bitta fayl ko‘chirish bilan backup qildim deb bo‘lmaydi.|Himoya~ER model, cheklov, uch hisobot, salbiy sinov va tiklash dalili tushuntiriladi. O‘quvchi qaysi cheklov hali ilova darajasida qolganini ham ayta oladi.',
'node test.cjs\n# Faqat ZIPdagi alohida loyiha katalogida.\n# Testlar vaqtinchalik bazani yaratib, keyin tozalaydi.',
'ZIPdagi SQLite loyiha testlari bajarilib aniq assert natijalari chiqadi.',
'Yakuniy loyiha ZIPidagi testlarni bajaring. ER modelni, uchta so‘rovni va alohida backupdan tiklash natijasini 5 daqiqalik namoyishda tushuntiring.',
'Barcha yozilgan testlar o‘tishi yozilmagan barcha holatlar ham tekshirildi degani emas.','report',False)

assert len(UNITS)==35 and all(len(u['concepts'])==5 for u in UNITS)
