const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // your DB username
  password: '123456', // your DB password
  database: 'social', // your DB name
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

module.exports = db;
