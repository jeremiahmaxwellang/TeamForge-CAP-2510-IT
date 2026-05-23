## Description
TeamForge is a Decision Support System for Collegiate League of Legends Esports Teams

## Railway Website
Access TeamForge through Railway at:
[teamforge-cap-2510-it-production.up.railway.app](teamforge-cap-2510-it-production.up.railway.app)

## Features

### For Team Coaches
- View League match histories of players and applicants
- Evaluate and onboard player applicants
- View player availability through the shared Team Calendar
- Draft team lineups for Tournaments

### For Team Managers
- Create and manage user accounts for coaches and players
- Easily send announcements through Discord and email with one click
- Generate reports on recruitment stats and player retention
- Record player attendance in Scrims and Tournaments

### For Players and Applicants
- Sign-in via Google
- View personal profile with game statistics and evaluations from the coach
- Import Google Calendar events into the shared Team Calendar
- Receive email announcements from the manager and coach

## Getting Started

### Dependencies

#### 1. NodeJS v24 or higher
Download here: [https://nodejs.org/en/download](https://nodejs.org/en/download)

[Note] In the installer, make sure to click check on:
```
[] Automatically install the necessary tools
```

NodeJS Installation Tutorial:
[https://www.youtube.com/watch?v=7pbQ4ZKPBiU](https://www.youtube.com/watch?v=7pbQ4ZKPBiU)

#### 2. MySQL Server and Workbench
Download here: [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)

How to Access Railway MySQL Connection: [https://www.youtube.com/watch?v=ALKyFmiFH_4](https://www.youtube.com/watch?v=ALKyFmiFH_4)

### Installation

#### 1. Download ZIP of main branch on GitHub
* Extract to desired folder (ex: C:\Users\Me\Downloads)
* On command prompt, change directory to the path of the project folder. Example command below:
```
cd Downloads/TeamForge-CAP-2510-IT
``` 

#### 2. npm init -y
* Use the package manager [npm] to initialize the folder as a NodeJS project.

```
npm init -y
```

#### 3. Install Node Libraries
* Use [npm] to install the required Node libraries
```
npm install express dotenv hbs path express-fileupload express-session cookie-parser nodemailer googleapis
```

##### Optional: Install repomix for converting repository into an XML file
1. Go to your repo folder where you are at the root.
2. Type cmd at the top to open cmd at the root already

```
npm install -g repomix
```

3. Then in your command line, enter the following to convert the repository into an xml file
```
repomix
```

#### 4. Set up environment variables
In the `src` folder, create a `.env` file with the following contents:

```env
API_KEY=EXAMPLE-API-KEY

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=EXAMPLE_PASSWORD
DB_NAME=teamforgedb
DB_PORT=3306

DISCORD_WEBHOOK_URL="EXAMPLE"
EMAIL_USER="example@gmail.com"
EMAIL_PASS="example"

CLIENT_ID=sampleclientid.apps.googleusercontent.com
SECRET_ID=GOCSPX-SAMPLE-GOOGLE-SECRET-ID
REDIRECT=http://localhost:3000/redirect

CALENDAR_REDIRECT=http://localhost:3000/calendar/google/redirect
```

#### 5. Google Cloud Setup

Follow this tutorial to set up your credentials:
[https://www.youtube.com/watch?v=2byT7fYT8UE](https://www.youtube.com/watch?v=2byT7fYT8UE)

Notes:

* Application type: Web Application
* When adding scopes, search for Google Calendar API and select all scopes
* SECRET_ID should be copy-pasted from the client_secret of your created Google Cloud client
* Ensure CLIENT_ID, SECRET_ID, and REDIRECT match exactly in both your .env file and Google Cloud Console

##### A. Adding Test Users
Since TeamForge has not yet completed Google’s verification process, the app is in testing mode. Only developer-approved testers can log in.

To add testers:

1. Go to Google Cloud Console → APIs & Services → OAuth consent screen

2. Scroll down to Test users

3. Add the Gmail addresses of people who should be able to log in during testing

### Executing program

* Go to command prompt
* Change directory to the path of the project folder. Example command below:
```
cd Downloads/TeamForge-CAP-2510-IT
```

* Run the Node Server
```
node src/index.js
```

* On your browser, enter the URL "localhost:3000" to access the homepage
```
localhost:3000
```

## Help

Ensure port 3000 is free on your device before running the server

## Authors
Jeremiah Maxwell Ang
[@jeremiahmaxwellang](https://github.com/jeremiahmaxwellang)

Trebis Detablan
[@hailrain](https://github.com/trebisdetablan)

Charles Kevin Duelas
[@Duelly01](https://github.com/Duelly01)

Justin Nicolai Lee
[@juicetice](https://github.com/juiceticedlsu)

## Acknowledgments
* Sir Liandro Tabora