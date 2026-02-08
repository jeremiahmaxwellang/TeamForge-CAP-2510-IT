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
    console.log("Fetched match details:", data);
    
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