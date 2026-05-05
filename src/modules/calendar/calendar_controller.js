const mySqlPool = require('../../config/database');

// 1. Serve the HTML page
exports.getCalendarPage = (req, res) => {
    res.sendFile('calendar.html', { root: './src/modules/calendar' }); // Adjust root if your html is somewhere else
};