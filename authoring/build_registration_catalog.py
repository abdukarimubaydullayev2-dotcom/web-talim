"""Extract geographical facts and current college names from official Annex 4.
Input is downloaded public Lex.uz HTML, never executable source.
"""
from pathlib import Path
import json,re,sys
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parents[1]
s=BeautifulSoup(Path(sys.argv[1]).read_bytes(),'html.parser')
tables=[t for t in s.find_all('table') if 'Quvvati' in t.get_text()];assert len(tables)==1
regions=[];districts=[];colleges=[];region=None;dmap={}
clean=lambda x:re.sub(r'\s+',' ',x).strip()
for tr in tables[0].find_all('tr'):
 cells=[clean(c.get_text(' ',strip=True)) for c in tr.find_all(['td','th'],recursive=False)]
 if len(cells)==1 and ('viloyati' in cells[0] or 'Respublikasi' in cells[0] or 'Toshkent shahri'==cells[0]):
  region=dict(id='r'+str(len(regions)+1),name=cells[0]);regions.append(region)
 if len(cells)==5 and region and re.fullmatch(r'[0-9]+(?:\s*[0-9]+)?\.',cells[0]):
  district,name=cells[1],cells[3]
  if not name or name in ['—','-'] or 'chiqarib' in name.lower():continue
  key=(region['id'],district)
  if key not in dmap:
   dmap[key]='d'+str(len(districts)+1);districts.append(dict(id=dmap[key],regionId=region['id'],name=district))
  colleges.append(dict(id='t'+re.sub(r'\D','',cells[0]),regionId=region['id'],districtId=dmap[key],name=name))
assert len(regions)==14 and len(colleges)>600 and len({c['id'] for c in colleges})==len(colleges)
assert any(c['name']=='Namangan shahar 3-son texnikumi' for c in colleges)
data=dict(regions=regions,districts=districts,colleges=colleges,source='https://www.lex.uz/uz/acts/-7792559',checkedOn='2026-10-28',note='PF-190 farmonining 4-ilovasi amaldagi tahriridagi davlat texnikumlari. Boshqa tizim yoki nodavlat texnikumlar to‘liq qamralmasligi mumkin.')
(root/'auth/catalog.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(len(regions),'regions',len(districts),'districts',len(colleges),'colleges')
