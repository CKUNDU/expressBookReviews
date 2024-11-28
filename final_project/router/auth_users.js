const express = require('express');
const jwt = require('jsonwebtoken');
const UsersService = require('../services/usersService');
const regd_users = express.Router();

// Middleware to authenticate the user using JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: "Authorization token required" });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], 'secret_key');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

// Login a user
regd_users.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const isAuthenticated = await UsersService.authenticateUser(username, password);
    if (!isAuthenticated) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const accessToken = jwt.sign({ username }, 'secret_key', { expiresIn: '1h' });
    return res.status(200).json({ message: "Login successful", accessToken });
});
// Add a new review for a book (authenticated users only)
regd_users.post("/books/:id/reviews", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { reviewText } = req.body;
  const username = req.user.username;

  if (!reviewText) {
      return res.status(400).json({ message: "Review text is required" });
  }

  const result = await UsersService.addReview(username, id, reviewText);
  if (result.success) {
      return res.status(201).json({ message: "Review added successfully" });
  } else {
      return res.status(500).json({ message: result.message });
  }
});

// Modify a review for a book (authenticated users only and can modify their own review)
regd_users.put("/books/:id/reviews", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { oldReviewText, newReviewText } = req.body;
  const username = req.user.username;

  if (!oldReviewText || !newReviewText) {
      return res.status(400).json({ message: "Both old and new review text are required" });
  }

  const result = await UsersService.updateReview(username, id, oldReviewText, newReviewText);
  if (result.success) {
      return res.status(200).json({ message: "Review updated successfully" });
  } else {
      return res.status(500).json({ message: result.message });
  }
});

// Delete a review for a book (authenticated users only and can delete their own review)
regd_users.delete("/books/:id/reviews", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { reviewText } = req.body;
  const username = req.user.username;

  if (!reviewText) {
      return res.status(400).json({ message: "Review text is required" });
  }

  const result = await UsersService.deleteReview(username, id, reviewText);
  if (result.success) {
      return res.status(200).json({ message: "Review deleted successfully" });
  } else {
      return res.status(500).json({ message: result.message });
  }
});

module.exports.authenticated = regd_users;
 