const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if the username is valid
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Function to check if the username and password match the records
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Middleware to authenticate the user using JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: "Authorization token required" });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], 'secret_key');
        req.user = decoded; // Store the decoded user information in the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const accessToken = jwt.sign({ username }, 'secret_key', { expiresIn: '1h' });

    return res.status(200).json({ message: "Login successful", accessToken });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
  const { isbn } = req.params;  // Extract ISBN from request parameters
  const { review } = req.body;  // Extract review from request body
  const username = req.user.username;  // Get the username from the JWT token

  // Check if the review is provided
  if (!review) {
      return res.status(400).json({ message: "Review is required" });
  }

  // Find the book by its ISBN using Object.values() and .find()
  const book = Object.values(books).find(book => book.isbn === isbn);

  // If the book is not found
  if (!book) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews object if not already present
  if (!book.reviews) {
      book.reviews = {};
  }

  // Add or update the review for the current user
  book.reviews[username] = review;

  // Return success response with the updated reviews
  return res.status(200).json({ message: "Review added/updated successfully", reviews: book.reviews });
});


// Modify a book review (only the user who added the review can modify it)
regd_users.put("/auth/review/modify/:isbn", authenticateToken, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.user.username; // Username is obtained from the JWT token

  if (!review) {
      return res.status(400).json({ message: "Review is required" });
  }

  // Find the book by its ISBN using Object.values() and .find()
  const book = Object.values(books).find(book => book.isbn === isbn);

  // Check if the book exists
  if (!book) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has already reviewed the book
  if (!book.reviews[username]) {
      return res.status(400).json({ message: "You can only modify your own reviews" });
  }

  // Modify the review
  book.reviews[username] = review;
  return res.status(200).json({ message: "Review modified successfully" });
});

// Delete a book review (only the user who added the review can delete it)
regd_users.delete("/auth/review/delete/:isbn", authenticateToken, (req, res) => {
  const { isbn } = req.params;
  const username = req.user.username; // Username is obtained from the JWT token

  // Find the book by its ISBN using Object.values() and .find()
  const book = Object.values(books).find(book => book.isbn === isbn);

  // Check if the book exists
  if (!book) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has reviewed the book
  if (!book.reviews[username]) {
      return res.status(400).json({ message: "You can only delete your own reviews" });
  }

  // Delete the review
  delete book.reviews[username];
  return res.status(200).json({ message: "Review deleted successfully" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
