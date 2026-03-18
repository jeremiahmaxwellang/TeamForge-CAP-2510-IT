const db = require('../config/database');

// 1. Fetch Player List
exports.getPlayerList = async (req, res) => {
    try {
        const query = `
            SELECT u.userId, p.gameName, u.firstname, u.lastname, p.currentRank, p.peakRank,
                   r1.displayedRole AS primaryRole, 
                   r2.displayedRole AS secondaryRole
            FROM users u 
            JOIN players p ON u.userId = p.userId 
            JOIN leagueRoles r1 ON p.primaryRoleId = r1.roleId 
            LEFT JOIN leagueRoles r2 ON p.secondaryRoleId = r2.roleId 
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
        // Gets the scrim details, the Win/Loss result, and groups the player names into one string
        const query = `
            SELECT s.scrimId, s.name, s.date, s.length, s.videoLink, MAX(sp.win) as result, 
            GROUP_CONCAT(p.gameName SEPARATOR ', ') as teamMembers 
            FROM scrims s 
            JOIN scrimPlayers sp ON s.scrimId = sp.scrimId 
            JOIN players p ON sp.playerId = p.userId 
            GROUP BY s.scrimId 
            ORDER BY s.date DESC 
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
exports.getDraft = async (req, res) => {
    try {
        const query = `
            SELECT u.userId, p.gameName, u.firstname, u.lastname, r.displayedRole 
            FROM users u 
            JOIN players p ON u.userId = p.userId 
            JOIN leagueRoles r ON p.primaryRoleId = r.roleId 
            WHERE u.position = 'Player' AND u.status = 'Active' AND p.isSub = 'F'
            ORDER BY r.roleId ASC
        `;
        const [draft] = await db.query(query);
        
        // Ensure we only send one player per role to avoid duplicates if data is messy
        const mainRoster = [];
        const seenRoles = new Set();
        
        draft.forEach(player => {
            if (!seenRoles.has(player.displayedRole)) {
                seenRoles.add(player.displayedRole);
                mainRoster.push(player);
            }
        });

        res.status(200).json({ success: true, draft: mainRoster });
    } catch (error) {
        console.error('Error fetching draft:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch draft.' });
    }
};

// 4. Fetch Team Statistics (Last 15 Games Winrate)
exports.getTeamStats = async (req, res) => {
    try {
        const query = `
            SELECT mp.win 
            FROM matches m
            JOIN matchParticipants mp ON m.matchId = mp.matchId
            JOIN players p ON m.userId = p.userId AND p.puuid = mp.puuid
            JOIN users u ON p.userId = u.userId
            WHERE u.position = 'Player' AND u.status = 'Active'
            ORDER BY m.gameCreation DESC
            LIMIT 15
        `;
        const [recentGames] = await db.query(query);
        
        if (recentGames.length === 0) {
            return res.status(200).json({ success: true, winrate: 0, totalGames: 0 });
        }

        // The Riot API usually returns 'True'/'False' strings or booleans for the win column
        const wins = recentGames.filter(g => g.win === 'True' || g.win === 'true' || g.win === 1 || g.win === true).length;
        const winrate = ((wins / recentGames.length) * 100).toFixed(1);

        res.status(200).json({ success: true, winrate: winrate, totalGames: recentGames.length });
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