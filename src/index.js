const express = require('express');
const path = require('path');
const dotenv = require('dotenv').config();
const mySqlPool = require('./config/database');

const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", 'hbs');

// Serve static files from the "public" directory
app.use(express.static(path.join(process.cwd(), './public')));
global.viewsPath = path.join(process.cwd(), 'views');

// Routes 
app.use("/", require("./routes/authRoutes")); // login routes
app.use('/player_analysis', require("./routes/playerAnalysisRoutes"));
app.use('/api/v1/users', require("./routes/userRoutes"));


mySqlPool.query('SELECT 1').then(() => {
    console.log('MySQL DB Connected');
})
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

