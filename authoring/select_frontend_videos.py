"""Curated videos in the current (r28+) lesson numbering. No document rebuild."""
import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / 'dist/frontend-resources.js'
data = json.loads(path.read_text().split('const frontendResources=', 1)[1].split(';\nObject.assign', 1)[0])
selection = {}

def add(numbers, ident, title, coverage, task, channel='Ulugbek Samigjonov', evidence=None):
    for n in numbers:
        selection.setdefault(str(n), []).append(dict(id=ident, title=title, channel=channel,
            language='O‘zbekcha', coverage=coverage, task=task,
            source='https://www.youtube.com/watch?v='+ident,
            verifiedFrom=evidence or 'https://www.youtube.com/watch?v='+ident,
            checkedOn='2026-10-27', verification='Muallif sahifasidagi sarlavha va tavsif asosida tanlangan.'))

add([6], 'dgcyvjQiJnQ', 'HTMLda dasturlash | 6. Headings (Sarlavhalar)',
    'Ushbu dars mavzuning sarlavhalar qismini tushuntiradi. Xatboshi, formatlash va maxsus belgilarni konspektdan davom ettiring.',
    'h1, h2 va h3 sarlavhalari bilan matnning mazmuniy tuzilishini yarating.')
add([7,94], 'L9GXV5ze6rk', 'HTMLda dasturlash | 13. Links (Havolalar)',
    'HTML havolalari va sahifalar orasida o‘tish haqida. Rasmlar va fayl yo‘llari bo‘yicha qolgan izohlar konspektda.',
    'a tegi bilan bitta tashqi havola va bitta sahifa ichidagi havola yarating; manzillarni tekshiring.')
add([9,93], 'px8yVVPtEnI', 'HTMLda dasturlash | 24. Layout va Semantics',
    'HTML sahifasining mazmuniy bo‘limlari va semantik tuzilishi haqida. Hozircha sahifa ko‘rinishini CSS bilan bezash talab etilmaydi.',
    'header, nav, main va footer qismlaridan iborat HTML tuzilma yarating va har birining vazifasini tushuntiring.')
add([10,102], 'VRnb0W8F27Q', 'HTMLda dasturlash | 21. Forms, 1-qism',
    'HTML forma yaratish asoslari. Boshqa boshqaruv elementlari va validatsiya mavzuning konspektida kengaytirilgan.',
    'Ism va elektron pochta maydonlari, label hamda yuborish tugmasidan iborat forma yarating. JavaScript bu videoning vazifasi emas.')
add([13], 'KPPhQ0F-SDY', 'CSS | 1. Kirish',
    'CSS kursiga kirish va o‘rganish yo‘nalishi. HTML bilan bog‘lash usullarini konspektdagi misollar orqali ko‘ring.',
    'HTML va CSS vazifalarini taqqoslang; CSS sahifaning qaysi ko‘rinishlarini boshqarishini uchta misolda yozing.')
add([15,16], '0UsPKt4gU9I', 'CSS | 4. Selectors (Tanlab oluvchilar)',
    'CSS selektorlari va qoidaning tuzilishi tushuntiriladi.',
    'Bir xil matnni teg, class va id selektori bilan alohida tanlab, rangini o‘zgartirib ko‘ring.')
add([17], '9xtKs3eqSuM', 'CSS | 26. Background',
    'Mavzuning fon xossalari qismiga mos dars. Rang tizimlari konspektda tushuntirilgan; videodagi qo‘shimcha effektlar majburiy emas.',
    'Sahifa foni va bitta matn blokining fon rangini o‘zgartiring.')
add([18,95], '_Rhv5VdZTSo', 'CSS | 44. Fonts',
    'Shriftlar, ularning turlari va sahifada qo‘llanishi haqida. Qolgan matn xossalarini konspektdan o‘rganing.',
    'font-family va font-size orqali sarlavha bilan asosiy matnni farqlang; matn o‘qilishini baholang.')
add([20,21], 'WKUqpFVQnj8', 'CSS | 12. Box model. Margin, Padding, Border',
    'Blok modeli, tashqi va ichki bo‘shliq hamda chegara tushuntiriladi. Border-radius va outline konspektda alohida yoritilgan.',
    'Bitta blokda border, padding va marginni navbat bilan o‘zgartiring va uchalasining farqini yozing.')
add([24,25], '2vnZeG8Cwcg', 'CSS | 21. Joylashish va static qiymati',
    'Joylashishning boshlang‘ich tushunchasi va static oqimi haqida. Boshqa position qiymatlari hamda z-index uchun konspektni davom ettiring.',
    'Uchta blokni odatiy oqimda joylashtiring va static holatda ularning ketma-ketligini tushuntiring.')
add([26], 'j06i3epVpsI', 'CSS | 55. Flexbox: asoslari va terminlari',
    'Flex konteyner, elementlar va asosiy terminlarga kirish.',
    'Uchta kartochkani display:flex orqali joylashtiring; konteyner va elementlarni ajrating.')
add([27,35], 'tc_W8ZGiVv4', 'CSS | 61. CSS Grid',
    'CSS Grid haqida boshlang‘ich tushuncha. Moslashuvchan Grid uchun ushbu mavzudagi media query misollarini konspektdan davom ettiring.',
    'Uch ustunli Grid yarating. Moslashuvchan mavzuda bo‘lsangiz, konspekt asosida kichik ekranda uni bitta ustunga o‘tkazing.')
add([30,34,96], '8ObQlXKIUCc', 'CSS | 60. Flexbox yordamida loyihani yaxshilash',
    'Flexboxni loyiha tuzilishida qo‘llashga oid amaliy dars. Bu butun yakuniy loyiha yoki barcha responsive usullar darsi emas.',
    'O‘z sahifangizdagi bitta qator yoki kartochkalar guruhini Flexbox bilan tartiblang. Faqat hozirgacha o‘tilgan xossalardan foydalaning.')
add([31,33,98], 'OaJqZX3YGv4', 'CSS | 40. Media queries',
    'Turli ekranlar uchun CSS media so‘rovlarini qo‘llash haqida. Responsive kirish mavzusida kodni kuzating; amaliy talablar konspektdagi bosqichga mos.',
    'Kichik va katta ekranda nimalar o‘zgarishi kerakligini yozing. Media query o‘tilgan bo‘lsa, konspektdagi misolni sinab ko‘ring.')
add([32], 'gJdlxBua_F8', 'CSS | 34. Foiz (%) o‘lchov birligi',
    'Mavzuning foizli o‘lchovlar qismiga oid dars. Viewport, rem va em birliklari konspektda berilgan.',
    'Ichki blok kengligini 50% qilib belgilang va ota blok kengligi o‘zgarganda natijani kuzating.')
add([37], '3rHnxyysBMo', 'Bootstrap | 3. Bootstrapni o‘rnatib olish',
    'Loyihaga Bootstrapni ulash ko‘rsatiladi. Videodagi versiya yoki CDN manzili farq qilsa, konspektdagi versiya va ulash kodidan foydalaning.',
    'Konspektdagi Bootstrap CSS havolasini ulang va oddiy konteyner ko‘rinishini tekshiring.')
add([38,40,99], 'lSCLF_CWn7A', 'Bootstrap | 5. Grid (1-qism)',
    'Bootstrap Grid tuzilishiga oid dars. To‘liq komponentlar yoki yakuniy loyiha emas; versiya farqlarida konspektga amal qiling.',
    'container, row va col bilan uchta ustun yarating; ekran torayganda ularning holatini tekshiring.')
add([41], 'zzqv7AJFoBo', 'Javascript | 2. Javascript nima?',
    'JavaScript nima ekanligi va undan foydalanish haqida kirish darsi.',
    'HTML, CSS va JavaScript vazifalarini bittadan misol bilan tushuntiring.',
    evidence='https://t.me/s/ulugbeksamigjonov/13')
add([42], 'vrxG9a4Lh58', 'Javascript | 4. Javascript va HTML',
    'JavaScript kodini HTML hujjatiga ulash va ishga tushirish usullari haqida.',
    'HTMLga script faylini ulang va console.log orqali xabar chiqaring; DOM bilan ishlash hali talab etilmaydi.',
    evidence='https://t.me/s/ulugbeksamigjonov?before=29')
add([43], 'ZJabcpg3iBs', 'Javascript | 8. let, const va var',
    'O‘zgaruvchi e’lon qilish va let, const, var orasidagi farqlar haqida.',
    'O‘zgarmas qiymatni const, o‘zgaradigan qiymatni let bilan e’lon qilib konsolga chiqaring.',
    evidence='https://t.me/s/ulugbeksamigjonov?q=%23javascript')
add([44], 'JPS-Vr4pSTE', 'Javascript | 9. Javascriptdagi ma’lumot turlari',
    'JavaScriptdagi ma’lumot turlari tushuntiriladi.',
    'Matn, son va mantiqiy qiymat yarating, typeof natijalarini konspekt bilan solishtiring.',
    evidence='https://t.me/s/ulugbeksamigjonov?q=%23javascript')
add([69,70], '3rXEiCPHuDc', 'DOM 1 — Document Object Model',
    'Document obyekti va elementlarni tanlash usullari: getElementById, querySelector hamda boshqa selektorlar. Kirish mavzusida tushunchalarni kuzatish kifoya.',
    'DOM kirishida hujjat daraxtini chizing; selektorlar mavzusida esa id va class orqali bittadan element tanlang.',
    channel='Frontend Kundaligi')
add([79], 'JtVnOZ26XHA', 'Git va GitHub o‘zi nima?',
    'Git va GitHub vazifalari haqida nazariy tanishuv. Buyruqlarni bajarish keyingi amaliy mavzularda o‘rganiladi.',
    'Git va GitHub farqini, versiyalar tarixini saqlashning ikki foydasini yozing.',
    channel='Saidbek Arislonov', evidence='https://t.me/s/saidbekarislonov?before=50')

# Reuse an already selected lesson for consolidation, with an honest scope.
for n, source, coverage, task in [
    (47, 45, 'Operatorlar haqidagi avvalgi darsni takrorlash uchun. Bu aynan ushbu amaliy ishning tayyor yechimi emas.', 'Ikki son ustida arifmetik amallarni bajarib, natijalarni console.log orqali chiqaring.'),
    (51, 48, 'if/else bo‘yicha mustahkamlash videosi. Bu aynan amaliy topshiriqning tayyor yechimi emas.', 'Ballga qarab o‘tdi yoki qayta o‘qish kerak xabarini chiqaradigan shart yozing.'),
    (55, 52, 'For sikli bo‘yicha takrorlash. While va do/while farqlarini konspektdan davom ettiring.', '1 dan 10 gacha sonlar yig‘indisini for orqali hisoblang.'),
    (59, 56, 'Massivlar bo‘yicha takrorlash. Barcha massiv metodlari bu videoda qamrab olingan deb hisoblanmaydi.', 'Massivdagi sonlar yig‘indisini hisoblang; konspektdagi metodlardan birini qo‘llang.'),
    (63, 60, 'Funksiya asoslarini mustahkamlash. Arrow va default parametrlar konspektda alohida berilgan.', 'Ikki parametr oladigan va natija qaytaradigan funksiya tuzing, uch xil qiymatda sinang.'),
    (68, 60, 'Konsol mini loyihasida funksiyalardan foydalanish uchun takrorlash. Bu ball hisoboti loyihasining tayyor video yechimi emas.', 'Hisoblashni alohida funksiyaga ajrating va natijani console.log bilan tekshiring.'),
]:
    v = copy.deepcopy(data[str(source)]['videos'][0])
    v.update(coverage=coverage, task=task)
    selection[str(n)] = [v]

# Function basics alone do not explain a project defence or independent project.
selection['109'] = []
selection['110'] = []
(ROOT/'authoring/frontend-video-selection.json').write_text(json.dumps(selection, ensure_ascii=False, indent=2)+'\n')
for n, videos in selection.items():
    data[n]['videos'] = videos
path.write_text('const frontendResources='+json.dumps(data, ensure_ascii=False)+';\nObject.assign(frontendData,frontendResources);\n')
print('Selected overrides:', len(selection), '| Topics with videos:', sum(bool(d.get('videos')) for d in data.values()), '| Unique direct videos:', len({v['id'] for d in data.values() for v in d.get('videos',[]) if v.get('id')}))
