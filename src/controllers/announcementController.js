const mySqlPool = require('../config/database'); // Adjust path to your DB connection file
const { Resend } = require('resend'); // Import Resend

// 1. Serve the HTML page
exports.getAnnouncementsPage = (req, res) => {
    res.sendFile('announcements.html', { root: './views' }); // Adjust root if your html is somewhere else
};

// 2. Fetch all announcements from the database
exports.getAllAnnouncements = async (req, res) => {
    try {
        // We JOIN with users to get the author's first and last name
        const query = `
            SELECT 
                a.announcementId, 
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
        res.status(200).json({ success: true, announcements: rows });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch announcements.' });
    }
};

// 3. Create a new announcement (with Discord & Resend Email integration!)
exports.createAnnouncement = async (req, res) => {
    try {
        const { userId, title, content } = req.body;

        if (!userId || !title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required.' });
        }

        // 1. Save to Database
        const insertQuery = `
            INSERT INTO announcements (userId, title, content, dateCreated) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `;
        await mySqlPool.query(insertQuery, [userId, title, content]);

        // 2. Fetch Author Name and Active User Emails
        const [[author]] = await mySqlPool.query('SELECT firstname, lastname FROM users WHERE userId = ?', [userId]);
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

        // 4. FIRE RESEND EMAIL BLAST (Runs in background)
        if (process.env.RESEND_API_KEY && emailList.length > 0) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            
            resend.emails.send({
                from: 'TeamForge Announcements <onboarding@resend.dev>', // Resend's free testing domain
                bcc: emailList, // Hides emails from each other
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
            }).catch(err => console.error("Resend Email Error:", err));
        }

        res.status(200).json({ success: true, message: 'Announcement posted and notifications sent!' });
        
    } catch (error) {
        console.error('Error posting announcement:', error);
        res.status(500).json({ success: false, message: 'Failed to post announcement.' });
    }
};