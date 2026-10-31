"""Build separate Informatics subject from reviewed original lesson content and supplied plan.
Run from project root. No independent education entries are published.
"""
import json,re,html
from pathlib import Path
plan=json.loads(Path('authoring/informatics-plan.json').read_text())
units={}
for i in range(1,4): units.update(json.loads(Path(f'authoring/informatics-{i}.json').read_text()))
videos=json.loads(Path('authoring/informatics-videos.json').read_text()) if Path('authoring/informatics-videos.json').exists() else {}
esc=lambda x:html.escape(str(x),quote=True)
def para(text):
 return ''.join('<p>'+esc(p).replace('\n','<br>')+'</p>' for p in str(text).split('\n\n') if p.strip())
result={}
for meta in plan['lessons']:
 n=meta['number'];u=units[str(n)];sections=u['sections'];ex=u['example'];qa=[[esc(q),esc(a)] for q,a in u['qa']];quiz=[{**q,'q':esc(q['q']),'options':[esc(x) for x in q['options']],'explanation':esc(q['explanation'])} for q in u['quiz']]
 assert len(qa)==10 and len(quiz)==10,(n,len(qa),len(quiz))
 assert len(set(q['q'] for q in quiz))==10,n
 for q in quiz:
  assert len(q['options'])==4 and len(set(q['options']))==4,(n,q)
  assert type(q['correct'])==int and 0<=q['correct']<4,(n,q)
  assert q['explanation'],(n,q)
 intro='<h3>Dars maqsadi va rejasi</h3><p>'+esc('Ushbu '+('amaliy mashg‘ulotda' if meta['type']=='amaliy' else 'nazariy darsda')+' '+meta['title'])+'</p><ol>'+''.join('<li>'+esc(s['title'])+'</li>' for s in sections)+'</ol>'
 body=intro+''.join('<h3>'+esc(s['title'])+'</h3>'+para(s['text']) for s in sections)
 body+='<section class="info-example"><h3>'+('Amaliy ishni bajarish' if meta['type']=='amaliy' else 'Tushunchalarni misolda tahlil qilish')+'</h3>'+para(ex['task'])+'<ol>'+''.join('<li>'+esc(s)+'</li>' for s in ex['steps'])+'</ol><h3>Kutiladigan natija va tekshirish</h3>'+para(ex['expected'])+'<h3>Ko‘p uchraydigan xato</h3>'+para(ex['pitfall'])+'</section>'
 glossary=u.get('glossary',[])
 if glossary:body+='<h3>Atamalar</h3><dl class="info-term">'+''.join('<dt>'+esc(a)+'</dt><dd>'+esc(b)+'</dd>' for a,b in glossary)+'</dl>'
 if u.get('sources'):
  sources=u['sources'];body+='<h3>Foydalanish uchun manbalar</h3><ul>'
  for source in sources:
   if isinstance(source,str):url=title=source
   else:url=source.get('url',source.get('href',''));title=source.get('title',url)
   if url.startswith('https://'):body+='<li><a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(title)+'</a></li>'
  body+='</ul>'
 slides=[{'title':meta['title'],'body':['Informatika va axborot texnologiyalari',f"{meta['chapter']+1}-bob · {n}-mavzu · 2 soat",'Amaliy mashg‘ulot' if meta['type']=='amaliy' else 'Nazariy mashg‘ulot']}]
 for section in sections:
  sentences=re.split(r'(?<=[.!?])\s+(?=[A-ZА-ЯO‘G‘0-9])',section['text'])
  chunks=[];chunk=[];words=0
  for sentence in sentences:
   if words+len(sentence.split())>75 and chunk:chunks.append(chunk);chunk=[];words=0
   chunk.append(sentence);words+=len(sentence.split())
  if chunk:chunks.append(chunk)
  for k,chunk in enumerate(chunks):slides.append({'title':section['title']+(f' ({k+1})' if len(chunks)>1 else ''),'body':chunk})
 slides.extend([{'title':'Misol va bajarish tartibi','body':[ex['task'],*ex['steps'][:3]]},{'title':'Natijani tekshirish','body':[ex['expected'],ex['pitfall']]},{'title':'Bilimingizni tekshiring','body':[q[0] for q in qa[:3]]}])
 for slide in slides:
  slide['title']=esc(slide['title']);slide['body']=[esc(x) for x in slide['body']]
 result[str(n)]={**meta,'html':body,'slides':slides,'qa':qa,'quiz':quiz,'videos':videos.get(str(n),[])}
 assert 'Mustaqil ta’lim' not in body and 'Mustaqil ta\'lim' not in body
Path('course/informatics-data.js').write_text('const informaticsPlan='+json.dumps(plan,ensure_ascii=False)+';\nconst informaticsData='+json.dumps(result,ensure_ascii=False)+';\n')
print(f'Informatics: {len(result)} lessons, {sum(len(x["slides"]) for x in result.values())} slides, 600 QA and 600 test questions; {sum(bool(x["videos"]) for x in result.values())} lessons with video.')
