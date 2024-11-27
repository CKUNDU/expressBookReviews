const express = require('express');
let books = require("./booksdb.js"); // Assuming `booksdb.js` contains book data as an object
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some(user => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: "User already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop using async/await
public_users.get('/', async (req, res) => {
  try {
      // Simulate fetching books (you can replace this with actual async code if needed)
      const booksList = await new Promise((resolve) => {
          // Mimicking an async operation (like reading a file or querying a DB)
          setTimeout(() => resolve(books), 1000); // Replace with actual async code
      });

      return res.status(200).json({ books: booksList });
  } catch (error) {
      console.error("Error fetching books:", error);
      return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const filteredBooks = Object.values(books).filter(book => book.isbn === isbn);
    if (filteredBooks.length > 0) {
        return res.status(200).json(filteredBooks);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author;
    const filteredBooks = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());

    if (filteredBooks.length > 0) {
        return res.status(200).json(filteredBooks);
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title;
    const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());

    if (filteredBooks.length > 0) {
        return res.status(200).json(filteredBooks);
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn] && books[isbn].reviews) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Reviews not found for this book" });
    }
});

module.exports.general = public_users;
