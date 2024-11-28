const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',    // Replace with your DB host
  user: 'root',         // Replace with your DB username
  password: '',         // Replace with your DB password
  database: 'node_db',  // Replace with your DB name
});

module.exports = pool;
