// Node.js 24. Run from this project directory: node test.cjs
const {DatabaseSync}=require('node:sqlite');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'web-talim-database-'));
const file=path.join(dir,'library.sqlite');let db;
let count=0;
function check(name,fn){fn();count++;console.log('✓ '+name);}
try{
 db=new DatabaseSync(file);db.exec(fs.readFileSync(path.join(__dirname,'schema.sqlite.sql'),'utf8'));db.exec(fs.readFileSync(path.join(__dirname,'seed.sql'),'utf8'));
 check('to‘rtta jadval',()=>assert.equal(db.prepare("SELECT COUNT(*) n FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").get().n,4));
 check('uchta kitob',()=>assert.equal(db.prepare('SELECT COUNT(*) n FROM books').get().n,3));
 check('ikki kategoriya',()=>assert.equal(db.prepare('SELECT COUNT(*) n FROM categories').get().n,2));
 check('uchta a’zo',()=>assert.equal(db.prepare('SELECT COUNT(*) n FROM members').get().n,3));
 check('NULL qaytarilmaganlar',()=>assert.equal(db.prepare('SELECT COUNT(*) n FROM loans WHERE returned_on IS NULL').get().n,2));
 check('manfiy stock rad',()=>assert.throws(()=>db.prepare('UPDATE books SET stock=-1 WHERE id=1').run()));
 check('manfiy narx rad',()=>assert.throws(()=>db.prepare('UPDATE books SET price_sum=-1 WHERE id=1').run()));
 check('bo‘sh title rad',()=>assert.throws(()=>db.prepare('UPDATE books SET title=? WHERE id=1').run('  ')));
 check('NULL title rad',()=>assert.throws(()=>db.prepare('UPDATE books SET title=NULL WHERE id=1').run()));
 check('takroriy card rad',()=>assert.throws(()=>db.prepare('INSERT INTO members(name,card_no,group_name) VALUES (?,?,?)').run('Boshqa','C001','3-IT')));
 check('begona kategoriya rad',()=>assert.throws(()=>db.prepare('INSERT INTO books(title,category_id,price_sum,stock) VALUES (?,?,?,?)').run('X',999,1,1)));
 check('begona a’zo rad',()=>assert.throws(()=>db.prepare('INSERT INTO loans(member_id,book_id,issued_on,due_on) VALUES (?,?,?,?)').run(999,1,'2026-10-01','2026-10-10')));
 check('begona kitob rad',()=>assert.throws(()=>db.prepare('INSERT INTO loans(member_id,book_id,issued_on,due_on) VALUES (?,?,?,?)').run(1,999,'2026-10-01','2026-10-10')));
 check('sana tartibi rad',()=>assert.throws(()=>db.prepare('INSERT INTO loans(member_id,book_id,issued_on,due_on) VALUES (?,?,?,?)').run(1,1,'2026-10-10','2026-10-01')));
 check('erta qaytarish rad',()=>assert.throws(()=>db.prepare('UPDATE loans SET returned_on=? WHERE id=1').run('2026-09-30')));
 check('tarix bilan parent o‘chmaydi',()=>assert.throws(()=>db.prepare('DELETE FROM members WHERE id=1').run()));
 check('LEFT JOIN nol berishni saqlaydi',()=>assert.equal(db.prepare('SELECT COUNT(l.id) n FROM members m LEFT JOIN loans l ON l.member_id=m.id WHERE m.id=3').get().n,0));
 check('aniq sana qarzdorlari',()=>assert.deepEqual(db.prepare('SELECT id FROM loans WHERE returned_on IS NULL AND due_on<? ORDER BY id').all('2026-10-20').map(r=>r.id),[1,3]));
 check('CTE eng qimmat kitoblar',()=>assert.deepEqual(db.prepare('WITH r AS(SELECT id,ROW_NUMBER() OVER(PARTITION BY category_id ORDER BY price_sum DESC,id) n FROM books) SELECT id FROM r WHERE n=1 ORDER BY id').all().map(r=>r.id),[2,3]));
 check('parametr qo‘shtirnoqni ma’lumot deb oladi',()=>assert.equal(db.prepare('SELECT COUNT(*) n FROM books WHERE title=?').get("' OR 1=1 --").n,0));
 check('ROLLBACK to‘liq bekor qiladi',()=>{const old=db.prepare('SELECT stock FROM books WHERE id=1').get().stock;db.exec('BEGIN');try{db.exec('UPDATE books SET stock=stock-1 WHERE id=1');db.exec('UPDATE books SET stock=-1 WHERE id=2');db.exec('COMMIT');assert.fail('Constraint should fail');}catch(e){db.exec('ROLLBACK');}assert.equal(db.prepare('SELECT stock FROM books WHERE id=1').get().stock,old);});
 check('savepoint qisman bekor qiladi',()=>{db.exec('BEGIN; SAVEPOINT p; UPDATE books SET stock=9 WHERE id=1; ROLLBACK TO p; RELEASE p; COMMIT;');assert.equal(db.prepare('SELECT stock FROM books WHERE id=1').get().stock,3);});
 check('foreign key tekshiruvi toza',()=>assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0));
 db.close();db=null;
 const copy=path.join(dir,'restore.sqlite');fs.copyFileSync(file,copy);db=new DatabaseSync(copy);
 check('alohida nusxadan tiklash',()=>assert.equal(db.prepare('SELECT COUNT(*) n FROM books').get().n,3));
 check('tiklangan hisobot',()=>assert.equal(db.prepare('SELECT COUNT(*) n FROM loans WHERE returned_on IS NULL').get().n,2));
 console.log(`${count} ta tekshiruv o‘tdi. Vaqtinchalik fayllar tozalanadi.`);
}finally{if(db)db.close();fs.rmSync(dir,{recursive:true,force:true});}
