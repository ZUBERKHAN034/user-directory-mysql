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

//SQL QUERIES
const create = (sql, values) => new Promise((resolve, reject) => {
    connection.query(sql, [values], (error, results) => {
        if (error) {
            return reject(error);
        }
        return resolve(results);
    });
});

const findOne = (sql, values) => new Promise((resolve, reject) => {
    connection.query(sql, [values], (error, results) => {
        if (error) {
            return reject(error);
        }
        return resolve(results);
    });
});

const find = (sql, values) => new Promise((resolve, reject) => {
    connection.query(sql, values, (error, results) => {
        if (error) {
            return reject(error);
        }
        return resolve(results);
    });
});

module.exports = { create, findOne, find };