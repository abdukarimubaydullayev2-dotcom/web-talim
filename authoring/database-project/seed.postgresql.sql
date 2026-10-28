INSERT INTO library.categories VALUES(1,'IT'),(2,'Adabiyot');
INSERT INTO library.books VALUES
 (1,'JavaScript asoslari',1,50000,3),
 (2,'SQL amaliyoti',1,70000,2),
 (3,'O‘zbek adabiyoti',2,40000,1);
INSERT INTO library.members VALUES
 (1,'Ali','C001','3-IT'),(2,'Vali','C002','2-IT'),(3,'Nodir','C003','3-IT');
INSERT INTO library.loans VALUES
 (1,1,1,'2026-10-01','2026-10-10',NULL),
 (2,1,2,'2026-10-02','2026-10-12','2026-10-08'),
 (3,2,1,'2026-10-04','2026-10-14',NULL);

SELECT setval(pg_get_serial_sequence('library.books','id'),(SELECT MAX(id) FROM library.books));
SELECT setval(pg_get_serial_sequence('library.loans','id'),(SELECT MAX(id) FROM library.loans));
