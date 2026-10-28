// OFFLINE ONLY: serverni oldin to‘xtating. Bu skript faol writer borligini aniqlamaydi.
import {copyFile,mkdir,access} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {constants} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
const [dataDir,dest]=process.argv.slice(2);if(!dataDir||!dest)throw new Error('node backup.mjs DATA_DIR DEST.sqlite; avval serverni to‘xtating');
const source=join(resolve(dataDir),'tasks.sqlite');await access(source);await mkdir(dirname(resolve(dest)),{recursive:true});
for(const suffix of ['-wal','-journal']){try{await access(source+suffix);throw new Error('Journal mavjud: serverni to‘xtatib bazani to‘g‘ri yoping');}catch(e){if(e.code!=='ENOENT')throw e;}}
await copyFile(source,resolve(dest),constants.COPYFILE_EXCL);const db=new DatabaseSync(resolve(dest));try{const rows=db.prepare('PRAGMA integrity_check').all();if(rows.length!==1||Object.values(rows[0])[0]!=='ok')throw new Error('integrity_check xato');console.log('BACKUP OK',db.prepare('SELECT COUNT(*) AS count FROM tasks').get());}finally{db.close();}
