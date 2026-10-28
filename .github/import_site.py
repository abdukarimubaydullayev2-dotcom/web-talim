"""Import the verified public Web Ta’lim static snapshot into this repository."""
import concurrent.futures,hashlib,json,time,urllib.request
from pathlib import Path
from urllib.parse import quote
BASE='https://web-talim-abdukarim-2026.satinyacorn67.chatgpt.site/'
ROOT=Path(__file__).resolve().parents[1]
rows=json.loads((ROOT/'.github/site-assets.json').read_text())
def fetch(row):
 rel=Path(row['path'])
 if rel.is_absolute() or '..' in rel.parts or rel.parts[0]!='dist':raise ValueError('Invalid path')
 dest=ROOT/rel
 if dest.exists() and hashlib.sha256(dest.read_bytes()).hexdigest()==row['sha256']:return
 for attempt in range(3):
  try:
   req=urllib.request.Request(BASE+quote(str(rel.relative_to('dist'))),headers={'User-Agent':'Web-Talim-GitHub-Import/1.0'})
   with urllib.request.urlopen(req,timeout=60) as response:data=response.read()
   if hashlib.sha256(data).hexdigest()!=row['sha256']:raise ValueError('Snapshot hash mismatch: '+str(rel))
   dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data);return
  except Exception:
   if attempt==2:raise
   time.sleep(attempt+1)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 for i,_ in enumerate(pool.map(fetch,rows),1):
  if i%50==0 or i==len(rows):print(f'Verified {i}/{len(rows)} static files',flush=True)
print('Static snapshot verified.')
