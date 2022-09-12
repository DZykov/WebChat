let mysql  = require('mysql');
let config = require('./config.js');
let connection = mysql.createConnection(config);

// insert statment
let sql = `INSERT INTO users(username, password)
           VALUES('user1', '123456')`;

// execute the insert statment
connection.query(sql);

// get data
//select * from users where concat(username, ' ', password) like '%user1% %123456%';


connection.end();