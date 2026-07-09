const mySqlPool = require('../../config/database');
const nodemailer = require('nodemailer');

// 1. Serve the HTML page
exports.getAnnouncementsPage = (req, res) => {
    res.sendFile('announcements.html', { root: './src/modules/announcements' });
};

// 2. Fetch all announcements from the database
exports.getAllAnnouncements = async (req, res) => {
    try {
        const currentUserId = req.cookies && req.cookies.userId ? parseInt(req.cookies.userId, 10) : null;
        
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
        
        // Inject the 'isAuthor' boolean so the frontend knows whether to show the Edit/Delete buttons
        const announcements = rows.map(ann => ({
            ...ann,
            isAuthor: ann.authorId === currentUserId
        }));

        res.status(200).json({ success: true, announcements });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch announcements.' });
    }
};

// 3. Fetch latest announcement from the database
exports.getLatestAnnouncement = async (req, res) => {
    try {
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
            LIMIT 1
        `;

        const [rows] = await mySqlPool.query(query);

        res.status(200).json({ success: true, announcement: rows[0] || null });
    } catch (error) {
        console.error('Error fetching announcement:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch announcement.' });
    }
};

// 3. Create a new announcement
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.cookies && req.cookies.userId;
        const userRole = req.cookies && req.cookies.userRole;

        if (!userId) return res.status(401).json({ success: false, message: 'Not logged in.' });
        if (!['Team Manager', 'Team Coach'].includes(userRole)) return res.status(403).json({ success: false, message: 'Unauthorized.' });
        if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content are required.' });

        const parsedUserId = Number.parseInt(userId, 10);

        // 1. Save to Database
        const insertQuery = `
            INSERT INTO announcements (userId, title, content, dateCreated) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `;
        const [insertResult] = await mySqlPool.query(insertQuery, [parsedUserId, title, content]);
        const announcementId = insertResult.insertId;

        // 2. Fetch Author Name and Active User Emails
        const [[author]] = await mySqlPool.query('SELECT firstname, lastname FROM users WHERE userId = ?', [parsedUserId]);
        const authorName = author ? `${author.firstname} ${author.lastname}` : 'Team Manager';
        
        const [users] = await mySqlPool.query('SELECT email FROM users WHERE status = "Active"');
        const emailList = users.map(u => u.email).filter(e => e); 

        let discordMessageId = null;
        let emailMessageId = null;

        // 3. FIRE DISCORD WEBHOOK (Appends ?wait=true to capture the ID)
        if (process.env.DISCORD_WEBHOOK_URL) {
            const discordBaseUrl = process.env.DISCORD_WEBHOOK_URL.endsWith('/') ? process.env.DISCORD_WEBHOOK_URL.slice(0, -1) : process.env.DISCORD_WEBHOOK_URL;
            
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

            try {
                const response = await fetch(`${discordBaseUrl}?wait=true`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(discordPayload)
                });
                const data = await response.json();
                if (data && data.id) discordMessageId = data.id;
            } catch (err) {
                console.error("Discord Webhook Error:", err);
            }
        }

        // 4. FIRE NODEMAILER EMAIL BLAST (Captures message ID)
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS && emailList.length > 0) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });

            const mailOptions = {
                from: `"TeamForge Announcements" <${process.env.EMAIL_USER}>`,
                bcc: emailList,
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

            try {
                const info = await transporter.sendMail(mailOptions);
                if (info && info.messageId) emailMessageId = info.messageId;
            } catch (err) {
                console.error("Nodemailer Email Error:", err);
            }
        }

        // 5. Save the tracked IDs to the database for future editing
        if (discordMessageId || emailMessageId) {
            await mySqlPool.query(
                'UPDATE announcements SET discordMessageId = ?, emailMessageId = ? WHERE announcementId = ?',
                [discordMessageId, emailMessageId, announcementId]
            );
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
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.cookies && req.cookies.userId;
        const parsedUserId = parseInt(userId, 10);

        if (!userId) return res.status(401).json({ success: false, message: 'Not logged in.' });
        if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content are required.' });

        // Fetch existing announcement
        const [[existing]] = await mySqlPool.query('SELECT * FROM announcements WHERE announcementId = ?', [id]);
        if (!existing) return res.status(404).json({ success: false, message: 'Announcement not found.' });

        // Ensure user is the original author
        if (existing.userId !== parsedUserId) {
            return res.status(403).json({ success: false, message: 'You can only edit your own announcements.' });
        }

        // 1. Update Database
        await mySqlPool.query('UPDATE announcements SET title = ?, content = ? WHERE announcementId = ?', [title, content, id]);

        // 2. Fetch Author Name and Emails
        const [[author]] = await mySqlPool.query('SELECT firstname, lastname FROM users WHERE userId = ?', [parsedUserId]);
        const authorName = author ? `${author.firstname} ${author.lastname}` : 'Team Manager';
        
        const [users] = await mySqlPool.query('SELECT email FROM users WHERE status = "Active"');
        const emailList = users.map(u => u.email).filter(e => e); 

        // 3. EDIT DISCORD MESSAGE
        if (process.env.DISCORD_WEBHOOK_URL && existing.discordMessageId) {
            const discordBaseUrl = process.env.DISCORD_WEBHOOK_URL.endsWith('/') ? process.env.DISCORD_WEBHOOK_URL.slice(0, -1) : process.env.DISCORD_WEBHOOK_URL;
            
            const discordPayload = {
                content: "📢 **[EDITED] TeamForge Announcement!**",
                embeds: [{
                    title: title,
                    description: content,
                    color: 0xfacc15, // Change color to yellow to signify an edit
                    footer: { text: `Edited by ${authorName}` },
                    timestamp: new Date().toISOString()
                }]
            };

            try {
                // To edit a webhook message, we PATCH the message ID
                await fetch(`${discordBaseUrl}/messages/${existing.discordMessageId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(discordPayload)
                });
            } catch (err) {
                console.error("Discord Edit Error:", err);
            }
        }

        // 4. REPLY TO ORIGINAL EMAIL
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS && emailList.length > 0 && existing.emailMessageId) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });

            const editTimestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' });

            const mailOptions = {
                from: `"TeamForge Announcements" <${process.env.EMAIL_USER}>`,
                bcc: emailList,
                subject: `Re: TeamForge: ${existing.title}`, // Prefix Re: to thread it in Gmail
                inReplyTo: existing.emailMessageId,           // Standard email reply header
                references: [existing.emailMessageId],        // Standard email threading header
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                            <h2 style="color: #333; margin-top: 0;">${title} <span style="color:#facc15; font-size:16px;">(Edited)</span></h2>
                            <p style="color: #00f2c3; font-weight: bold; font-size: 14px;">Edited by ${authorName}</p>
                            <p style="color: #888; font-size: 13px;"><em>This is an updated version of the original announcement. (Edited on: ${editTimestamp})</em></p>
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

            try {
                await transporter.sendMail(mailOptions);
                // We do NOT overwrite the emailMessageId in the database here. 
                // This guarantees that if they edit it a 3rd or 4th time, it always replies to the initial email thread!
            } catch (err) {
                console.error("Nodemailer Edit Error:", err);
            }
        }

        res.status(200).json({ success: true, message: 'Announcement updated successfully.' });

    } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({ success: false, message: 'Failed to update announcement.' });
    }
};

// 5. Delete an announcement
exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.cookies && req.cookies.userId;
        const parsedUserId = parseInt(userId, 10);

        if (!userId) return res.status(401).json({ success: false, message: 'Not logged in.' });

        const [[existing]] = await mySqlPool.query('SELECT * FROM announcements WHERE announcementId = ?', [id]);
        if (!existing) return res.status(404).json({ success: false, message: 'Announcement not found.' });

        if (existing.userId !== parsedUserId) {
            return res.status(403).json({ success: false, message: 'You can only delete your own announcements.' });
        }

        // 1. DELETE FROM DISCORD
        if (process.env.DISCORD_WEBHOOK_URL && existing.discordMessageId) {
            const discordBaseUrl = process.env.DISCORD_WEBHOOK_URL.endsWith('/') ? process.env.DISCORD_WEBHOOK_URL.slice(0, -1) : process.env.DISCORD_WEBHOOK_URL;
            try {
                // To delete a webhook message, we DELETE the message ID
                await fetch(`${discordBaseUrl}/messages/${existing.discordMessageId}`, {
                    method: 'DELETE'
                });
            } catch (err) {
                console.error("Discord Delete Error:", err);
            }
        }

        // 2. DELETE FROM DATABASE
        // (You can't "delete" an email out of someone's inbox once sent, so we just scrub the DB and Discord)
        await mySqlPool.query('DELETE FROM announcements WHERE announcementId = ?', [id]);

        res.status(200).json({ success: true, message: 'Announcement deleted successfully.' });

    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ success: false, message: 'Failed to delete announcement.' });
    }
};