const express = require('express');
const path = require('path');

const app = express();

// app.set("view engine", 'ejs');
app.set("view engine", 'hbs');

// Login page = Landing Page
// Route to login.html
// localhost:3000/login
app.get('/', async function(req, res) {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});