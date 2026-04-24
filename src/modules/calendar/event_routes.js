const express = require('express');
const router = express.Router();
const mySqlPool = require('../../config/database');

// GET all events
router.get('/', async (req, res) => {
    try {
        const [rows] = await mySqlPool.query('SELECT * FROM events');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET single event by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await mySqlPool.query('SELECT * FROM events WHERE eventId = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching event:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// CREATE new event
router.post('/', async (req, res) => {
    try {
        const {
            title_summary, creator_id, type, location,
            start_date, start_datetime, start_timezone,
            end_date, end_datetime, end_timezone,
            videoLink, length, win, status
        } = req.body;

        const [result] = await mySqlPool.query(
            `INSERT INTO events 
            (title_summary, creator_id, type, location, start_date, start_datetime, start_timezone, 
             end_date, end_datetime, end_timezone, videoLink, length, win, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title_summary, creator_id, type, location, start_date, start_datetime, start_timezone,
             end_date, end_datetime, end_timezone, videoLink, length, win, status]
        );

        res.status(201).json({ message: 'Event created', eventId: result.insertId });
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// UPDATE event
router.put('/:id', async (req, res) => {
    try {
        const {
            title_summary, creator_id, type, location,
            start_date, start_datetime, start_timezone,
            end_date, end_datetime, end_timezone,
            videoLink, length, win, status
        } = req.body;

        const [result] = await mySqlPool.query(
            `UPDATE events SET 
            title_summary=?, creator_id=?, type=?, location=?, start_date=?, start_datetime=?, start_timezone=?, 
            end_date=?, end_datetime=?, end_timezone=?, videoLink=?, length=?, win=?, status=? 
            WHERE eventId=?`,
            [title_summary, creator_id, type, location, start_date, start_datetime, start_timezone,
             end_date, end_datetime, end_timezone, videoLink, length, win, status, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Event not found' });
        res.json({ message: 'Event updated' });
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE event
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await mySqlPool.query('DELETE FROM events WHERE eventId = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Event not found' });
        res.json({ message: 'Event deleted' });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
