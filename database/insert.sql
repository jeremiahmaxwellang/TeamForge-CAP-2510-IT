USE teamforgedb;

-- Team Details
INSERT INTO teamDetails(teamName)
VALUES ('Viridis Arcus');

-- League Roles
INSERT INTO leagueRoles(roleId, displayedRole, role, teamPosition)
VALUES 
(1, 'Top', 'NONE', 'TOP'),
(2, 'Jungle', 'NONE', 'JUNGLE'),
(3, 'Mid', 'SOLO', 'MIDDLE'),
(4, 'AD Carry', 'CARRY', 'BOTTOM'),
(5, 'Support', 'SUPPORT', 'UTILITY'),
(6, 'Sub Top ', 'NONE', 'TOP'),
(7, 'Sub Jungle', 'NONE', 'JUNGLE'),
(8, 'Sub Mid', 'SOLO', 'MIDDLE'),
(9, 'Sub AD Carry', 'CARRY', 'BOTTOM'),
(10, 'Sub Support', 'SUPPORT', 'UTILITY');

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
    'syl#syl',
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
    'not#applicable',
    'Active'
);

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, schoolId, course, lastGPA, CGPA, yearLevel)
VALUES 
(
    3,
    'VA Tartaros',
    'VA1',
    'Diamond III',
    'Grandmaster',
    3,
    2,
    '12304219',
    'BSCS-SE',
    '3.4',
    '3.3',
    '3rd Year'
),
(
    4,
    'Haimehen',
    '41yk',
    'Diamond IV',
    'Master',
    1,
    3,
    '12445678',
    'BSCS-NIS',
    '3.5',
    '3.2',
    '2nd Year'
),
(
    5,
    'Kalachuchi',
    'Wendy',
    'Emerald I',
    'Diamond IV',
    4,
    5,
    '12254321',
    'BSIT',
    '3.1',
    '2.9',
    '4th Year'
),
(
    6,
    'VA Crowned',
    '1013',
    'Emerald III',
    'Diamond III',
    5,
    5,
    '12387654',
    'BSND',
    '3.5',
    '3.2',
    '3rd Year'
),
(
    7,
    '5star',
    'Prod',
    'Diamond II',
    'Diamond IV',
    2,
    4,
    '12277765',
    'BSIT',
    '2.9',
    '3.0',
    '4th Year'
),
(
    8,
    'VA Mushi',
    'Miko',
    'Diamond II',
    'Diamond IV',
    7,
    1,
    '12404219',
    'BSIT',
    '3.5',
    '3.1',
    '2nd Year'
),
(
    9,
    'lancr',
    '1226',
    'Emerald I',
    'Diamond II',
    2,
    4,
    '12367890',
    'BSIT',
    '2.1',
    '1.9',
    '2nd Year'
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

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, schoolId, course, lastGPA, CGPA, applicationStatus)
VALUES (
    10,
    'Kialos',
    'akali',
    'Diamond III',
    'Diamond IV',
    4,
    3,
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
    2,
    3,
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
    4,
    2,
    '12203653',
    'BSIT',
    1.9,
    2.9,
    'Pending'
);