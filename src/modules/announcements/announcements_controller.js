const mySqlPool = require('../../config/database');
const nodemailer = require('nodemailer');

// 1. Serve the HTML page
exports.getAnnouncementsPage = (req, res) => {
    res.sendFile('announcements.html', { root: './src/modules/announcements' }); // Adjust root if your html is somewhere else
};

// 2. Fetch all announcements from the database
exports.getAllAnnouncements = async (req, res) => {
    try {
        // We JOIN with users to get the author's first and last name
        const query = `
            SELECT 
                a.announcementId, 
                a.userId AS authorId,
                a.title, 
                a.content, 
                a.dateCreated, 
                u.firstname, 
                u.lastname 
            FROM announcements a
            JOIN users u ON a.userId = u.userId
            ORDER BY a.dateCreated DESC
        `;

        const [rows] = await mySqlPool.query(query);
        const currentUserId = req.cookies && Number.parseInt(req.cookies.userId, 10);
        const announcements = rows.map(row => ({
            ...row,
            isAuthor: Number.isInteger(currentUserId) && currentUserId > 0 && Number.parseInt(row.authorId, 10) === currentUserId
        }));
        res.status(200).json({ success: true, announcements });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch announcements.' });
    }
};

// 3. Create a new announcement (with Discord & Nodemailer Gmail integration!)
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.cookies && req.cookies.userId;
        const userRole = req.cookies && req.cookies.userRole;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not logged in.' });
        }

        if (!['Team Manager', 'Team Coach'].includes(userRole)) {
            return res.status(403).json({ success: false, message: 'Only team managers and team coaches can post announcements.' });
        }

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required.' });
        }

        const parsedUserId = Number.parseInt(userId, 10);
        if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid user session.' });
        }

        // 1. Save to Database
        const insertQuery = `
            INSERT INTO announcements (userId, title, content, dateCreated) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `;
        await mySqlPool.query(insertQuery, [parsedUserId, title, content]);

        // 2. Fetch Author Name and Active User Emails
        const [[author]] = await mySqlPool.query('SELECT firstname, lastname FROM users WHERE userId = ?', [parsedUserId]);
        const authorName = author ? `${author.firstname} ${author.lastname}` : 'Team Manager';
        
        const [users] = await mySqlPool.query('SELECT email FROM users WHERE status = "Active"');
        const emailList = users.map(u => u.email).filter(e => e); 

        // 3. FIRE DISCORD WEBHOOK (Runs in background)
        const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (discordWebhookUrl) {
            const discordPayload = {
                content: "📢 **New TeamForge Announcement!**",
                embeds: [{
                    title: title,
                    description: content,
                    color: 0x00f2c3, 
                    footer: { text: `Posted by ${authorName}` },
                    timestamp: new Date().toISOString()
                }]
            };

            fetch(discordWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(discordPayload)
            }).catch(err => console.error("Discord Webhook Error:", err));
        }

        // 4. FIRE NODEMAILER EMAIL BLAST (Runs in background)
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS && emailList.length > 0) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: `"TeamForge Announcements" <${process.env.EMAIL_USER}>`,
                bcc: emailList, // BCC hides emails from each other
                subject: `TeamForge: ${title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                            <h2 style="color: #333; margin-top: 0;">${title}</h2>
                            <p style="color: #00f2c3; font-weight: bold; font-size: 14px;">Posted by ${authorName}</p>
                            <hr style="border: 1px solid #eee; margin: 20px 0;">
                            <p style="color: #333; font-size: 16px; white-space: pre-wrap; line-height: 1.6;">${content}</p>
                            <br>
                            <p style="font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 15px;">
                                This is an automated message from Viridis Arcus via TeamForge.
                            </p>
                        </div>
                    </div>
                `
            };

            transporter.sendMail(mailOptions).catch(err => console.error("Nodemailer Email Error:", err));
        }

        res.status(200).json({ success: true, message: 'Announcement posted and notifications sent!' });
        
    } catch (error) {
        console.error('Error posting announcement:', error);
        res.status(500).json({ success: false, message: 'Failed to post announcement.' });
    }
};

    // 4. Update an existing announcement
    exports.updateAnnouncement = async (req, res) => {
        try {
            const announcementId = Number.parseInt(req.params.id, 10);
            const { title, content } = req.body;
            const userId = req.cookies && Number.parseInt(req.cookies.userId, 10);

            if (!announcementId || announcementId <= 0) {
                return res.status(400).json({ success: false, message: 'Invalid announcement ID.' });
            }

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Not logged in.' });
            }

            if (!title || !content) {
                return res.status(400).json({ success: false, message: 'Title and content are required.' });
            }

            const [rows] = await mySqlPool.query('SELECT userId FROM announcements WHERE announcementId = ?', [announcementId]);
            if (!rows.length) {
                return res.status(404).json({ success: false, message: 'Announcement not found.' });
            }

            if (Number.parseInt(rows[0].userId, 10) !== userId) {
                return res.status(403).json({ success: false, message: 'You are not authorized to edit this announcement.' });
            }

            await mySqlPool.query(
                'UPDATE announcements SET title = ?, content = ? WHERE announcementId = ?',
                [title, content, announcementId]
            );

            res.status(200).json({ success: true, message: 'Announcement updated successfully.' });
        } catch (error) {
            console.error('Error updating announcement:', error);
            res.status(500).json({ success: false, message: 'Failed to update announcement.' });
        }
    };

    // 5. Delete an announcement
    exports.deleteAnnouncement = async (req, res) => {
        try {
            const announcementId = Number.parseInt(req.params.id, 10);
            const userId = req.cookies && Number.parseInt(req.cookies.userId, 10);

            if (!announcementId || announcementId <= 0) {
                return res.status(400).json({ success: false, message: 'Invalid announcement ID.' });
            }

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Not logged in.' });
            }

            const [rows] = await mySqlPool.query('SELECT userId FROM announcements WHERE announcementId = ?', [announcementId]);
            if (!rows.length) {
                return res.status(404).json({ success: false, message: 'Announcement not found.' });
            }

            if (Number.parseInt(rows[0].userId, 10) !== userId) {
                return res.status(403).json({ success: false, message: 'You are not authorized to delete this announcement.' });
            }

            await mySqlPool.query('DELETE FROM announcements WHERE announcementId = ?', [announcementId]);

            res.status(200).json({ success: true, message: 'Announcement deleted successfully.' });
        } catch (error) {
            console.error('Error deleting announcement:', error);
            res.status(500).json({ success: false, message: 'Failed to delete announcement.' });
        }
    };
