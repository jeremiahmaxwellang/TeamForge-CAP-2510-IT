const mySqlPool = require('../../config/database');
const nodemailer = require('nodemailer');

// 1. Serve the HTML page
exports.getAttendancePage = (req, res) => {
    res.sendFile('attendance.html', { root: './src/modules/attendance' });
};