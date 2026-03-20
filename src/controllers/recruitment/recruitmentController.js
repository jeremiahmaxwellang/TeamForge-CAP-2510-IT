const mySqlPool = require('../../config/database');

// Gets application period if it is currently the Application Period
exports.getApplicationPeriod = async (req, res) => {
    try {
        const getApplicationPeriod =`
            SELECT *
            FROM application_periods
            WHERE CURDATE() BETWEEN startDate AND endDate
            LIMIT 1
        `;
        
        const [rows] = await mySqlPool.query(getApplicationPeriod);

        if (rows.length === 0) {
            return res.json({ message: 'No active recruitment period' });
        }

        res.status(201).json({
            message: 'Application period fetched successfully',
            applicationPeriod: rows[0]
        });
    } catch (error) {
        console.error('Error fetching:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch application period.' });
    }
};