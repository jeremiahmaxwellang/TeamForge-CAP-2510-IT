const express = require('express');
const https = require('https'); // <--- Using the native module that worked!
const cors = require('cors');
const app = express();

app.use(cors());

// --- CONFIGURATION ---
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const apiKey = process.env.API_KEY;

const MATCH_REGION = 'sea'; // 'sea' for PH/SG/VN

// --- HELPER FUNCTION: The "Debug.js" Logic ---
// This function does exactly what your debug script did
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

            // A chunk of data has been received.
            res.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject('Failed to parse JSON');
                    }
                } else {
                    // If Riot says no, pass the error code back
                    reject({ status: res.statusCode, message: res.statusMessage });
                }
            });

        }).on('error', (err) => {
            reject(err);
        });
    });
}

// --- THE ENDPOINT ---
app.get('/api/matches/:gameName/:tagLine', async (req, res) => {
    const { gameName, tagLine } = req.params;
    console.log(`\n--- NEW REQUEST: ${gameName} #${tagLine} ---`);

    try {
        // 1. ACCOUNT LOOKUP
        // SEA accounts are in the 'asia' cluster for ID lookups
        let accountCluster = (MATCH_REGION === 'sea') ? 'asia' : MATCH_REGION;
        
        console.log(`1. Fetching PUUID...`);
        const accountUrl = `https://${accountCluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
        
        const accountData = await riotRequest(accountUrl);
        const puuid = accountData.puuid;
        console.log(`   SUCCESS! Got PUUID.`);

        // 2. MATCH IDs
        console.log(`2. Fetching Match IDs...`);
        const matchesUrl = `https://${MATCH_REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=5`;
        const matchIds = await riotRequest(matchesUrl);
        console.log(`   SUCCESS! Found ${matchIds.length} matches.`);

        // 3. MATCH DETAILS
        console.log(`3. Fetching Game Details...`);
        // We fetch these one by one to avoid overwhelming the native module
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
                console.error(`   Failed to load match ${matchId}:`, err);
            }
        }

        console.log("4. Sending data to frontend.");
        res.json(cleanedMatches);

    } catch (error) {
        console.error("!!! ERROR !!!", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));