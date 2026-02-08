/**
 * RIOT API CONTROLLER
 * - Backend for using Riot API
 */

// Required path because .env is not in the same folder
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const apiKey = process.env.API_KEY;
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
async function fetchRecentMatches(puuid, queueId, start = 0, count = 15) {
    // Define the region for the API request
    const region = 'sea';

    // URL  to fetch matches by PUUID, with query parameters for pagination and queue filtering
    const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids`;

    const params = new URLSearchParams();
    params.append('start', start);
    params.append('count', count);
    if (queueId) params.append('queue', queueId);

    // log the final request URL for debugging
    console.log(`Fetching matches URL: ${url}?${params.toString()}`);

    const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
            'X-Riot-Token': apiKey,
            'User-Agent': 'NodeJS-Server'
        }
    });

    if(!response.ok) {
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
        const { start = 0, count = 20 } = req.query;
        const matches = await fetchRecentMatches(puuid, queueId, parseInt(start), parseInt(count));
        res.json({ matches });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};