const express = require('express');
const path = require('path');
const dotenv = require('dotenv').config();

// Example on how to use Controllers
const {getContact} = require("../controllers/contactController");

const app = express();

const port = process.env.PORT || 3000;

app.set("view engine", 'hbs');

// Example on how to use Routes
// https://www.youtube.com/watch?v=H9M02of22z4
app.use("/api/contacts", require("../routes/contactRoutes"));

// Login page = Landing Page
// Route to login.html
// localhost:3000
app.get('/', async function(req, res) {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

// Signup
app.get('/signup', async function(req, res) {
    res.sendFile(path.join(__dirname, '../views/signup.html'));
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});