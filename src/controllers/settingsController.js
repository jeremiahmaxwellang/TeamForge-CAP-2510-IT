const db = require('../config/database');

// 1. Fetch Benchmarks for a specific Role
exports.getBenchmarksByRole = async (req, res) => {
    try {
        const roleId = req.params.roleId;

        // Fetch all metrics assigned to this role, and LEFT JOIN any existing benchmark values
        const query = `
            SELECT m.metricId, m.metricName, m.metricDescription, 
                   b.benchmarkValue, b.comparator
            FROM metricRoles mr
            JOIN metrics m ON mr.metricId = m.metricId
            LEFT JOIN benchmarks b ON m.metricId = b.metricId AND b.roleId = ?
            WHERE mr.roleId = ?
            ORDER BY m.metricName ASC
        `;
        
        const [benchmarks] = await db.query(query, [roleId, roleId]);
        res.status(200).json({ success: true, benchmarks });
    } catch (error) {
        console.error('Error fetching benchmarks:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch benchmarks.' });
    }
};

// 2. Save/Update Benchmarks
exports.updateBenchmarks = async (req, res) => {
    try {
        const { roleId, updates } = req.body; // updates is an array of { metricId, comparator, value }

        if (!roleId || !updates || !Array.isArray(updates)) {
            return res.status(400).json({ success: false, message: 'Invalid data format.' });
        }

        // Loop through and upsert each benchmark
        for (let update of updates) {
            // First, check if a benchmark already exists for this metric + role combo
            const checkQuery = `SELECT benchmarkId FROM benchmarks WHERE metricId = ? AND roleId = ?`;
            const [existing] = await db.query(checkQuery, [update.metricId, roleId]);

            if (existing.length > 0) {
                // Update existing
                const updateQuery = `UPDATE benchmarks SET comparator = ?, benchmarkValue = ? WHERE benchmarkId = ?`;
                await db.query(updateQuery, [update.comparator, update.value, existing[0].benchmarkId]);
            } else {
                // Insert new
                const insertQuery = `INSERT INTO benchmarks (metricId, roleId, comparator, benchmarkValue) VALUES (?, ?, ?, ?)`;
                await db.query(insertQuery, [update.metricId, roleId, update.comparator, update.value]);
            }
        }

        res.status(200).json({ success: true, message: 'Benchmarks updated successfully!' });
    } catch (error) {
        console.error('Error updating benchmarks:', error);
        res.status(500).json({ success: false, message: 'Failed to update benchmarks.' });
    }
};