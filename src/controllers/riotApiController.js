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
    // console.log(`[FETCH RECENT MATCHES] URL: ${url}?${params.toString()}`);

    // Make the API request to fetch recent matches
    const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
            'X-Riot-Token': apiKey,
            'User-Agent': 'NodeJS-Server'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[FETCH RECENT MATCHES] API Error ${response.status}: ${errorText}`);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Print out the fetched data to the console
    console.log(`[FETCH RECENT MATCHES] ✓ Retrieved ${data.length} match IDs`);
    
    return data;
}

// getRecentMatches is called in riotApiRoutes to fetch player's recent matches by queue ID
exports.getRecentMatches = async (req, res) => {
    try {
        const { puuid, queueId } = req.params;
        // console.log(`[GET RECENT MATCHES] Starting with PUUID: ${puuid}, Queue: ${queueId}`);
        
        // Default start to 0 and count to 15 if not provided in the query
        const { start = 0, count = 15 } = req.query;
        
        // Ensure that count is parsed as an integer
        const matchCount = parseInt(count) || 15;  // Default to 15 if not a valid number
        
        console.log(`[GET RECENT MATCHES] Parameters - start: ${start}, count: ${matchCount}`);
        
        // Call fetchRecentMatches with the correct parameters
        const matches = await fetchRecentMatches(puuid, queueId, parseInt(start), matchCount);
        console.log(`[GET RECENT MATCHES] ✓ Retrieved ${matches.length} matches`);
        res.json({ matches });
    } catch (err) {
        console.error(`[GET RECENT MATCHES] ✗ Error:`, err.message);
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
    // console.log(`Fetching match details URL: ${url}`);

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

        // console.log("Storing match details for gameCreation:", gameCreation);

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

        // console.log("Match details stored successfully:", matchId);
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

// Get winrate for last 15 games for a player by puuid
exports.getWinrate = async (req, res) => {
    try {
        const { puuid } = req.params;

        if (!puuid) {
            return res.status(400).json({ error: 'puuid is required' });
        }

        // Select the player's most recent 15 participant records joined with match timestamps
        const sql = `
            SELECT mp.win, m.gameStartTimestamp, m.gameCreation
            FROM matchParticipants mp
            JOIN matches m ON mp.matchId = m.matchId
            WHERE mp.puuid = ?
            ORDER BY COALESCE(m.gameStartTimestamp, m.gameCreation) DESC
            LIMIT 15
        `;

        const [rows] = await db.query(sql, [puuid]);

        const total = rows.length;
        if (total === 0) {
            return res.json({ total: 0, wins: 0, losses: 0, winrate: 0 });
        }

        const wins = rows.reduce((acc, r) => {
            const w = (r.win === 'W' || r.win === 'w' || r.win === 1 || r.win === '1') ? 1 : 0;
            return acc + w;
        }, 0);

        const losses = total - wins;
        const winrate = Number(((wins / total) * 100).toFixed(1));

        res.json({ total, wins, losses, winrate });

        console.log(`[Win Rate] Calculated winrate for puuid: ${winrate}% (${wins}W/${losses}L)`);
    } catch (err) {
        console.error(`[Win Rate] ERROR in getWinrate:`, err.message);
        res.status(500).json({ error: err.message });
    }
};

// ============ MATCH PARTICIPANTS FUNCTIONS ============

// Extract participant data from match details
async function extractParticipantData(matchId, matchData) {
    try {
        // console.log(`[EXTRACT PARTICIPANTS] Extracting participant data for match: ${matchId}`);
        
        if (!matchData.info || !Array.isArray(matchData.info.participants)) {
            throw new Error('Invalid match data structure - missing participants array');
        }

        const { participants, gameDuration } = matchData.info;
        const participantsData = [];

        participants.forEach((participant, index) => {
            // console.log(`[EXTRACT PARTICIPANTS] Processing participant ${index + 1}/${participants.length} - ${participant.riotIdGameName || 'Unknown'}`);
            
            // Calculate per-minute stats
            const minutesDuration = gameDuration / 60;
            const csPerMinute = minutesDuration > 0 ? ((participant.minionsKilled || 0) / minutesDuration).toFixed(2) : 0;
            const goldPerMinute = minutesDuration > 0 ? ((participant.goldEarned || 0) / minutesDuration).toFixed(2) : 0;
            const visionScorePerMinute = minutesDuration > 0 ? ((participant.visionScore || 0) / minutesDuration).toFixed(3) : 0;

            // Calculate KDA
            const kills = participant.kills || 0;
            const deaths = participant.deaths || 0;
            const assists = participant.assists || 0;
            const kda = deaths > 0 ? ((kills + assists) / deaths).toFixed(2) : (kills + assists).toFixed(2);

            // Calculate kill participation if team kills available
            let killParticipation = 0;
            if (participant.challenges && participant.challenges.killParticipation) {
                killParticipation = (participant.challenges.killParticipation * 100).toFixed(2);
            }

            const participantData = {
                matchId,
                participantId: participant.participantId,
                puuid: participant.puuid || null,
                riotIdGameTag: participant.riotIdGameName || null,
                riotIdTagline: participant.riotIdTagline || null,
                queueId: matchData.info.queueId || null,
                assists,
                champLevel: participant.champLevel || null,
                championId: participant.championId || null,
                championName: participant.championName || null,
                creepScore: participant.minionsKilled || 0,
                creepScorePerMinute: csPerMinute,
                damageDealthToBuildings: participant.damageDealtToBuildings || 0,
                deaths,
                dragonKills: participant.dragonKills || 0,
                goldEarned: participant.goldEarned || 0,
                goldPerMinute: goldPerMinute,
                kda,
                kills,
                killParticipation,
                item0: participant.item0 || null,
                item1: participant.item1 || null,
                item2: participant.item2 || null,
                item3: participant.item3 || null,
                item4: participant.item4 || null,
                item5: participant.item5 || null,
                item6: participant.item6 || null,
                neutralMinionsKilled: participant.neutralMinionsKilled || 0,
                role: participant.role || null,
                soloKills: participant.challenges?.soloKills || 0,
                teamId: participant.teamId || null,
                teamPosition: participant.teamPosition || null,
                totalDamageDealt: participant.totalDamageDealt || 0,
                totalDamageTaken: participant.totalDamageTaken || 0,
                totalMinionsKilled: (participant.minionsKilled || 0) + (participant.neutralMinionsKilled || 0),
                visionScore: participant.visionScore || 0,
                visionScorePerMinute: visionScorePerMinute,
                wardsKilled: participant.wardsKilled || 0,
                wardsPlaced: participant.wardsPlaced || 0,
                win: participant.win ? 'W' : 'L',
                teamBaronKills: participant.baronKills || 0,
                teamElderDragonKills: participant.elderDragonKills || 0,
                teamRiftHeraldKills: participant.riftHeraldKills || 0,
                voidMonsterKill: participant.voidMonsterKill ? 1 : 0,
                objectiveRate: participant.challenges?.objectiveSoloKills ? (participant.challenges.objectiveSoloKills).toFixed(2) : 0,
                damageShare: participant.challenges?.damagePerMinute ? (participant.challenges.damagePerMinute).toFixed(2) : 0
            };

            // console.log(`[EXTRACT PARTICIPANTS] Extracted - ${participant.championName} | KDA: ${kda} | CS: ${participant.minionsKilled || 0} | Gold: ${participant.goldEarned || 0}`);
            participantsData.push(participantData);
        });

        // console.log(`[EXTRACT PARTICIPANTS] Successfully extracted ${participantsData.length} participants from match ${matchId}`);
        return participantsData;
    } catch (err) {
        console.error(`[EXTRACT PARTICIPANTS] ERROR extracting participants for match ${matchId}:`, err.message);
        throw err;
    }
}

// Store a single participant to the database
async function storeParticipantDetails(participantData) {
    try {
        // console.log(`[STORE PARTICIPANT] Storing participant ${participantData.participantId} from match ${participantData.matchId} - ${participantData.championName}`);
        
        const sql = `
            INSERT INTO matchParticipants 
            (matchId, participantId, puuid, riotIdGameTag, riotIdTagline, queueId, assists, champLevel, championId, championName, 
             creepScore, creepScorePerMinute, damageDealthToBuildings, deaths, dragonKills, goldEarned, goldPerMinute, kda, 
             kills, killParticipation, item0, item1, item2, item3, item4, item5, item6, neutralMinionsKilled, role, soloKills, 
             teamId, teamPosition, totalDamageDealt, totalDamageTaken, totalMinionsKilled, visionScore, visionScorePerMinute, 
             wardsKilled, wardsPlaced, win, teamBaronKills, teamElderDragonKills, teamRiftHeraldKills, voidMonsterKill, 
             objectiveRate, damageShare)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            puuid = VALUES(puuid),
            riotIdGameTag = VALUES(riotIdGameTag),
            riotIdTagline = VALUES(riotIdTagline),
            assists = VALUES(assists),
            champLevel = VALUES(champLevel),
            creepScore = VALUES(creepScore),
            creepScorePerMinute = VALUES(creepScorePerMinute),
            damageDealthToBuildings = VALUES(damageDealthToBuildings),
            deaths = VALUES(deaths),
            dragonKills = VALUES(dragonKills),
            goldEarned = VALUES(goldEarned),
            goldPerMinute = VALUES(goldPerMinute),
            kda = VALUES(kda),
            kills = VALUES(kills),
            killParticipation = VALUES(killParticipation),
            item0 = VALUES(item0),
            item1 = VALUES(item1),
            item2 = VALUES(item2),
            item3 = VALUES(item3),
            item4 = VALUES(item4),
            item5 = VALUES(item5),
            item6 = VALUES(item6),
            neutralMinionsKilled = VALUES(neutralMinionsKilled),
            role = VALUES(role),
            soloKills = VALUES(soloKills),
            teamPosition = VALUES(teamPosition),
            totalDamageDealt = VALUES(totalDamageDealt),
            totalDamageTaken = VALUES(totalDamageTaken),
            totalMinionsKilled = VALUES(totalMinionsKilled),
            visionScore = VALUES(visionScore),
            visionScorePerMinute = VALUES(visionScorePerMinute),
            wardsKilled = VALUES(wardsKilled),
            wardsPlaced = VALUES(wardsPlaced),
            win = VALUES(win),
            teamBaronKills = VALUES(teamBaronKills),
            teamElderDragonKills = VALUES(teamElderDragonKills),
            teamRiftHeraldKills = VALUES(teamRiftHeraldKills),
            voidMonsterKill = VALUES(voidMonsterKill),
            objectiveRate = VALUES(objectiveRate),
            damageShare = VALUES(damageShare);
        `;

        const values = [
            participantData.matchId,
            participantData.participantId,
            participantData.puuid,
            participantData.riotIdGameTag,
            participantData.riotIdTagline,
            participantData.queueId,
            participantData.assists,
            participantData.champLevel,
            participantData.championId,
            participantData.championName,
            participantData.creepScore,
            participantData.creepScorePerMinute,
            participantData.damageDealthToBuildings,
            participantData.deaths,
            participantData.dragonKills,
            participantData.goldEarned,
            participantData.goldPerMinute,
            participantData.kda,
            participantData.kills,
            participantData.killParticipation,
            participantData.item0,
            participantData.item1,
            participantData.item2,
            participantData.item3,
            participantData.item4,
            participantData.item5,
            participantData.item6,
            participantData.neutralMinionsKilled,
            participantData.role,
            participantData.soloKills,
            participantData.teamId,
            participantData.teamPosition,
            participantData.totalDamageDealt,
            participantData.totalDamageTaken,
            participantData.totalMinionsKilled,
            participantData.visionScore,
            participantData.visionScorePerMinute,
            participantData.wardsKilled,
            participantData.wardsPlaced,
            participantData.win,
            participantData.teamBaronKills,
            participantData.teamElderDragonKills,
            participantData.teamRiftHeraldKills,
            participantData.voidMonsterKill,
            participantData.objectiveRate,
            participantData.damageShare
        ];

        const [result] = await db.query(sql, values);
        
        // console.log(`[STORE PARTICIPANT] ✓ Successfully stored participant ${participantData.participantId} from match ${participantData.matchId}`);
        return result;
    } catch (err) {
        console.error(`[STORE PARTICIPANT] ✗ ERROR storing participant ${participantData.participantId}:`, err.message);
        throw err;
    }
}

// Store participants from a single match
exports.saveMatchParticipants = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { matchData } = req.body;

        // console.log(`[API] saveMatchParticipants called for match: ${matchId}`);

        // Validate match data
        if (!matchData || !matchData.info) {
            console.warn(`[API] Invalid match data format for match ${matchId}`);
            return res.status(400).json({ error: 'Invalid match data format' });
        }

        // Extract participant data
        const participantsData = await extractParticipantData(matchId, matchData);

        // Store all participants
        const results = [];
        const errors = [];

        for (const participantData of participantsData) {
            try {
                await storeParticipantDetails(participantData);
                results.push({ participantId: participantData.participantId, championName: participantData.championName, success: true });
            } catch (err) {
                errors.push({ participantId: participantData.participantId, championName: participantData.championName, error: err.message });
                console.error(`[API] Failed to store participant ${participantData.participantId}:`, err.message);
            }
        }

        console.log(`[API] Match ${matchId}: Stored ${results.length}/${participantsData.length} participants`);

        res.json({
            success: true,
            message: `Stored participants from match ${matchId}`,
            matchId,
            totalParticipants: participantsData.length,
            successful: results.length,
            failed: errors.length,
            results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (err) {
        console.error(`[API] ERROR in saveMatchParticipants:`, err.message);
        res.status(500).json({ error: err.message });
    }
};

// Batch upload participants from multiple matches
exports.saveMultipleMatchParticipants = async (req, res) => {
    try {
        const { matches } = req.body;

        console.log(`[API] saveMultipleMatchParticipants called with ${matches.length} matches`);

        // Validate input
        if (!Array.isArray(matches)) {
            console.warn(`[API] Invalid input - matches must be an array`);
            return res.status(400).json({ error: 'matches must be an array' });
        }

        const results = [];
        const errors = [];
        let totalParticipants = 0;
        let storedParticipants = 0;
        let failedParticipants = 0;

        for (const match of matches) {
            try {
                const { matchId, matchData } = match;
                console.log(`[BATCH] Processing match: ${matchId}`);

                if (!matchData || !matchData.info) {
                    errors.push({ matchId, error: 'Invalid match data format' });
                    console.warn(`[BATCH] Skipping invalid match data for ${matchId}`);
                    continue;
                }

                // Extract participants from match
                const participantsData = await extractParticipantData(matchId, matchData);
                totalParticipants += participantsData.length;

                // Store each participant
                const matchResults = [];
                for (const participantData of participantsData) {
                    try {
                        await storeParticipantDetails(participantData);
                        matchResults.push({ participantId: participantData.participantId, success: true });
                        storedParticipants++;
                    } catch (err) {
                        matchResults.push({ participantId: participantData.participantId, success: false, error: err.message });
                        failedParticipants++;
                        console.error(`[BATCH] Failed to store participant in match ${matchId}:`, err.message);
                    }
                }

                results.push({
                    matchId,
                    participantsProcessed: participantsData.length,
                    participantsStored: matchResults.filter(p => p.success).length,
                    participantsFailed: matchResults.filter(p => !p.success).length,
                    details: matchResults
                });

                console.log(`[BATCH] ✓ Match ${matchId}: Stored ${matchResults.filter(p => p.success).length}/${participantsData.length} participants`);
            } catch (err) {
                errors.push({ matchId: match?.matchId || 'unknown', error: err.message });
                console.error(`[BATCH] ERROR processing match:`, err.message);
            }
        }

        console.log(`[API] Batch upload complete: ${storedParticipants}/${totalParticipants} participants stored`);

        res.json({
            success: true,
            message: `Batch uploaded participants from ${matches.length} matches`,
            totalMatches: matches.length,
            totalParticipants,
            successfulParticipants: storedParticipants,
            failedParticipants,
            results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (err) {
        console.error(`[API] ERROR in saveMultipleMatchParticipants:`, err.message);
        res.status(500).json({ error: err.message });
    }
};

