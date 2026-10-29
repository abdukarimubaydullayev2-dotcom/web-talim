from pathlib import Path
p=Path('auth/login.html');s=p.read_text();start=s.index('<section class="intro');end=s.index('</section><section class="form-side">',start)
icons={
'Logistika':'<path d="M3 7h11v10H3zM14 10h4l3 4v3h-7M7 17a2 2 0 1 0 0 .1M18 17a2 2 0 1 0 0 .1"/>',
'Arxitektura va dizayn':'<path d="M3 21h18M5 21V9l7-6 7 6v12M9 21v-6h6v6M9 10h6"/>',
'Avtomobillar transport servisi':'<path d="M4 15l2-7h12l2 7v5H4zM4 15h16M7 18h1M16 18h1M7 5h10"/>',
'Turizm':'<path d="M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2zM9 3v16M15 5v16"/>',
'Buxgalteriya hisobi va audit':'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 10h1M12 10h1M16 10h1M8 14h1M12 14h1M16 14h1M8 18h1M12 18h5"/>',
'IT va web dasturlash':'<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 3l-4 18"/>',
'Zargarlik':'<path d="M3 8l4-5h10l4 5-9 13zM3 8h18M7 3l5 18 5-18"/>'
}
cards=''.join('<li class="direction-card'+(' featured' if i>=5 else '')+'"><span class="direction-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icon+'</svg></span><span>'+name+'</span></li>' for i,(name,icon) in enumerate(icons.items()))
panel='''<section class="intro admission"><a class="brand" href="/">Web Ta’lim<span>RAQAMLI TA’LIM RESURSI</span></a><div class="school-hero"><img src="/assets/texnikum-building-2026.jpg" alt="Namangan shahar 3-sonli texnikum binosi"><span class="school-tag">NAMANGAN SHAHAR</span></div><div class="admission-copy"><p class="eyebrow">3-SONLI TEXNIKUM</p><h1>O‘zingizga mos<br>kasbni tanlang.</h1><p>Texnologiya, dizayn, xizmat ko‘rsatish va hunarmandchilik yo‘nalishlari bilan tanishing.</p></div><ul class="directions">'''+cards+'''</ul><div class="admission-footer"><strong>Kasb tanlashdan — amaliy bilim sari.</strong><p>Web Ta’lim orqali IT darslari, amaliy topshiriqlar va testlardan foydalaning.</p><small>Qabul muddatlari va shartlarini texnikumdan aniqlashtiring.</small></div><footer>Namangan shahar 3-sonli texnikum<br>Tayyorlovchi: Ubaydullayev Abdukarim</footer>'''
s=s[:start]+panel+s[end:];p.write_text(s)
