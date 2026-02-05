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
    'Wendy',
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
    'Sub',
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
);

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRole, secondaryRole, schoolId, course, lastGPA, CGPA)
VALUES 
(
    3,
    'VA Tartaros',
    'VA1',
    'Diamond III',
    'Grandmaster',
    'MIDDLE',
    'JUNGLE',
    '12345678',
    'BSIT',
    '3.4',
    '3.3'
),
(
    4,
    'Haimehen',
    '41yk',
    'Diamond IV',
    'Master',
    'TOP',
    'MIDDLE',
    '12345678',
    'BSIT',
    '3.5',
    '3.2'
),
(
    5,
    'Kalachuchi',
    'Wendy',
    'Emerald I',
    'Diamond IV',
    'CARRY',
    'SUPPORT',
    '12345678',
    'BSIT',
    '3.1',
    '2.9'
),
(
    6,
    'VA Crowned',
    '1013',
    'Emerald III',
    'Diamond III',
    'SUPPORT',
    'SUPPORT',
    '12345678',
    'BSIT',
    '3.5',
    '3.2'
),
(
    7,
    '5star',
    'Prod',
    'Diamond II',
    'Diamond IV',
    'JUNGLE',
    'CARRY',
    '12345678',
    'BSIT',
    '2.9',
    '3.0'
),
(
    8,
    'VA Mushi',
    'Miko',
    'Diamond II',
    'Diamond IV',
    'JUNGLE',
    'TOP',
    '12345678',
    'BSIT',
    '3.5',
    '3.1'
),
(
    9,
    'lancr',
    '1226',
    'Emerald I',
    'Diamond II',
    'JUNGLE',
    'CARRY',
    '12345678',
    'BSIT',
    '2.1',
    '1.9'
);

-- Applicants
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status)
VALUES (
    10,
    'trebis_detablan@dlsu.edu.ph',
    'hashed_password_1',
    'Trebis',
    'Detablan',
    'Applicant',
    'Hailrain#hailrain',
    'Active'
),
(
    11,
    'justin_nicolai_lee@dlsu.edu.ph',
    'hashed_password_2',
    'Justin',
    'Lee',
    'Applicant',
    'juicetice#_juicetice_',
    'Active'
),
(
    12,
    'jeremiahang2004@gmail.com',
    'hashed_password_2',
    'Jerry',
    'Lin',
    'Applicant',
    'Coww2#coww2',
    'Active'
);

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRole, secondaryRole, schoolId, course, lastGPA, CGPA, applicationStatus)
VALUES (
    10,
    'Kialos',
    'akali',
    'Diamond III',
    'Diamond IV',
    'CARRY',
    'MIDDLE',
    '12100001',
    'BSCS-NIS',
    3.25,
    3.30,
    'Pending'
),
(
    11,
    'Pr1m3put1n',
    '3135',
    'Bronze I',
    'Silver I',
    'JUNGLE',
    'MIDDLE',
    '12100002',
    'BSCS-ST',
    3.10,
    3.20,
    'Pending'
),
(
    12,
    'Cowwrean',
    'moo',
    'Diamond III',
    'Diamond IV',
    'CARRY',
    'JUNGLE',
    '12203653',
    'BSIT',
    1.9,
    2.9,
    'Pending'
);