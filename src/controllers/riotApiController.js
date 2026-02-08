/**
 * RIOT API CONTROLLER
 * - Backend for using Riot API
 */

// Required path because .env is not in the same folder
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const apiKey = process.env.API_KEY;
const db = require('../config/database');
// console.log(apiKey);

// FETCH PUUID of a player
async function fetchPuuidByName(gameName, tagLine){
    const cluster = 'asia';
    const url = `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

    const response = await fetch(url, {
        headers: {
            'X-Riot-Token': apiKey,
            'User-Agent': 'NodeJS-Server'
        }
    });

    if(!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.puuid;
}

// getPuuid is called in riotApiRoutes to connect the backend
exports.getPuuid = async (req, res) => {
    try {
        const { gameName, tagLine } = req.params;
        const puuid = await fetchPuuidByName(gameName, tagLine);
        res.json({ puuid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// FETCH recent matches for a player by PUUID and queue ID
async function fetchRecentMatches(puuid, queueId, start = 0, count) {
    // Define the region for the API request
    const region = 'sea';

    // URL to fetch matches by PUUID, with query parameters for pagination and queue filtering
    const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids`;

    // Set up the parameters with default values
    const params = new URLSearchParams();
    params.append('start', start);     // Starting index of the match list
    params.append('count', count);     // Count of matches to retrieve (default: 15)

    if (queueId) params.append('queue', queueId);  // Only append queue if it's provided

    // Log the final request URL for debugging
    // console.log(`Fetching matches URL: ${url}?${params.toString()}`);

    // Make the API request to fetch recent matches
    const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
            'X-Riot-Token': apiKey,
            'User-Agent': 'NodeJS-Server'
        }
    });

    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Print out the fetched data to the console
    console.log("Fetched recent matches:", data);
    
    return data;
}

// getRecentMatches is called in riotApiRoutes to fetch player's recent matches by queue ID
exports.getRecentMatches = async (req, res) => {
    try {
        const { puuid, queueId } = req.params;
        // Default start to 0 and count to 15 if not provided in the query
        const { start = 0, count = 15 } = req.query;
        
        // Ensure that count is parsed as an integer
        const matchCount = parseInt(count) || 15;  // Default to 15 if not a valid number
        
        // Call fetchRecentMatches with the correct parameters
        const matches = await fetchRecentMatches(puuid, queueId, parseInt(start), matchCount);
        res.json({ matches });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// FETCH match details by matchId
async function fetchMatchDetails(matchId) {
    // Define the region for the API request
    const region = 'sea';

    // URL to fetch match details by matchId
    const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}`;

    // Log the final request URL for debugging
    console.log(`Fetching match details URL: ${url}`);

    // Make the API request to fetch match details
    const response = await fetch(url, {
        headers: {
            'X-Riot-Token': apiKey,
            'User-Agent': 'NodeJS-Server'
        }
    });

    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Print out the fetched data to the console
    // console.log("Fetched match details:", data);
    
    return data;
}

// getMatchDetails is called in riotApiRoutes to fetch detailed information about a specific match
exports.getMatchDetails = async (req, res) => {
    try {
        const { matchId } = req.params;
        
        // Call fetchMatchDetails with the matchId
        const matchDetails = await fetchMatchDetails(matchId);
        res.json({ matchDetails });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// STORE match details in the database
async function storeMatchDetails(userId, matchData) {
    try {
        // Extract relevant data from the Riot API response
        const matchId = matchData.metadata.matchId;
        
        const gameCreation = matchData.info.gameCreation;
        const gameDuration = matchData.info.gameDuration;
        const gameEndTimestamp = matchData.info.gameEndTimestamp;
        const gameMode = matchData.info.gameMode;
        const gameName = matchData.info.gameName;
        const gameStartTimestamp = matchData.info.gameStartTimestamp;
        const gameType = matchData.info.gameType;
        const gameVersion = matchData.info.gameVersion;

        console.log("Storing match details for gameCreation:", gameCreation);

        // SQL query to insert match details
        const sql = `
            INSERT INTO matches 
            (matchId, userId, gameCreation, gameDuration, gameEndTimestamp, gameMode, gameName, gameStartTimestamp, gameType, gameVersion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            gameDuration = VALUES(gameDuration),
            gameEndTimestamp = VALUES(gameEndTimestamp),
            gameMode = VALUES(gameMode),
            gameName = VALUES(gameName),
            gameStartTimestamp = VALUES(gameStartTimestamp),
            gameType = VALUES(gameType),
            gameVersion = VALUES(gameVersion);
        `;

        const [result] = await db.query(sql, [
            matchId,
            userId,
            gameCreation,
            gameDuration,
            gameEndTimestamp,
            gameMode,
            gameName,
            gameStartTimestamp,
            gameType,
            gameVersion
        ]);

        console.log("Match details stored successfully:", matchId);
        return result;
    } catch (err) {
        console.error("Error storing match details:", err.message);
        throw err;
    }
}

// saveMatchDetails is called via API to store match details
exports.saveMatchDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const matchData = req.body;

        // Validate that required fields exist
        if (!matchData.metadata || !matchData.info) {
            return res.status(400).json({ error: 'Invalid match data format' });
        }

        const result = await storeMatchDetails(userId, matchData);
        res.json({ success: true, message: 'Match details stored successfully', affectedRows: result.affectedRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Bulk store multiple match details
exports.saveMultipleMatches = async (req, res) => {
    try {
        const { userId } = req.params;
        const { matches } = req.body;

        // Validate that matches is an array
        if (!Array.isArray(matches)) {
            return res.status(400).json({ error: 'matches must be an array' });
        }

        // Store all matches and track results
        const results = [];
        const errors = [];

        for (const matchData of matches) {
            try {
                if (!matchData.metadata || !matchData.info) {
                    errors.push({ matchId: matchData?.metadata?.match_id || 'unknown', error: 'Invalid match data format' });
                    continue;
                }
                const result = await storeMatchDetails(userId, matchData);
                results.push({ matchId: matchData.metadata.match_id, success: true });
            } catch (err) {
                errors.push({ matchId: matchData?.metadata?.match_id || 'unknown', error: err.message });
            }
        }

        res.json({
            success: true,
            message: `Stored ${results.length} matches`,
            totalProcessed: matches.length,
            successful: results.length,
            failed: errors.length,
            results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};