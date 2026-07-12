const db = require('../config/database');

// 1. Fetch Player List
exports.getPlayerList = async (req, res) => {
    try {
        const query = `
            SELECT u.userId, p.gameName, u.firstname, u.lastname, p.currentRank AS currentRank, p.peakRank AS peakRank,
                   r1.displayedRole AS primaryRole, 
                   r2.displayedRole AS secondaryRole
            FROM users u 
            JOIN players p ON u.userId = p.userId 
            JOIN leagueroles r1 ON p.primaryRoleId = r1.roleId 
            LEFT JOIN leagueroles r2 ON p.secondaryRoleId = r2.roleId 
            WHERE u.position = 'Player' AND u.status = 'Active' 
            ORDER BY r1.roleId ASC
        `;
        const [players] = await db.query(query);
        res.status(200).json({ success: true, players });
    } catch (error) {
        console.error('Error fetching player list:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch players.' });
    }
};

// 2. Fetch Latest Scrims
exports.getLatestScrims = async (req, res) => {
    try {
        // Added IFNULL and DATE_FORMAT to cleanly pull the start time component
        const query = `
            SELECT
                e.eventId AS scrimId,
                e.title_summary AS name,
                COALESCE(e.start_datetime, e.start_date) AS date,
                IFNULL(DATE_FORMAT(e.start_datetime, '%l:%i %p'), 'N/A') AS startTime,
                e.length,
                e.videoLink,
                CASE
                    WHEN SUM(ea.win = 'W') > 0 THEN 'W'
                    WHEN SUM(ea.win = 'L') > 0 THEN 'L'
                    ELSE 'N/A'
                END AS result,
                GROUP_CONCAT(DISTINCT p.gameName SEPARATOR ', ') AS teamMembers
            FROM events e
            JOIN event_attendees ea ON e.eventId = ea.eventId
            JOIN players p ON ea.userId = p.userId
            WHERE e.type = 'Scrim'
            GROUP BY e.eventId, e.title_summary, e.start_datetime, e.start_date, e.length, e.videoLink
            ORDER BY date DESC
            LIMIT 3
        `;
        const [scrims] = await db.query(query);
        res.status(200).json({ success: true, scrims });
    } catch (error) {
        console.error('Error fetching scrims:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch scrims.' });
    }
};

// 3. Fetch Tournament Draft (Main Roster)
// Fetch the roster draft for the nearest upcoming tournament
exports.getDraft = async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');

        // Get the nearest tournament scheduled for today or later
        const [tournamentRows] = await db.query(`
            SELECT
                e.eventId,
                e.title_summary AS tournamentName,
                DATE_FORMAT(
                    COALESCE(e.start_date, DATE(e.start_datetime)),
                    '%Y-%m-%d'
                ) AS tournamentDate
            FROM events e
            WHERE e.type = 'Tournament'
              AND COALESCE(e.start_date, DATE(e.start_datetime)) >= CURDATE()
            ORDER BY
                COALESCE(e.start_date, DATE(e.start_datetime)) ASC,
                e.eventId ASC
            LIMIT 1
        `);

        if (tournamentRows.length === 0) {
            return res.status(200).json({
                success: true,
                tournament: null,
                draft: []
            });
        }

        const tournament = tournamentRows[0];

        // Get Team 1's main roster for that specific tournament
        const [draft] = await db.query(`
            SELECT
                u.userId,
                p.gameName,
                u.firstname,
                u.lastname,
                r.displayedRole,
                ea.team,
                ea.is_sub AS isSub
            FROM event_attendees ea
            JOIN users u
                ON u.userId = ea.userId
            JOIN players p
                ON p.userId = ea.userId
            JOIN leagueroles r
                ON r.roleId = ea.player_role
            WHERE ea.eventId = ?
              AND ea.team = 'Team 1'
              AND ea.is_sub = 'N'
            ORDER BY ea.player_role ASC
        `, [tournament.eventId]);

        return res.status(200).json({
            success: true,
            tournament,
            draft
        });
    } catch (error) {
        console.error('Error fetching upcoming tournament draft:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch upcoming tournament draft.'
        });
    }
};

// 4. Fetch Team Statistics (Last 15 Games Winrate)
exports.getTeamStats = async (req, res) => {
    try {
        // 1. Get all active players
        const allPlayersQuery = `
            SELECT p.userId, p.puuid
            FROM players p
            JOIN users u ON p.userId = u.userId
            WHERE u.position = 'Player' AND u.status = 'Active'
        `;
        const [allPlayers] = await db.query(allPlayersQuery);
        if (!allPlayers.length) {
            return res.status(200).json({ success: true, winrate: 0, totalGames: 0, avgKDA: 0, scrimsThisMonth: 0 });
        }
        const puuidList = allPlayers.map(p => `'${p.puuid}'`).join(",");

        // 2. Calculate average winrate for all players (last 15 matches per player)
        let totalGames = 0;
        let totalWins = 0;
        let allKdaVals = [];

        for (const player of allPlayers) {
            // Get last 15 matches for this player
            const playerMatchesQuery = `
                SELECT win, kda
                FROM matchparticipants
                WHERE puuid = ?
                ORDER BY matchId DESC
                LIMIT 15
            `;
            const [matches] = await db.query(playerMatchesQuery, [player.puuid]);
            totalGames += matches.length;
            totalWins += matches.filter(m => m.win === 'W' || m.win === 'w').length;
            // Collect KDA values
            allKdaVals = allKdaVals.concat(matches.map(m => parseFloat(m.kda)).filter(kda => !isNaN(kda)));
        }
        
        const winrate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
        console.log(`Total Games: ${totalGames}, Total Wins: ${totalWins}, Winrate: ${winrate.toFixed(2)}%`);
        const avgKDA = allKdaVals.length > 0 ? (allKdaVals.reduce((a, b) => a + b, 0) / allKdaVals.length).toFixed(2) : 0;

        // 3. Get number of scrims played this month
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const firstDay = `${year}-${month}-01`;
        const nextMonth = now.getMonth() === 11 ? `${year + 1}-01-01` : `${year}-${String(now.getMonth() + 2).padStart(2, '0')}-01`;
        const scrimsQuery = `
            SELECT COUNT(*) AS scrimsThisMonth
            FROM events
            WHERE type = 'Scrim'
              AND start_date >= ?
              AND start_date < ?
        `;
        const [scrimsResult] = await db.query(scrimsQuery, [firstDay, nextMonth]);
        const scrimsThisMonth = scrimsResult[0]?.scrimsThisMonth || 0;

        res.status(200).json({
            success: true,
            winrate,
            totalGames,
            avgKDA,
            scrimsThisMonth
        });
    } catch (error) {
        console.error('Error fetching team stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch team stats.' });
    }
};

// 5. Fetch Announcements (Read-Only for Coach)
exports.getAnnouncements = async (req, res) => {
    try {
        const query = `
            SELECT a.announcementId, a.title, a.content, a.dateCreated, u.firstname, u.lastname
            FROM announcements a
            JOIN users u ON a.userId = u.userId
            ORDER BY a.dateCreated DESC
        `;
        // Note: Make sure to use 'db.query' or 'mySqlPool.query' depending on what you named it at the top of the file!
        const [announcements] = await db.query(query);
        res.status(200).json({ success: true, announcements });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch announcements.' });
    }
};