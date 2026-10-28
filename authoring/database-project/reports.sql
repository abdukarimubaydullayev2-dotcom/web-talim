-- SQLite demo bazasi. Aniq hisobot sanasi: 2026-10-20.
SELECT l.id,m.name,b.title,l.due_on FROM loans l
JOIN members m ON m.id=l.member_id JOIN books b ON b.id=l.book_id
WHERE l.returned_on IS NULL AND l.due_on<'2026-10-20' ORDER BY l.id;

SELECT b.id,b.title,COUNT(l.id) AS borrowed FROM books b
LEFT JOIN loans l ON l.book_id=b.id GROUP BY b.id,b.title
ORDER BY borrowed DESC,b.id;

SELECT m.id,m.name FROM members m
WHERE NOT EXISTS(SELECT 1 FROM loans l WHERE l.member_id=m.id) ORDER BY m.id;
