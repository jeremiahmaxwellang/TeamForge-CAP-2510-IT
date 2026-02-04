const express = require('express');
const path = require('path');
const dotenv = require('dotenv').config();
const mySqlPool = require('../config/database');


const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", 'hbs');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes 
// https://www.youtube.com/watch?v=H9M02of22z4
app.use('/api/v1/users', require("../routes/userRoutes"));
app.use("/api/contacts", require("../routes/contactRoutes"));

// Controllers
const {getUsers} = require("../controllers/userController");
const {getContact} = require("../controllers/contactController");


// Login
app.get('/', async function(req, res) {
    res.sendFile(path.join(__dirname, '../views/login.html')); 
    //change this back to login.html
});

// Signup
app.get('/signup', async function(req, res) {
    res.sendFile(path.join(__dirname, '../views/signup.html'));
});

// Register
app.get('/register', async function(req, res) {
    res.sendFile(path.join(__dirname, '../views/register.html'));
});

// Player Performance Analysis Page
app.get('/player_analysis', async function(req, res) {
    res.sendFile(path.join(__dirname, '../views/player_analysis.html')); 
});


mySqlPool.query('SELECT 1').then(() => {
    console.log('MySQL DB Connected');
})
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

