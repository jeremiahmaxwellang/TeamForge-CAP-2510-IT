let mysql = require('mysql2');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'teamforge-db',
});
// password may vary from device to device

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to the database!");
});
