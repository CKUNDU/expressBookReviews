const db = require('../db/db'); // Replace './db' with your database connection module
const bcrypt = require('bcrypt'); // For hashing passwords

const UsersService = {
    // Add a new user to the database
    async registerUser(username, password) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
            const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
            await db.execute(query, [username, hashedPassword]);
            return { success: true, message: "User registered successfully" };
        } catch (err) {
            console.error("Error registering user:", err.message);
            return { success: false, message: "Error registering user" };
        }
    },

    // Check if a username is valid
    async isValidUsername(username) {
        try {
            const query = 'SELECT * FROM users WHERE username = ?';
            const [rows] = await db.execute(query, [username]);
            return rows.length > 0;
        } catch (err) {
            console.error("Error checking username validity:", err.message);
            return false;
        }
    },

    // Authenticate user credentials
    async authenticateUser(username, password) {
        try {
            const query = 'SELECT * FROM users WHERE username = ?';
            const [rows] = await db.execute(query, [username]);

            if (rows.length === 0) return false;

            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password); // Compare hashed passwords
            return isMatch;
        } catch (err) {
            console.error("Error authenticating user:", err.message);
            return false;
        }
    },
    async addReview(username, bookId, reviewText) {
        try {
            const query = 'SELECT reviews FROM books WHERE id = ?';
            const [rows] = await db.execute(query, [bookId]);
            if (rows.length === 0) {
                return { success: false, message: "Book not found" };
            }

            const currentReviews = rows[0].reviews || "";
            const updatedReviews = currentReviews ? `${currentReviews}\n${username}: ${reviewText}` : `${username}: ${reviewText}`;

            const updateQuery = 'UPDATE books SET reviews = ? WHERE id = ?';
            await db.execute(updateQuery, [updatedReviews, bookId]);

            return { success: true, message: "Review added successfully" };
        } catch (err) {
            console.error("Error adding review:", err.message);
            return { success: false, message: "Error adding review" };
        }
    },

    async updateReview(username, bookId, oldReviewText, newReviewText) {
        try {
            const query = 'SELECT reviews FROM books WHERE id = ?';
            const [rows] = await db.execute(query, [bookId]);
            if (rows.length === 0) {
                return { success: false, message: "Book not found" };
            }

            let currentReviews = rows[0].reviews || "";
            const reviewPattern = new RegExp(`${username}: ${oldReviewText}`, "g");

            if (!reviewPattern.test(currentReviews)) {
                return { success: false, message: "Review not found or unauthorized" };
            }

            currentReviews = currentReviews.replace(reviewPattern, `${username}: ${newReviewText}`);

            const updateQuery = 'UPDATE books SET reviews = ? WHERE id = ?';
            await db.execute(updateQuery, [currentReviews, bookId]);

            return { success: true, message: "Review updated successfully" };
        } catch (err) {
            console.error("Error updating review:", err.message);
            return { success: false, message: "Error updating review" };
        }
    },

    async deleteReview(username, bookId, reviewText) {
        try {
            const query = 'SELECT reviews FROM books WHERE id = ?';
            const [rows] = await db.execute(query, [bookId]);
            if (rows.length === 0) {
                return { success: false, message: "Book not found" };
            }

            let currentReviews = rows[0].reviews || "";
            const reviewPattern = new RegExp(`${username}: ${reviewText}`, "g");

            if (!reviewPattern.test(currentReviews)) {
                return { success: false, message: "Review not found or unauthorized" };
            }

            currentReviews = currentReviews.replace(reviewPattern, "").replace(/(\r\n|\n|\r)/gm, "").replace(/(\s{2,})/g, ' ');

            const updateQuery = 'UPDATE books SET reviews = ? WHERE id = ?';
            await db.execute(updateQuery, [currentReviews, bookId]);

            return { success: true, message: "Review deleted successfully" };
        } catch (err) {
            console.error("Error deleting review:", err.message);
            return { success: false, message: "Error deleting review" };
        }
    }
};

module.exports = UsersService;
