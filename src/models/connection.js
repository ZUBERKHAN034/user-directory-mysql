const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'user'
});

connection.connect((err) => {
    if (err) throw err;
});

module.exports = connection;