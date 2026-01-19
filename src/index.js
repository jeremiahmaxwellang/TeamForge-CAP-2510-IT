const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();

app.set("view engine", 'ejs');

// Login page = Landing Page
app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});


const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});