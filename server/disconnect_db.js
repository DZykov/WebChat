var mysql = require('mysql');

var connection = mysql.createConnection({
  host    : 'us-cdbr-east-06.cleardb.net',
  user    : 'b35af2c5b67476',
  password: 'd796343f',
});

connection.end(function(err) {
    if (err) {
      return console.log('error:' + err.message);
    }
    console.log('Close the database connection.');
  });
  