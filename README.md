## Description
TeamForge is a Decision Support System for Collegiate League of Legends Esports Teams

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

#### 4. Set up environment variables
In the src folder, create a .env file with the following contents:

```
API_KEY=EXAMPLE-API-KEY

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=EXAMPLE_PASSWORD
DB_NAME=teamforgedb
DB_PORT=3306

DISCORD_WEBHOOK_URL="EXAMPLE"
EMAIL_USER="example@gmail.com"
EMAIL_PASS="example"
```

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