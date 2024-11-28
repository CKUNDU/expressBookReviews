const db = require('../db/db'); // Your database connection module

async function getAllBooks() {
    const [rows] = await db.query('SELECT * FROM books');
    return rows;
}

async function getBookByIsbn(isbn) {
    const [rows] = await db.query('SELECT * FROM books WHERE isbn = ?', [isbn]);
    return rows.length > 0 ? rows[0] : null;
}

async function getBooksByAuthor(author) {
    const [rows] = await db.query('SELECT * FROM books WHERE author = ?', [author]);
    return rows;
}

async function getBooksByTitle(title) {
  const [rows] = await db.query('SELECT * FROM books WHERE title LIKE ?', [`%${title}%`]);
  console.log(rows); // This will now log only the book data
  return rows; // Return only the book data
}

async function getBookReviews(isbn) {
    const [rows] = await db.query('SELECT * FROM reviews WHERE isbn = ?', [isbn]);
    return rows.length > 0 ? rows : null;
}

module.exports = {
    getAllBooks,
    getBookByIsbn,
    getBooksByAuthor,
    getBooksByTitle,
    getBookReviews
};
