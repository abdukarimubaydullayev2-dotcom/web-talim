import json
from pathlib import Path
root=Path(__file__).resolve().parents[1];p=root/'dist/frontend-resources.js';text=p.read_text();d=json.loads(text.split('const frontendResources=',1)[1].split(';\nObject.assign',1)[0]);m4=json.loads((root/'dist/module4-data.js').read_text().removeprefix('const module4Data=').strip().rstrip(';'))
assign={47:7,49:7,50:8,51:9,52:9,53:11,54:12,55:11,56:13,57:13,58:14,59:16,60:16,61:16,62:15,63:15,64:15,66:18,68:20,100:15,108:7,109:20,110:20}
for n,base in assign.items():
 v=dict(m4[str(base)]['videos'][0]);v['coverage']='Mavzuga aloqador o‘zbekcha JavaScript darsi. To‘liq nazariy izoh va topshiriq ushbu mavzuning konspektida berilgan.';v['task']='Videoni ko‘rgach, mavzudagi namuna bilan farqini yozing va amaliy topshiriqni bajaring.';d[str(n)]['videos']=[v]
playlist='PLpDyZ4xZcDg_aAzP6pDD1PRsYCSdheveS'
for n in list(range(5,19))+[93,94,97]:
 d[str(n)]['videos']=[{'playlist':playlist,'title':'HTMLda dasturlash — o‘zbekcha videodarslar to‘plami','channel':'Ulugbek Samigjonov','language':'O‘zbekcha','coverage':'HTML bo‘yicha kurs ro‘yxati. Ro‘yxatdan ushbu mavzuga mos darsni tanlang; bu bitta mavzuga bag‘ishlangan alohida video emas.','task':'Mavzuga mos darsni tanlang. Teg yoki atributning vazifasini konspektdagi namuna bilan solishtirib amaliy mashqni bajaring.','source':'https://www.youtube.com/playlist?list='+playlist}]
p.write_text('const frontendResources='+json.dumps(d,ensure_ascii=False)+';\nObject.assign(frontendData,frontendResources);\n')
print(sum(bool(v['videos']) for v in d.values()),'lessons with related video or HTML course playlist')
