const db = require('../../config/database');

// Create Event Logic
exports.createEvent = async (req, res) => {
    try {
        const { 
            title_summary, 
            type, 
            location, 
            start_date, 
            start_datetime, 
            start_timezone, 
            end_date, 
            end_datetime, 
            end_timezone,
            videoLink,
            length,
            win,
            status 
        } = req.body;
        
        // Grab the user ID from the cookies to know who made it
        const creator_id = req.cookies && req.cookies.userId ? req.cookies.userId : null;

        // Basic validation matching the NOT NULL constraints in your DB
        if (!title_summary || !type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Title and Event Type are required.' 
            });
        }

        // Insert into the database using your exact schema columns
        const query = `
            INSERT INTO events (
                title_summary, creator_id, type, location, 
                start_date, start_datetime, start_timezone, 
                end_date, end_datetime, end_timezone, 
                videoLink, length, win, status
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.query(query, [
            title_summary,
            creator_id,
            type,
            location || null,
            start_date || null,
            start_datetime || null,
            start_timezone || null,
            end_date || null,
            end_datetime || null,
            end_timezone || null,
            videoLink || null,
            length || null,
            win || 'N/A',
            status || null
        ]);

        res.status(201).json({ 
            success: true, 
            message: 'Event created successfully!', 
            eventId: result.insertId 
        });

    } catch (error) {
        console.error('[CALENDAR] Error creating event:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create event in the database.' 
        });
    }
};