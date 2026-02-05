let mysql = require('mysql2/promise');

const mySqlPool = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'root1234!',
    database:'teamforgedb'
});
// password may vary from device to device

module.exports = mySqlPool;