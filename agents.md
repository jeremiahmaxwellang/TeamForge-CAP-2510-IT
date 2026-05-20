# TeamForge Project Overview

## Project Name
TeamForge

## Description
TeamForge is a Decision Support System for collegiate League of Legends esports teams. It provides role-based access for Team Managers, Team Coaches, and Players, and includes features for user registration, recruitment, attendance tracking, announcements, calendar events, reports, team management, tournament operations, and player analysis.

## Main Technology Stack
- Node.js (CommonJS)
- Express.js
- Handlebars (`hbs`) for server-side views
- MySQL / MySQL2 database connectivity
- Google APIs integration via `googleapis`
- File uploads via `express-fileupload`
- Session/cookie handling via `express-session` and `cookie-parser`

## Key Components

### Server Entry
- `src/index.js`
  - Configures Express, middleware, static assets, route authorization, and application routes.
  - Uses custom role-based middleware: `requireRole`, `requireAnyRole`, and `requireCoachRole`.

### Configuration
- `src/config/database.js`
  - Database connection pooling with MySQL.

### Routes
- `routes/` contains authentication, recruitment, registration, player analysis, Riot API, team management, and other application routes.

### Controllers
- `src/controllers/` contains business logic for dashboards, player data, registration, Riot API integration, user settings, team management, and more.

### Modules
- `src/modules/` includes functional modules for announcements, attendance, calendar, recruitment, and other core features.

### Views and Public Assets
- `views/` contains server-rendered HTML templates.
- `public/` contains CSS, JavaScript, images, and uploads used by the web app.

## Primary User Roles
- Team Manager
- Team Coach
- Player
- Applicant

## Main Features
- Authentication and role-based access control
- Applicant registration and recruitment workflows
- Coach and manager dashboards
- Team management tools
- Tournament tracking and management
- Attendance and schedule/calendar features
- Announcement and reporting interfaces
- Player analysis and Riot API integration
- User profile and settings management

## Setup Summary
1. Install Node.js v24 or higher.
2. Install MySQL Server and Workbench.
3. Create a `.env` file in `src/` with database and API credentials.
4. Install project dependencies with `npm install`.
5. Run the server from the project root with `node src/index.js`.

## Important Files
- `README.md` — project description and installation notes
- `package.json` — dependencies and scripts
- `src/index.js` — Express server configuration and routes
- `src/config/database.js` — database connection
- `views/` — HTML templates for pages
- `public/` — static frontend assets
- `database/insert.sql` — sample SQL data insertion scripts

## Notes
- The app uses cookies for role and user session handling.
- Google OAuth is referenced, but some routes appear commented out.
- The project currently listens on port `3000` by default.
