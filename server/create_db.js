let mysql = require('mysql');

let connection = mysql.createConnection({
  host    : 'us-cdbr-east-06.cleardb.net',
  user    : 'b35af2c5b67476',
  password: 'd796343f',
  database: 'heroku_f8077d9e94ba5f1'
});

// connect to the MySQL server
connection.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }

  let createTodos = `create table if not exists users(
                        username VARCHAR(255) NOT NULL,
                        password VARCHAR(255) NOT NULL
                    )`;

  connection.query(createTodos, function(err, results, fields) {
    if (err) {
      console.log(err.message);
    }
  });

  connection.end(function(err) {
    if (err) {
      return console.log(err.message);
    }
  });
});