let mysql = require('mysql2/promise');

const mySqlPool = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'password',
    database:'teamforgedb'
});
// password may vary from device to device

module.exports = mySqlPool;