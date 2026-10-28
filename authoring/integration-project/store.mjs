import {DatabaseSync} from 'node:sqlite';
export function validTitle(x){return typeof x==='string'&&x.trim().length>=1&&x.trim().length<=80;}
export function openStore(path=':memory:'){
 const db=new DatabaseSync(path);
 db.exec(`CREATE TABLE IF NOT EXISTS tasks(id INTEGER PRIMARY KEY,title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 80),done INTEGER NOT NULL DEFAULT 0 CHECK(done IN (0,1)));PRAGMA user_version=1;`);
 const map=x=>({...x,done:!!x.done});
 return {
  list(done){const rows=done===undefined?db.prepare('SELECT * FROM tasks ORDER BY id DESC LIMIT 101').all():db.prepare('SELECT * FROM tasks WHERE done=? ORDER BY id DESC LIMIT 101').all(done);return {tasks:rows.slice(0,100).map(map),truncated:rows.length>100};},
  create(title){if(!validTitle(title))throw new TypeError('title');const r=db.prepare('INSERT INTO tasks(title) VALUES(?)').run(title.trim());return map(db.prepare('SELECT * FROM tasks WHERE id=?').get(r.lastInsertRowid));},
  update(id,done){if(typeof done!=='boolean')throw new TypeError('done');db.prepare('UPDATE tasks SET done=? WHERE id=?').run(Number(done),id);const row=db.prepare('SELECT * FROM tasks WHERE id=?').get(id);return row?map(row):null;},
  remove(id){return db.prepare('DELETE FROM tasks WHERE id=?').run(id).changes>0;},
  ready(){return db.prepare('SELECT 1 AS ok').get().ok===1;},
  close(){db.close();},db
 };
}
