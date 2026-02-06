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