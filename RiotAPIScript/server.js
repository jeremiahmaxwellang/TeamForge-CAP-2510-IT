const express = require('express');
const https = require('https');
const cors = require('cors');
const bodyParser = require('body-parser'); // <-- Needed for POST form data
const mysql = require('mysql2'); // <-- MySQL connection
const session = require('express-session'); // optional session management
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public')); // serve HTML/CSS

// Optional: session setup
app.use(session({
    secret: 'teamforge_secret',
    resave: false,
    saveUninitialized: true
}));

// --- CONFIGURATION ---
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const apiKey = process.env.API_KEY;

const MATCH_REGION = 'sea';

// --- MySQL Setup ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // replace with your MySQL password
    database: 'teamforgedb'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// --- HELPER FUNCTION: Riot API Request ---
function riotRequest(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'X-Riot-Token': apiKey,
                'User-Agent': 'NodeJS-Server'
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject('Failed to parse JSON');
                    }
                } else {
                    reject({ status: res.statusCode, message: res.statusMessage });
                }
            });
        }).on('error', err => reject(err));
    });
}

// --- LOGIN ROUTE ---
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM users WHERE email = ? AND passwordHash = ?`;
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        if (results.length > 0) {
            const user = results[0];
            req.session.user = user; // store in session

            // Redirect based on role
            switch (user.position) {
                case 'Team Manager':
                    return res.json({ redirect: '/manager_dashboard.html' });
                case 'Player':
                    return res.json({ redirect: '/player_dashboard.html' });
                case 'Team Coach':
                    return res.json({ redirect: '/coach_dashboard.html' });
                default:
                    return res.status(400).send('Role not recognized');
            }
        } else {
            return res.status(401).send('Invalid email or password');
        }
    });
});

// --- Serve login page ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

// --- Riot API endpoint (existing logic) ---
app.get('/api/matches/:gameName/:tagLine', async (req, res) => {
    const { gameName, tagLine } = req.params;
    console.log(`\n--- NEW REQUEST: ${gameName} #${tagLine} ---`);

    try {
        let accountCluster = (MATCH_REGION === 'sea') ? 'asia' : MATCH_REGION;

        const accountUrl = `https://${accountCluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
        const accountData = await riotRequest(accountUrl);
        const puuid = accountData.puuid;

        const matchesUrl = `https://${MATCH_REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=5`;
        const matchIds = await riotRequest(matchesUrl);

        const cleanedMatches = [];
        for (const matchId of matchIds) {
            const detailsUrl = `https://${MATCH_REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
            try {
                const matchData = await riotRequest(detailsUrl);
                const info = matchData.info;
                const player = info.participants.find(p => p.puuid === puuid);
                if (player) {
                    cleanedMatches.push({
                        gameDuration: info.gameDuration,
                        queueType: info.queueId === 420 ? "Ranked Solo" : "Normal/Other",
                        win: player.win,
                        championName: player.championName,
                        kills: player.kills,
                        deaths: player.deaths,
                        assists: player.assists,
                        cs: player.totalMinionsKilled + player.neutralMinionsKilled,
                        gold: player.goldEarned,
                        items: [player.item0, player.item1, player.item2, player.item3, player.item4, player.item5],
                        spells: [player.summoner1Id, player.summoner2Id]
                    });
                }
            } catch (err) {
                console.error(`Failed to load match ${matchId}:`, err);
            }
        }

        res.json(cleanedMatches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
