const pool = require('../db/db'); // Ensure correct path to your db.js file

async function insertBooks() {
  const books = {
    1: { isbn: "9780435905255", author: "Chinua Achebe", title: "Things Fall Apart", reviews: {} },
    2: { isbn: "978-0140449013", author: "Hans Christian Andersen", title: "Fairy tales", reviews: {} },
    3: { isbn: "978-0199535644", author: "Dante Alighieri", title: "The Divine Comedy", reviews: {} },
    4: { isbn: "978-0140441000", author: "Unknown", title: "The Epic Of Gilgamesh", reviews: {} },
    5: { isbn: "978-0140449242", author: "Unknown", title: "The Book Of Job", reviews: {} },
    6: { isbn: "978-0393044181", author: "Unknown", title: "One Thousand and One Nights", reviews: {} },
    7: { isbn: "978-0140447699", author: "Unknown", title: "Njál's Saga", reviews: {} },
    8: { isbn: "978-0141439518", author: "Jane Austen", title: "Pride and Prejudice", reviews: {} },
    9: { isbn: "978-0140449723", author: "Honoré de Balzac", title: "Le Père Goriot", reviews: {} },
    10: { isbn: "978-0802151360", author: "Samuel Beckett", title: "Molloy, Malone Dies, The Unnamable, the trilogy", reviews: {} },
  };

  try {
    for (const key in books) {
      const { isbn, author, title, reviews } = books[key];
      await pool.query(
        'INSERT INTO books (isbn, author, title, reviews) VALUES (?, ?, ?, ?)',
        [isbn, author, title, JSON.stringify(reviews)]
      );
    }
    console.log("Books inserted successfully!");
  } catch (err) {
    console.error("Error inserting books:", err.message);
  } finally {
    pool.end(); // Close the database connection
  }
}

insertBooks();
