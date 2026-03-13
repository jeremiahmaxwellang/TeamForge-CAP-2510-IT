const express = require('express');
const path = require('path');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const mySqlPool = require('./config/database');

const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", 'hbs');
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(cookieParser());

// Serve static files from the "public" directory
app.use(express.static(path.join(process.cwd(), './public')));
global.viewsPath = path.join(process.cwd(), 'views');

// Routes 
app.use("/", require("./routes/authRoutes")); // login routes
app.use('/register', require("./routes/registerRoutes")); // registration routes
app.use('/applicant_list', require('./routes/applicant_listRoutes')); // applicant list routes
app.use('/player_analysis', require('./routes/playerAnalysisRoutes'));
app.use('/riot', require('./routes/riotApiRoutes'));
app.use('/team_management', require('./routes/team_managementRoutes')); // team management routes
app.use('/announcements', require('./routes/announcementRoutes')); // announcement routes
app.use('/tournament', require('./routes/tournamentRoutes')); // tournament routes

// Backward-compatible URL for pages linking to /tournament.html
app.get('/tournament.html', (req, res) => {
    res.redirect('/tournament');
});

app.use('/api/v1/users', require("./routes/userRoutes"));


mySqlPool.query('SELECT 1').then(() => {
    console.log('MySQL DB Connected');
})
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

