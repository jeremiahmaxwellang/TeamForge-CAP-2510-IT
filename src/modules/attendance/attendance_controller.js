const db = require('../../config/database');

// 1. Serve the HTML page
exports.getAttendancePage = (req, res) => {
    res.sendFile('attendance.html', { root: './src/modules/attendance' });
};

// 2. Get attendance events from the database
exports.getAttendanceEvents = async (req, res) => {
    try {
        const [events] = await db.query(`
            SELECT 
                eventId,
                title_summary,
                type,
                DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
                DATE_FORMAT(start_datetime, '%Y-%m-%d %H:%i:%s') AS start_datetime,
                DATE_FORMAT(end_datetime, '%Y-%m-%d %H:%i:%s') AS end_datetime,
                location,
                videoLink,
                win,
                status
            FROM events
            ORDER BY start_datetime ASC
        `);

        res.json(events);
    } catch (error) {
        console.error('[ATTENDANCE] Error fetching events:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 3. Get participants for a selected event
exports.getEventParticipants = async (req, res) => {
    try {
        const eventId = req.params.id;
        const [participants] = await db.query(`
            SELECT 
                ea.userId,
                CONCAT(u.firstname, ' ', u.lastname) AS name,
                u.position,
                lr.displayedRole AS displayedRole,
                ea.attendance_status,
                ea.notes,
                ea.is_sub,
                ea.team
            FROM event_attendees ea
            JOIN users u ON ea.userId = u.userId
            LEFT JOIN leagueroles lr ON ea.player_role = lr.roleId
            WHERE ea.eventId = ?
            ORDER BY ea.is_sub ASC, lr.roleId ASC, u.firstname ASC
        `, [eventId]);

        res.json(participants);
    } catch (error) {
        console.error('[ATTENDANCE] Error fetching event participants:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};