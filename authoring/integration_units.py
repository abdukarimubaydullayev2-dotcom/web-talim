"""Module 8 canonical instructional units. One theory, one practice per unit.
A section checkpoint follows each four units; 5 * (8+1) = 45 lessons.
"""
UNITS=[]
def unit(title,mode,concepts,code,expected,task,pitfall,case):
 UNITS.append(dict(title=title,mode=mode,concepts=[tuple(x.split('~',1)) for x in concepts.strip().split('\n')],code=code.strip(),expected=expected,task=task,pitfall=pitfall,case=case))
unit('Ilova arxitekturasi va qabul mezonlari','report','''Integratsiya~Frontend hodisasi API so‘roviga, server tekshiruvi baza amaliga, javob esa interfeys holatiga ulanadi. Har qatlam alohida ishlashi butun jarayon ishlashini kafolatlamaydi.
Talab~Foydalanuvchi bajaradigan ishni ifodalaydi. Vazifa qo‘shish talabi uchun kim, qaysi maydon va muvaffaqiyat natijasi aniqlanadi.
Qabul mezoni~Kuzatiladigan natijadir. Bo‘sh sarlavha rad etilishi va to‘g‘ri sarlavha ro‘yxatda paydo bo‘lishi alohida mezon bo‘ladi.
Chegara~O‘quv ilovasi demo vazifalarni saqlaydi, login va foydalanuvchi ajratishi yo‘q. Uni real shaxsiy ma’lumotli ommaviy xizmat sifatida talqin qilinmaydi.
Izchillik~Bir amalning kirishi va natijasi barcha qatlamlarda bir xil ma’noni saqlashi kerak. done qiymati brauzerda boolean, bazada esa 0 yoki 1 shaklida bo‘lishi mumkin.''','''Foydalanuvchi → forma → POST /api/tasks → SQLite
201 javob → yangi ro‘yxat → ekrandagi vazifa
Qabul: title="Dars" → 201; title=" " → 400''','Sxemada uch qatlam, ikki qabul mezoni va ilova chegarasi ko‘rsatiladi.','Vazifa qo‘shish, tugallash va o‘chirish uchun 6 ta tekshiriladigan qabul mezoni yozing.','Faqat sahifa ochilishini butun integratsiya muvaffaqiyati deb qabul qilmang.','Frontend va API alohida ishladi. Integratsiya tugadimi?~Yo‘q, haqiqiy foydalanuvchi oqimi ham tekshiriladi.~Ha, ikki server yonsa yetarli.~Ha, HTML fayli bo‘lsa yetarli.~Baza mavjudligi barcha sinov o‘rnini bosadi.')
unit('API shartnomasi va xato javoblari','js','''Shartnoma~Metod, manzil, kirish tanasi, status va javob shaklini oldindan belgilaydi. Frontend va backend shu kelishuvga tayanadi.
Status~201 yangi obyekt yaratilganini, 400 noto‘g‘ri kirishni, 404 topilmagan resursni bildiradi. Xato javobini doim 200 bilan yashirish mijoz tekshiruvini buzadi.
Validatsiya~Server kirishning turi va chegarasini tekshiradi. title trim qilingandan keyin 1 dan 80 belgigacha bo‘lishi kerak; raqam matnga avtomatik aylantirilmaydi.
Xato shakli~Demo API {error:{code,message}} ko‘rinishidan foydalanadi. Mijoz tushunarli xabar oladi, serverning ichki yo‘li yoki stack trace qaytmaydi.
Moslik~Javob maydonini olib tashlash eski mijozni buzishi mumkin. Shartnomani o‘zgartirganda mijoz va testlar birga ko‘rib chiqiladi.''','''function validTitle(x) {
  return typeof x === 'string' && x.trim().length > 0 && x.trim().length <= 80;
}
console.log(validTitle(' Dars '), validTitle('  '), validTitle(42));''','Konsolda true false false chiqadi.','Validatorga 80 va 81 belgili matn, null va undefined berib natijalarni tekshiring.','Brauzer tekshiruvi server validatsiyasini almashtirmaydi.','Bo‘sh title serverga keldi. Qaysi javob mos?~400 va tushunarli xato kodi.~200 va yashirilgan xato.~201 va bo‘sh satr.~404 va yangi obyekt.')
unit('Fetch va interfeys holatlarini bog‘lash','local','''Fetch~HTTP javobini Promise orqali beradi. 404 yoki 500 statusning o‘zi Promise rad etilishiga sabab bo‘lmaydi; response.ok alohida tekshiriladi.
Yuklanish holati~So‘rov ketayotganda foydalanuvchiga jarayon bildiriladi. Tugma vaqtincha o‘chirilishi takror bosishni kamaytiradi, lekin serverdagi takroriy amal masalasini to‘liq hal qilmaydi.
Xato holati~Tarmoq, HTTP status va noto‘g‘ri JSON turli xatolardir. finally bloki tugma va indikatorni muvaffaqiyatda ham xatoda ham tiklaydi.
Xavfsiz chiqarish~Serverdan olingan title matni textContent bilan chiqariladi. Foydalanuvchi matnini innerHTMLga qo‘yish HTML bajarilishiga olib kelishi mumkin.
Qayta yuklash~Yangi yozuvdan so‘ng serverdan ro‘yxat qayta olinadi. Bu demo uchun sodda izchillik beradi; optimistik yangilash qo‘shimcha qaytarish mantiqini talab qiladi.''','''// Lokal loyiha brauzeri konsolida
const r = await fetch('/api/tasks');
if (!r.ok) throw new Error('HTTP ' + r.status);
console.log(await r.json());''','Ishlayotgan lokal ilovada tasks massivi qaytadi; server to‘xtasa xato ko‘rinadi.','Loyihani ishga tushirib vazifa qo‘shing, serverni to‘xtating va interfeys xabarini kuzating.','Fetch muvaffaqiyatli tugadi degani status 2xx bo‘ldi degani emas.','Fetch 404 statusli javob berdi. Keyingi tekshiruv nima?~response.ok yoki statusni tekshirish.~Hech narsa, fetch doim 2xx beradi.~Darhol success ko‘rsatish.~JSONga aylantirish barcha xatoni tuzatadi.')
unit('Same origin CORS va muhit sozlamalari','local','''Origin~Sxema, host va portdan tuziladi. http://localhost:3000 va http://localhost:4000 turli origindir; yo‘lning farqi originni o‘zgartirmaydi.
Same origin~Demo server frontend va APIga bitta portda xizmat qiladi. Frontend /api/tasks nisbiy manzilidan foydalanadi; alohida CORS sozlamasi kerak emas.
CORS~Brauzerga javobni qaysi origin o‘qishi mumkinligini belgilaydi. U autentifikatsiya yoki serverga boshqa mijoz yuborishini to‘sadigan himoya emas.
Muhit o‘zgaruvchisi~PORT va DATA_DIR ishga tushish vaqtida o‘qiladi. Frontendga yuborilgan har qanday qiymat ochiq; parol va tokenni HTML yoki JSga qo‘shilmaydi.
Sirlarni boshqarish~Namunaviy .env.example sir saqlamaydi. Haqiqiy .env va bazalar Gitdan chiqariladi; bu loyiha .env faylini o‘zi yuklamaydi, terminal yoki xizmat sozlamasi orqali qiymat beriladi.''','''# POSIX terminal
PORT=3000 DATA_DIR=./data node server.mjs
# Brauzerda: http://localhost:3000
# Windows PowerShell:
# $env:PORT="3000"; $env:DATA_DIR="./data"; node server.mjs''','Frontend va API bitta originda ochiladi; baza data katalogida saqlanadi.','PORTni 3001 qilib ilovani qayta oching. Network oynasida /api/tasks originini yozing.','CORSga * qo‘yish barcha xavfsizlik va login masalalarini hal qilmaydi.','Frontend JS ichidagi token sirmi?~Yo‘q, brauzerga yuborilgan koddan uni ko‘rish mumkin.~Ha, fayl kichraytirilsa sir.~Ha, const ichida bo‘lsa sir.~Ha, HTML ko‘rinmasa sir.')
unit('Test strategiyasi va unit sinovlar','js','''Test darajasi~Unit bitta funksiya xulqini, integratsion test bir nechta qatlam aloqasini, E2E esa brauzerdagi oqimni tekshiradi. Bir daraja qolgan barcha darajani almashtirmaydi.
Arrange Act Assert~Avval kirish tayyorlanadi, keyin tekshiriladigan amal bajariladi, so‘ng natija kutilgan qiymatga solishtiriladi. Shu tartib xato manbasini aniqlashni osonlashtiradi.
Chegaraviy qiymat~1 va 80 belgi ruxsat etilgan chegaralar; 0 va 81 esa rad etiladi. Faqat o‘rtacha uzunlikni tekshirish chet xatolarni yashiradi.
Salbiy sinov~Noto‘g‘ri tur, bo‘sh matn va yo‘q maydon ham kutilgan tarzda rad etilishi tekshiriladi. Xato yuz berishi testning o‘zi muvaffaqiyatsiz degani emas.
Regressiya~Oldin ishlagan xulq o‘zgarishdan keyin ham ishlashini tekshiradi. Tuzatilgan nuqson uchun qayta takrorlanadigan test qo‘shiladi.''','''function validTitle(x) {
 return typeof x === 'string' && x.trim().length >= 1 && x.trim().length <= 80;
}
assert(validTitle('A'), '1 belgi');
assert(validTitle('A'.repeat(80)), '80 belgi');
assert(!validTitle('A'.repeat(81)), '81 rad');
assert(!validTitle('  '), 'bo‘sh rad');
console.log('4 tekshiruv o‘tdi');''','4 tekshiruv o‘tdi chiqadi; assertion buzilsa Run xato qaytaradi.','Raqam, null va bo‘sh obyekt uchun yana 3 ta salbiy tekshiruv qo‘shing.','Faqat muvaffaqiyatli holatlar test qamrovini to‘liq bermaydi.','80 belgigacha cheklovni qanday sinash foydali?~0, 1, 80 va 81 chegaralarida.~Faqat 20 belgida.~Faqat tasodifiy bitta matnda.~Faqat sahifa rangida.')
unit('HTTP API integratsion sinovlari','local','''Haqiqiy HTTP~Test vaqtinchalik portda server ochib, fetch bilan haqiqiy so‘rov yuboradi. Route funksiyasini bevosita chaqirish HTTP tanasi, header va marshrutlashdagi hamma xatoni ko‘rsatmaydi.
Izolyatsiya~Har test o‘z xotira bazasi yoki alohida vaqtinchalik katalogidan foydalanadi. Ishlab turgan o‘qituvchi bazasi testga berilmaydi.
Tekshirish zanjiri~POSTdan keyin GET so‘rovi bilan yaratilgan satr tekshiriladi. Status, javob shakli va saqlangan qiymat birga solishtiriladi.
Tozalash~Server va baza finally yoki test cleanup orqali yopiladi. Ochiq port va fayl keyingi testni tasodifan buzishi mumkin.
Node test runner~Loyiha Node 24 built in node:test va node:assert/strict modullaridan foydalanadi. npm test bu yerda qo‘shimcha test kutubxonasisiz node --testni ishga tushiradi.''','''# integration-project katalogida
npm test
# Faqat API testlari
node --test test/api.test.mjs''','HTTP testlar vaqtinchalik port va alohida baza bilan o‘tadi; jarayon yakunlanadi.','POST 201, bo‘sh title 400 va yo‘q id 404 testlarini o‘qing, yangi sarlavha tekshiruvini qo‘shing.','Testni doimiy real bazaga qarshi ishlatish natijani va ma’lumotni buzishi mumkin.','POST testi nimani ham tekshirishi kerak?~Keyingi GETda yozuvning haqiqatan saqlanganini.~Faqat console.log borligini.~Faqat statusdan qat’i nazar JSON borligini.~Faqat server fayli nomini.')
unit('Baza fixturelari va ma’lumot izchilligi','local','''Fixture~Sinov uchun ma’lum boshlang‘ich holatdir. Uch vazifa ichida bittasi tugallangan bo‘lsa, filter uchun aniq kutiladigan natija bor.
Xotira bazasi~SQLite :memory: har ulanish uchun alohida baza beradi. Ulangan bazani yopish barcha test yozuvlarini yo‘qotadi; bu ishlab chiqarishdagi saqlash o‘rnini bosmaydi.
Cheklov~CHECK va NOT NULL noto‘g‘ri yozuvni bazada rad etadi. Server validatsiyasi qulay xabar beradi, baza cheklovi esa saqlangan holatni himoyalaydi.
Filtrlash~done=0 yoki done=1 qiymati parametr bilan bog‘lanadi. Kiritmani SQL matniga qo‘shishdan saqlaniladi; noto‘g‘ri query qiymati 400 bilan qaytadi.
Mustaqillik~Testlar tartibiga tayanilmaydi. Bitta testdagi id boshqa testda doimo aynan shu son bo‘ladi deb taxmin qilinmaydi.''','''node --test test/store.test.mjs
# Har test :memory: bazasini yaratib yopadi.''','CRUD, filter, cheklov va alohida bazalar sinovlari o‘tadi.','Bitta bazaga uch vazifa yozing; done filtri va boshqa baza bo‘shligini tekshiring.','Bir test qoldirgan satrlarga boshqa testni bog‘lamang.','Ikki test bitta doimiy bazani bo‘lishsa nima xavf bor?~Tartib va qoldiq ma’lumot natijaga ta’sir qiladi.~Barcha test avtomatik mustaqil bo‘ladi.~CHECK cheklovlar ishlamay qoladi.~HTTP statuslar yo‘qoladi.')
unit('Asinxron xato va tashqi bog‘liqlikni almashtirish','js','''Dependency injection~Funksiya foydalanadigan fetch kabi bog‘liqlik parametr orqali beriladi. Test tashqi tarmoqqa chiqmasdan boshqariladigan javob yaratadi.
Stub~Oldindan belgilangan natija qaytaruvchi o‘rinbosar. U haqiqiy server mavjudligini isbotlamaydi; faqat mijozning shu holatdagi xulqini tekshiradi.
Promise xatosi~await kutiladigan asinxron natija rad etilsa catch bilan qayd etiladi. Test Promise tugashini kutmasa, yolg‘on muvaffaqiyat ko‘rsatishi mumkin.
Timeout~Cheksiz kutish o‘rniga vaqt chegarasi qo‘yiladi. Haqiqiy fetch uchun AbortController bilan so‘rovni bekor qilish mumkin; timeoutni faqat xabar sifatida ko‘rsatish so‘rovni bekor qilmaydi.
Deterministik test~Natija internet tezligi, sana yoki tasodifga bog‘liq bo‘lmaydi. Vaqt va javob oldindan belgilansa xatoni takrorlash osonlashadi.''','''async function loadTasks(fetcher) {
 const r = await fetcher('/api/tasks');
 if (!r.ok) throw new Error('HTTP ' + r.status);
 return (await r.json()).tasks;
}
const tasks = await loadTasks(async () => ({ok:true,json:async()=>({tasks:[]})}));
assert(tasks.length === 0, 'bo‘sh ro‘yxat');
try { await loadTasks(async()=>({ok:false,status:503})); }
catch(e) { console.log(e.message); }''','HTTP 503 chiqadi va bo‘sh ro‘yxat tekshiruvi o‘tadi.','503 holati catchga tushganini boolean belgi va assert bilan isbotlang.','Stub bilan o‘tgan testni haqiqiy tarmoq integratsiyasi ishladi deb atamang.','Stub bilan nima isbotlanadi?~Mijozning berilgan javobga munosabati.~Haqiqiy hosting doim ishlashi.~DNS barcha joyda to‘g‘riligi.~Tashqi serverning barcha xulqi.')
unit('Brauzer oqimi va E2E sinov','local','''E2E~Foydalanuvchiga o‘xshab forma to‘ldirish, tugma bosish va natijani ko‘rish orqali butun oqimni tekshiradi. API testi brauzer DOMi bilan bog‘lanishdagi xatoni topmasligi mumkin.
Playwright~Brauzerlarni boshqaruvchi test vositasidir. Alohida o‘rnatiladi; ushbu loyihaning npm test buyrug‘i uni avtomatik bajarmaydi.
Barqaror lokator~getByRole va getByLabel foydalanuvchi ko‘radigan ma’no bilan elementni topadi. Tasodifiy CSS tartibi o‘zgarsa ham tushunarli yorliq saqlanadi.
Kutish~Natijaga assertion bilan kutish qat’iy sekundli sleepdan ishonchliroq. Ko‘rinadigan natija paydo bo‘lmaguncha tekshiruv belgilangan vaqt ichida qayta urinadi.
Dalil~Test xatosidagi trace va screenshot nuqsonni tushuntirishga yordam beradi. Screenshot mavjudligi test o‘tganining o‘zi emas.''','''// Playwright o‘rnatilgach, ishlayotgan lokal demo bilan
// Alohida test bazasidan foydalaning.
await page.goto('http://127.0.0.1:3000');
await page.getByLabel('Vazifa nomi').fill('E2E dars');
await page.getByRole('button', {name:'Qo‘shish', exact:true}).click();
await expect(page.getByText('E2E dars — ochiq', {exact:true})).toBeVisible();''','Lokal demo brauzerida yangi vazifa ko‘rinadi. Bu parcha Playwright test kontekstida ishlaydi.','Loyihadagi docs/e2e.spec.mjs va yo‘riqnomaga amal qilib yaratish oqimini bajaring.','Playwright parchasini oddiy brauzer konsoliga yoki Node testga importsiz ko‘chirmang.','E2E test nimani qamraydi?~Brauzerdagi foydalanuvchi oqimini.~Faqat SQL jadval nomini.~Faqat sof funksiya qiymatini.~Faqat README matnini.')
unit('Qulaylik klaviatura va moslashuvchan interfeys','report','''Label~Kirish maydoniga ko‘rinadigan nom beradi. Placeholder label o‘rnini to‘liq bosmaydi, chunki matn yozilganda yo‘qoladi.
Klaviatura~Tab bilan forma va tugmalarga borish, Enter bilan yuborish mumkin bo‘lishi kerak. Fokus ko‘rinib turishi va tartib ma’noli bo‘lishi tekshiriladi.
Jonli xabar~role=status odatiy natijani yordamchi texnologiyaga bildirishi mumkin. Xabar qisqa, aniq va rangga yolg‘iz bog‘lanmagan bo‘ladi.
Moslashuv~Kichik ekranda matn va boshqaruv kesilib qolmasligi kerak. 320 CSS piksel kenglik va kattalashtirishda gorizontal siljish kuzatiladi.
Qo‘lda audit~Avtomatik vosita barcha qulaylik muammosini topmaydi. Klaviatura, matn ma’nosi, fokus va o‘qish tartibi qo‘lda ham tekshiriladi.''','''Tekshiruv dalili:
1. Tab → Vazifa nomi → Qo‘shish
2. Bo‘sh yuborish → tushunarli xabar
3. 320 px va 200% zoom → boshqaruvlar ko‘rinadi
4. Vazifa tugallandi → matnda holat bor''','Har band uchun o‘tdi yoki nuqson, brauzer va kuzatuv yoziladi.','Demo ilovani klaviaturada boshqaring va kamida bitta tuzatish yoki barcha bandlar bo‘yicha dalil yozing.','Yashil rangning o‘zi tugallangan holatni barcha foydalanuvchiga yetkazmaydi.','Placeholder label o‘rnini to‘liq bosadimi?~Yo‘q, kiritishda yo‘qoladi va doimiy nom emas.~Ha, har qanday holatda.~Ha, matn kulrang bo‘lsa.~Ha, faqat sichqoncha ishlatsa.')
unit('XSS kirish nazorati va xavfsizlik regressiyasi','local','''XSS~Ishonchsiz matn HTML sifatida chiqarilganda skript yoki markup talqini xavfi paydo bo‘ladi. Demo title uchun textContent ishlatadi; HTML kiritilsa oddiy matn sifatida ko‘rinadi.
Parametrli SQL~Qiymatlar placeholder orqali yuboriladi. Bu qiymatni SQL buyruq tuzilmasidan ajratadi; jadval nomini foydalanuvchidan olib parametr o‘rniga qo‘yib bo‘lmaydi.
Chegara nazorati~So‘rov tanasi 16 KiBdan oshsa demo server 413 beradi. Chegara keraksiz katta kirishning resurs sarfini kamaytiradi, lekin umumiy DDoS himoyasini anglatmaydi.
Xavfsizlik headeri~Content Security Policy demo frontendda faqat o‘zining skript va uslublarini ruxsatlaydi. Header qo‘shish xato DOM ishlatishni xavfsiz qilmaydi; ikkalasi birga ko‘riladi.
Kirish huquqi~Demo login ishlatmaydi va faqat ishonchli o‘quv muhitiga mo‘ljallangan. Shaxsiy ma’lumotli ko‘p foydalanuvchili xizmatga aylantirish uchun autentifikatsiya, avtorizatsiya va tegishli so‘rov himoyalari alohida loyihalanadi.''','''# Lokal regressiya sinovlari
node --test test/api.test.mjs
# Brauzerda title sifatida yozing:
# <img src=x onerror=alert(1)>
# Bu MATN ko‘rinishi, HTML element bo‘lmasligi kerak.''','Kiritma matn sifatida ko‘rinadi, katta tana 413, noto‘g‘ri maydon 400 bilan qaytadi.','HTMLga o‘xshash title bilan lokal demo oqimini tekshiring, DOMda img paydo bo‘lmaganini qayd eting.','CSP borligi innerHTMLga foydalanuvchi matnini qo‘yishni oqlamaydi.','SQL qiymatini qanday yuborish kerak?~Placeholder va bog‘langan parametr orqali.~Matnni SQLga qo‘shib.~Faqat trim qilib satrga yopishtirib.~Frontenddan keldi deb tekshirmasdan.')
unit('Unumdorlik o‘lchovi va nuqson hisoboti','js','''Bazaviy o‘lchov~Optimallashtirishdan oldin bir xil muhitda boshlang‘ich vaqt va so‘rov soni olinadi. Bitta tez o‘lchov doimiy natijani isbotlamaydi.
Namuna hajmi~Bir necha o‘lchovdagi median yoki percentil tarqalishni ko‘rsatadi. P95 uchun kichik namunadan katta xulosa qilinmaydi; kursda oddiy median bilan boshlanadi.
Cheklangan ro‘yxat~Demo ko‘pi bilan 100 vazifani qaytaradi va truncated bayrog‘ini beradi. Bu to‘liq sahifalash emas; katta xizmat uchun cursor yoki offset shartnomasi kerak.
Nuqson hisoboti~Muhit, takrorlash qadami, kutilgan va amaldagi natija yoziladi. Shunchaki ishlamayapti degan xabar tuzatish uchun yetarli emas.
Ustuvorlik~Ma’lumot yo‘qolishi va asosiy oqim buzilishi bezak kamchiligidan muhimroq bo‘lishi mumkin. Severity ta’sirni, priority ish navbatini ifodalaydi.''','''const times = [120, 80, 100, 90, 110];
const sorted = [...times].sort((a,b)=>a-b);
const median = sorted[Math.floor(sorted.length / 2)];
assert(median === 100, 'median');
console.log('Median:', median, 'ms');''','Median: 100 ms chiqadi; misol faqat 5 ta oldindan berilgan o‘lchovni tahlil qiladi.','Lokal Network oynasida 5 o‘lchov oling, medianini hisoblang va sharoitini yozing.','Brauzerdagi sun’iy raqamlarni real server yuk sinovi natijasi deb ko‘rsatmang.','Yaxshi nuqson hisobotida nima bo‘ladi?~Muhit, qadamlar, kutilgan va amaldagi natija.~Faqat ishlamayapti so‘zi.~Faqat tugma rangi.~Faqat muallifning taxmini.')
unit('Git reliz va takrorlanuvchi yig‘ish','local','''Commit~Manba holatini belgilaydigan identifikatordir. Relizdagi kod qaysi commitdan olingani qayd etilsa nuqsonni aniqlash va qaytish osonlashadi.
Tag~Relizga tushunarli nom beradi. Tagni boshqa commitga ko‘chirib yuborish mavjud relizning ma’nosini o‘zgartiradi; tuzatish yangi reliz bilan beriladi.
Lockfile~Tashqi paketlar bo‘lsa aniq yechilgan bog‘liqliklarni qayd etadi va npm ci bilan tekshiriladi. Bizning Node demo ilovamiz runtime paket ishlatmaydi, shuning uchun npm testdan oldin npm ci shart emas.
Artefakt~Muayyan manbadan tayyorlangan tarqatma fayldir. Testdan o‘tgan artefakt bilan joriy etilgan artefakt mos bo‘lishi kerak.
Reliz qaydi~O‘zgarish, moslik, migratsiya va qaytish shartlarini yozadi. Faqat yangi versiya raqami foydalanuvchi va navbatchi uchun yetarli bo‘lmaydi.''','''git status --short
git rev-parse HEAD
npm test
# Testlar o‘tgach, o‘z o‘quv repongizda:
# git tag -a v0.1.0 -m "O‘quv relizi"
# git archive --format=zip --output=release.zip HEAD''','Toza manba holati, to‘liq SHA va test natijasi reliz qaydiga kiritiladi.','Lokal o‘quv repoda reliz qaydi tuzing; hech qanday umumiy repoga majburiy push talab etilmaydi.','Ishchi katalogdagi saqlanmagan o‘zgarish git archive HEAD ichiga kirmaydi.','Sinov va deploy artefakti nega mos bo‘lishi kerak?~Aynan sinovdan o‘tgan kod chiqarilishini bilish uchun.~ZIP rangini bir xil qilish uchun.~README qisqarishi uchun.~HTTPni SQLga almashtirish uchun.')
unit('CI jarayoni va avtomatik sifat darvozasi','local','''CI~Commit yoki pull requestdagi kodni avtomatik tekshiradi. Yashil holat faqat konfiguratsiyada yozilgan tekshiruvlar o‘tganini bildiradi.
Workflow~GitHub Actions YAML fayli voqea, runner va qadamlarni belgilaydi. Loyihadagi workflow test qiladi, hostingga avtomatik deploy yoki maxfiy token yubormaydi.
Versiya~Runnerdagi Node major versiyasi lokal kurs muhiti bilan mos tanlanadi. node:sqlite uchun Node 24 belgilanadi; boshqa versiyada sinov xulqi farq qilishi mumkin.
Chiqish kodi~Buyruq 0 qaytarsa qadam muvaffaqiyatli, boshqa qiymat qaytarsa xato hisoblanadi. Xatoni || true bilan yashirish sifat darvozasini bekor qiladi.
Minimal huquq~Workflow permissions contents:read bilan tekshiradi. Deploy kerak bo‘lsa uning vakolati va muhit ruxsati alohida, faqat zarur vazifa uchun beriladi.''','''# Avval lokal tekshiruv
npm run check
npm test
# Paketdagi .github/workflows/ci.yml shu buyruqlarni Node 24da bajaradi.''','Lokal check va test muvaffaqiyatli tugaydi. GitHub workflow faqat o‘z repongizga joylanganda ishlaydi.','Bir assertionni vaqtincha buzib testning nol bo‘lmagan kod bilan tugashini kuzating, keyin tuzating.','Lokal YAML borligi masofaviy CI allaqachon ishlaganini isbotlamaydi.','CI muvaffaqiyatli bo‘lsa nimani bilamiz?~Yozilgan qadamlar shu muhitda o‘tganini.~Barcha mumkin bo‘lgan xato yo‘qligini.~Hostingga deploy bo‘lganini.~Har brauzerda mukammal ishlashini.')
unit('Konfiguratsiya konteyner va doimiy saqlash','local','''Konfiguratsiya~Muhitga bog‘liq port va data katalogi koddan ajratiladi. Tekshirishdagi vaqtinchalik baza bilan xizmatdagi doimiy baza bir yo‘lga qo‘yilmaydi.
Konteyner~Jarayon va uning fayllarini alohida muhitga joylaydi. Image ichida foydalanuvchi bazasini saqlash yangilashda ma’lumot yo‘qolishiga olib kelishi mumkin.
Volume~Konteynerdan tashqarida boshqariladigan doimiy saqlashdir. SQLite fayli uchun /app/data yoziladigan katalog bo‘lishi kerak; deploy platformasi bu imkoniyatni berishi tekshiriladi.
Non root~Jarayon oddiy node foydalanuvchisi bilan yuradi. Katalog egasi va yozish ruxsati mos kelmasa xizmat readiness tekshiruvida ishga yaramaydi.
Muhit mosligi~Bu Node server statik HTML hostga shunchaki yuklash bilan ishlamaydi. Hosting Node jarayoni va doimiy diskni qo‘llashi yoki bazaga mos boshqa arxitektura talab etiladi.''','''# Docker mavjud lokal kompyuterda
# integration-project katalogidan
docker build -t web-integration-demo .
docker volume create web-integration-data
docker run --rm -p 3000:3000 -v web-integration-data:/app/data web-integration-demo''','Docker mavjud bo‘lsa demo 3000 portda ochiladi, volume qayta ishga tushishda ma’lumotni saqlaydi.','Docker yoki lokal Node yo‘lidan birini tanlang; vazifa qo‘shib jarayonni qayta ishga tushiring va saqlanishini tekshiring.','Statik hostingning mavjudligi Node server va SQLite doimiy diskini qo‘llaydi degani emas.','SQLite faylini konteyner ichida volumesiz saqlash xavfi nima?~Konteyner almashtirilganda yozuvlar yo‘qolishi mumkin.~Har SELECT darhol tezlashadi.~JSON avtomatik shifrlanadi.~CORS avtomatik o‘chadi.')
unit('Joriy etish rejasi HTTPS va smoke sinov','local','''Staging~Relizni asosiy xizmatdan oldin sinash muhiti. Unda demo ma’lumot ishlatiladi va versiya hamda sozlamalar alohida qayd etiladi.
Reverse proxy~Ommaviy HTTPS ulanishni qabul qilib ichki Node serverga yo‘naltirishi mumkin. Sertifikat va domainni hosting yoki administrator boshqaradi; lokal HTTPni HTTPS deb ko‘rsatib bo‘lmaydi.
Readiness~Xizmat so‘rovga tayyorligini tekshiradi. Demo /health/ready bazaga SELECT 1 yuboradi; liveness esa jarayon javob berishini bildiradi.
Smoke sinov~Deploydan keyin eng zarur oqimni qisqa tekshiradi. Paketdagi smoke skript sog‘liq, statik sahifa va API ro‘yxatini faqat o‘qiydi; CRUD qabul sinovi alohida demo yozuv bilan bajariladi.
Joriy etish qarori~Domain, runtime, disk, HTTPS, backup va qaytish rejasi tayyor bo‘lgach chiqariladi. Kurs topshirig‘i haqiqiy to‘lov yoki majburiy hosting hisobini talab qilmaydi.''','''# Lokal xizmat ishga tushganidan keyin
node smoke.mjs http://127.0.0.1:3000
# Haqiqiy staging bo‘lsa uning HTTPS URLi beriladi.''','Smoke uch endpointni o‘qib PASS chiqaradi; haqiqiy HTTPS faqat sozlangan hostingda tekshiriladi.','Lokal smoke natijasini saqlang va staging uchun runtime, disk hamda HTTPS talablarini yozing.','Faqat bosh sahifaning 200 qaytarishi bazaga yozish oqimi ham ishlashini anglatmaydi.','Readiness nima uchun kerak?~Xizmat so‘rovni bajarishga tayyorligini tekshirish uchun.~Faqat logotip yuklash uchun.~Foydalanuvchi parolini ko‘rsatish uchun.~Test natijasini yashirish uchun.')
unit('Loglar monitoring va xizmat holati','local','''Strukturali log~Har qatorda JSON bo‘lsa status, yo‘l va vaqtni ajratish oson. Demo requestId, method, pathname, status va msni yozadi; so‘rov tanasi qayd etilmaydi.
Korrelyatsiya~X-Request-Id javob headeri foydalanuvchi xatosini server yozuvi bilan bog‘laydi. Bu id foydalanuvchi autentifikatsiyasi vazifasini bajarmaydi.
Ko‘rsatkich~Xato ulushi va kechikish vaqt bo‘yicha kuzatiladi. Log borligi avtomatik alert xizmati sozlanganini anglatmaydi.
Sog‘liq tekshiruvi~Liveness va readiness turli savollarga javob beradi. Bazani o‘qish muvaffaqiyatsiz bo‘lsa readiness 503 qaytarishi mumkin; barcha xatoda ko‘r-ko‘rona restart qilinmaydi.
Maxfiylik~Token, parol va to‘liq shaxsiy tana logga yozilmaydi. Demo pathname yozadi, query yoki title matnini logga qo‘shmaydi; real tizimda saqlash muddati va kirish ham belgilanadi.''','''# Bir terminalda npm start, boshqasida:
node smoke.mjs http://127.0.0.1:3000
# Server terminalida requestId/status/ms JSON satrlarini kuzating.''','Har so‘rov uchun qisqa JSON log va javobda X-Request-Id mavjud bo‘ladi.','Bitta so‘rov idsi bilan logni toping. So‘rov tanasi va query logda yo‘qligini tekshiring.','Logni ko‘p yozish monitoring va ogohlantirish siyosatining o‘rnini bosmaydi.','Request id nima beradi?~Javob va server yozuvini bog‘lash imkonini.~Avtomatik login.~Baza parolini tiklash.~HTTPS sertifikati.')
unit('Backup tiklash va sxema o‘zgarishi','local','''Zaxira~Ma’lumotni qayta tiklash uchun alohida nusxa saqlanadi. Nusxa borligi o‘zidan o‘zi tiklash ishlashini isbotlamaydi.
Izchil nusxa~Ishlayotgan SQLite faylini oddiy ko‘chirish qo‘shimcha journal yoki WAL holatini hisobga olmasligi mumkin. Kurs skripti faqat xizmat to‘xtatilganidan keyingi yopiq baza nusxasi uchun mo‘ljallangan.
Tiklash sinovi~Nusxa yangi katalogga ko‘chiriladi, xizmat shu katalog bilan ochiladi, integrity_check va yozuvlar tekshiriladi. Asosiy bazani ustidan yozish shart emas.
Migratsiya~Sxema o‘zgarishi versiya va qaytish sharti bilan boshqariladi. Ustun qo‘shish kabi kengaytirish eski kodga ko‘proq mos keladi, lekin barcha o‘zgarish avtomatik teskari qaytmaydi.
RPO va RTO~RPO yo‘qotilishi mumkin bo‘lgan ma’lumot davrini, RTO xizmatni qaytarish vaqtini bildiradi. O‘quv mashqida maqsad va haqiqiy o‘lchov alohida yoziladi.''','''# Avval xizmatni Ctrl+C bilan to‘xtating.
node backup.mjs ./data ./backups/demo.sqlite
# Alohida tiklash katalogiga nusxa:
node restore.mjs ./backups/demo.sqlite ./restore-demo
# POSIX terminalda:
PORT=3001 DATA_DIR=./restore-demo node server.mjs''','Yopiq bazadan nusxa olinadi, yangi katalogda eski vazifalar ko‘rinadi.','Demo vazifa yarating, serverni to‘xtating, nusxadan alohida katalogga tiklab satr va vaqt dalilini yozing.','Ishlayotgan SQLite faylini ko‘r-ko‘rona copy qilishni ishonchli backup deb atamang.','Backup tekshiruvi qachon to‘liqroq bo‘ladi?~Alohida joyda tiklash va yozuvlarni tekshirganda.~Faqat fayl nomini ko‘rganda.~Faqat ZIP hajmi katta bo‘lganda.~Asosiy bazani o‘chirib tashlaganda.')
unit('Nosozlikka javob va xavfsiz rollback','report','''Incident~Xizmatning kutilgan xulqi buzilgan hodisa. Avval foydalanuvchi ta’siri va vaqt qayd etiladi, keyin dalil yig‘iladi.
Rollback~Oldingi ishlaydigan ilova reliziga qaytishdir. Kodni qaytarish bazani ham avtomatik oldingi holatga keltirmaydi.
Moslik nazorati~Oldingi kod yangi sxemani o‘qiy olishi tekshiriladi. Mos bo‘lmasa oldindan sinovdan o‘tgan restore yoki forward fix yo‘li kerak bo‘lishi mumkin.
Runbook~Holatni tekshirish, qaror, amal va tekshiruv qadamlari yozilgan yo‘riqnoma. Qaysi shartda to‘xtash va kimga xabar berish ham aniq bo‘ladi.
Postmortem~Ta’sir, sabab, aniqlash va qayta takrorlanishni kamaytiradigan ishlar yoziladi. Shaxsni ayblash o‘rniga dalil va jarayon ko‘rib chiqiladi.''','''Incident mashqi:
Alomat: relizdan keyin POST 500.
Dalil: vaqt, requestId, versiya, status.
Qaror: oldingi reliz yangi sxema bilan mosmi?
Amal: mos bo‘lsa kod rollback; so‘ng smoke + demo CRUD.
Ma’lumot holatini alohida tekshiring.''','Runbook kod qaytishi va ma’lumotni tiklashni alohida ko‘rsatadi.','500 xato ssenariysi uchun qaror daraxti va qaytishdan keyingi 4 tekshiruv yozing.','Kod rollbackini ma’lumot ham avtomatik qaytdi deb talqin qilmang.','Eski kod yangi sxemani o‘qimasa nima qilish kerak?~Oldindan sinovdan o‘tgan mos restore yoki tuzatish rejasini tanlash.~Ko‘r-ko‘rona eski faylni qo‘yish.~Barcha loglarni o‘chirish.~Sxemani tekshirmasdan tayyor deyish.')
unit('Qabul sinovi hujjatlar va loyiha himoyasi','report','''Qabul sinovi~Boshlang‘ich talablarning har biri natija bilan solishtiriladi. Har mezon uchun o‘tdi yoki nuqson va dalil manzili ko‘rsatiladi.
Dalil jadvali~Talab, sinov qadami, kutilgan natija va kuzatuvni bog‘laydi. Testlar soni talablarning hammasi qamralganini o‘zidan o‘zi bildirmaydi.
Yo‘riqnoma~Node versiyasi, ishga tushirish, test, data yo‘li va backup tartibini beradi. Boshqa o‘quvchi muallif yordamisiz loyihani takrorlay olishi tekshiriladi.
Cheklov bayoni~Demo login yo‘qligi, limit va tekshirilmagan muhitlar ochiq yoziladi. Lokal ishlaganini ommaviy productionda tekshirildi deb atalmaydi.
Himoya~O‘quvchi oqim, kod, xato sinovi va tiklashni tushuntiradi. Faqat slayd ko‘rsatish ishlaydigan ilova va dalilning o‘rnini bosa olmaydi.''','''Talab | Test | Dalil | Holat
Yaratish | POST + GET | test log | o‘tdi/nuqson
Bo‘sh title | 400 | test log | o‘tdi/nuqson
Qayta ochish | disk baza | kuzatuv | o‘tdi/nuqson
Tiklash | alohida katalog | satrlar va vaqt | o‘tdi/nuqson''','Talablar dalillar bilan bog‘lanadi, cheklovlar va qolgan ishlar aniq yoziladi.','Yakuniy loyiha uchun qabul jadvali, README va 5 daqiqalik namoyish rejasini tuzing.','Bajarilmagan tekshiruvni o‘tdi deb yozmang; tekshirilmadi holatini alohida belgilang.','Himoyadagi muhim dalil qaysi?~Talabga bog‘langan ishlaydigan oqim va takrorlanadigan test.~Faqat chiroyli muqova.~Faqat kod satrlari soni.~Faqat katta ZIP fayli.')
assert len(UNITS)==20 and all(len(x['concepts'])==5 for x in UNITS)
