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
            ORDER BY start_datetime DESC
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

// 4. Save attendance updates for a selected event
exports.saveEventAttendance = async (req, res) => {
    try {
        const eventId = req.params.id;
        const attendance = Array.isArray(req.body.attendance) ? req.body.attendance : [];

        console.log('[ATTENDANCE] saveEventAttendance called for eventId:', eventId);
        console.log('[ATTENDANCE] Attendance entries received:', attendance.length);
        console.log('[ATTENDANCE] Payload:', JSON.stringify(req.body));

        if (!eventId) {
            console.error('[ATTENDANCE] Event ID is missing');
            return res.status(400).json({ success: false, message: 'Event ID is required' });
        }

        if (attendance.length === 0) {
            console.warn('[ATTENDANCE] No attendance entries provided');
            return res.status(400).json({ success: false, message: 'No attendance entries provided' });
        }

        const connection = await db.getConnection();
        console.log('[ATTENDANCE] Database connection acquired');

        try {
            await connection.beginTransaction();
            console.log('[ATTENDANCE] Transaction started');

            let updatedCount = 0;
            for (const entry of attendance) {
                const { userId, attendance_status, notes } = entry;
                if (!userId) {
                    console.warn('[ATTENDANCE] Skipping entry with missing userId');
                    continue;
                }

                console.log(`[ATTENDANCE] Updating userId=${userId}, eventId=${eventId}, status=${attendance_status}`);
                const [result] = await connection.query(
                    `UPDATE event_attendees SET attendance_status = ?, notes = ? WHERE eventId = ? AND userId = ?`,
                    [attendance_status || null, notes || null, eventId, userId]
                );
                console.log(`[ATTENDANCE] Update result for userId=${userId}: affectedRows=${result.affectedRows}`);
                updatedCount += result.affectedRows;
            }

            await connection.commit();
            console.log(`[ATTENDANCE] Transaction committed. Total updated: ${updatedCount}`);
            res.json({ success: true, message: `Attendance saved successfully (${updatedCount} records updated).` });
        } catch (dbError) {
            console.error('[ATTENDANCE] Database error during transaction:', dbError);
            await connection.rollback();
            console.error('[ATTENDANCE] Transaction rolled back');
            throw dbError;
        } finally {
            connection.release();
            console.log('[ATTENDANCE] Database connection released');
        }
    } catch (error) {
        console.error('[ATTENDANCE] Error saving attendance:', error);
        console.error('[ATTENDANCE] Error stack:', error.stack);
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};