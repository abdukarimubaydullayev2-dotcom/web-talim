PRAGMA foreign_keys=ON;
CREATE TABLE categories(id INTEGER PRIMARY KEY,name TEXT NOT NULL UNIQUE);
CREATE TABLE books(
 id INTEGER PRIMARY KEY,title TEXT NOT NULL CHECK(length(trim(title))>0),
 category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
 price_sum INTEGER NOT NULL CHECK(price_sum>=0),
 stock INTEGER NOT NULL DEFAULT 0 CHECK(stock>=0)
);
CREATE TABLE members(
 id INTEGER PRIMARY KEY,name TEXT NOT NULL,
 card_no TEXT NOT NULL UNIQUE,group_name TEXT NOT NULL
);
CREATE TABLE loans(
 id INTEGER PRIMARY KEY,member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
 book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
 issued_on TEXT NOT NULL,due_on TEXT NOT NULL,returned_on TEXT,
 CHECK(due_on>=issued_on),CHECK(returned_on IS NULL OR returned_on>=issued_on)
);
