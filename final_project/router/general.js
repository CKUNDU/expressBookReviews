const express = require('express');
const { getAllBooks, getBookByIsbn, getBooksByAuthor, getBooksByTitle, getBookReviews } = require('../services/booksService');
const UsersService = require('../services/usersService');
const public_users = express.Router();

// Register a new user
public_users.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }
  try {
      // Check if username is already taken
      const userExists = await UsersService.isValidUsername(username);

      if (userExists) {
          return res.status(409).json({ message: "User already exists" });
      }

      // Register the new user
      const result = await UsersService.registerUser(username, password);
      if (result.success) {
          return res.status(201).json({ message: result.message });
      } else {
          return res.status(500).json({ message: result.message });
      }
  } catch (err) {
      console.error("Error in /register route:", err.message);
      return res.status(500).json({ message: "Internal server error" });
  }
});

// Get the book list available in the shop using async/await
public_users.get('/', async (req, res) => {
    try {
        const booksList = await getAllBooks();
        return res.status(200).json({ books: booksList });
    } catch (error) {
        console.error("Error fetching books:", error);
        return res.status(500).json({ message: "Error retrieving books" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = await getBookByIsbn(isbn);
        if (book) {
            return res.status(200).json(book);
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        console.error("Error fetching book by ISBN:", error);
        return res.status(500).json({ message: "Error retrieving book" });
    }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const booksByAuthor = await getBooksByAuthor(author);
        if (booksByAuthor.length > 0) {
            return res.status(200).json(booksByAuthor);
        } else {
            return res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        console.error("Error fetching books by author:", error);
        return res.status(500).json({ message: "Error retrieving books by author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const booksByTitle = await getBooksByTitle(title);
        if (booksByTitle.length > 0) {
            return res.status(200).json(booksByTitle);
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        console.error("Error fetching books by title:", error);
        return res.status(500).json({ message: "Error retrieving books by title" });
    }
});

// Get book review
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const reviews = await getBookReviews(isbn);
        if (reviews) {
            return res.status(200).json(reviews);
        } else {
            return res.status(404).json({ message: "Reviews not found for this book" });
        }
    } catch (error) {
        console.error("Error fetching book reviews:", error);
        return res.status(500).json({ message: "Error retrieving book reviews" });
    }
});

module.exports.general = public_users;
