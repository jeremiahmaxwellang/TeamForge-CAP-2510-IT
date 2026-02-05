USE teamforgedb;

-- Manager
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status) 
VALUES 
(
    1,
    'jeremiah_ang@dlsu.edu.ph',
    '1234',
    'Jeremiah',
    'Ang',
    'Team Manager',
    'Cowwrean#cowwrean',
    'Active'
);

-- Coach 
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status) 
VALUES 
(
    2,
    'charles_duelas@dlsu.edu.ph',
    '1234',
    'Charles',
    'Duelas',
    'Team Coach',
    'AgentDuelly#agentduelly',
    'Active'
);

-- Players
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status)
VALUES 
(
    3,
    'tartaros@gmail.com',
    '1234',
    'Jotaro',
    'Joestar',
    'Player',
    'hailrain#hailrain',
    'Active'
),
(
    4,
    'haimehen@gmail.com',
    '1234',
    'Jaime',
    'Henry',
    'Player',
    'Coww2#coww2',
    'Active'
),
(
    5,
    'kalachuchi@gmail.com',
    '1234',
    'Kala',
    'Chuchi',
    'Player',
    'Cowwean#cowwrean',
    'Active'
),
(
    6,
    'vacrowned@gmail.com',
    '1234',
    'Crow',
    'Ned',
    'Player',
    'Cowwean#cowwrean',
    'Active'
),
(
    7,
    '5starprod@gmail.com',
    '1234',
    'Jonah',
    'Jameson',
    'Player',
    'Jonah#jameson',
    'Active'
),
(
    8,
    'mushimiko@gmail.com',
    '1234',
    'Mikhail',
    'Sy',
    'Player',
    'Rascal#1234',
    'Active'
),
(
    9,
    'lancr1226@gmail.com',
    '1234',
    'Lance',
    'Go',
    'Player',
    'Cowwean#cowwrean',
    'Active'
)
;

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRole, secondaryRole, puuid, accountRegion, schoolId, course, lastGPA, CGPA)
VALUES 
(
    3,
    'VA Tartaros',
    'VA1',
    'Diamond II',
    'Master I',
    'MIDDLE',
    'Bot Support',
    '12345678',
    'BSIT',
    '3.4',
    '3.3'
),
(
    4,
    'Haimehen',
    '41yk',
    'Diamond II',
    'Diamond III',
    'JUNGLE',
    'SUPPORT',
    '12345678',
    'BSIT',
    '3.5',
    '3.2'
),
(
    5,
    'Kalachuchi',
    'Wendy',
    'Diamond II',
    'Diamond III',
    'CARRY',
    'SUPPORT',
    '12345678',
    'BSIT',
    '3.5',
    '3.2'
),
(
    6,
    'VA Crowned',
    '1013',
    'Diamond II',
    'Diamond III',
    'SUPPORT',
    'SUPPORT',
    '12345678',
    'BSIT',
    '3.5',
    '3.2'
),

;

-- Applicants
-- =========================
-- First Applicant
-- =========================
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status)
VALUES (
    5,
    'trebis_detablan@dlsu.edu.ph',
    'hashed_password_1',
    'Trebis',
    'Detablan',
    'Applicant',
    'applicant1#1234',
    'Active'
);

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRole, secondaryRole, puuid, accountRegion, schoolId, course, lastGPA, CGPA, applicationStatus, winrate, averageKDA)
VALUES (
    5,
    'MrBreast',
    'GCE',
    'Gold',
    'Platinum',
    'Top',
    'Mid',
    'PUUID_SAMPLE_1',
    'ASIA',
    '2021-00001',
    'BSIT',
    3.25,
    3.30,
    'Pending',
    52.50,
    3.10
);

-- =========================
-- Second Applicant
-- =========================
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status)
VALUES (
    6,
    'justin_nicolai_lee@dlsu.edu.ph',
    'hashed_password_2',
    'Justin',
    'Lee',
    'Applicant',
    'applicant2#5678',
    'Active'
);

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRole, secondaryRole, puuid, accountRegion, schoolId, course, lastGPA, CGPA, applicationStatus, winrate, averageKDA)
VALUES (
    6,
    'MrBreast',
    'GCE',
    'Silver',
    'Gold',
    'Top',
    'Jungle',
    'PUUID_SAMPLE_2',
    'ASIA',
    '2021-00002',
    'BSIT',
    3.10,
    3.20,
    'Pending',
    48.75,
    2.85
);