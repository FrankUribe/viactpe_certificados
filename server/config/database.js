const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'viactpe_certificados',
  charset : 'utf8mb4'
});

// Check connect
connection.connect(error => {
  if (error) throw error;
  console.log('Database server running!');
});

module.exports = connection;