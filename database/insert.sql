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
-- INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status)
-- VALUES 
-- (
--     3,
--     'trebis_detablan@dlsu.edu.ph',
--     '1234',
--     'Trebis',
--     'Detablan',
--     'Player',
--     'hailrain#hailrain',
--     'Active'
-- );

-- INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status)
-- VALUES 
-- (
--     4,
--     'jeremiahang2004@gmail.com',
--     '1234',
--     'Maxwell',
--     'Ang',
--     'Player',
--     'Coww2#coww2',
--     'Active'
-- );

-- INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRole, secondaryRole, puuid, accountRegion, schoolId, course, lastGPA, CGPA)
-- VALUES 
-- (
--     3,
--     'kialos',
--     'akali',
--     'Diamond II',
--     'Master I',
--     'Mid',
--     'Bot Support',
--     '12345678',
--     'BSIT',
--     '3.4',
--     '3.3'
-- );

-- INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRole, secondaryRole, puuid, accountRegion, schoolId, course, lastGPA, CGPA)
-- VALUES 
-- (
--     4,
--     'Cowwrean',
--     'moo',
--     'Diamond II',
--     'Diamond III',
--     'Bot ADC',
--     'Jungle',
--     '12345678',
--     'BSIT',
--     '3.5',
--     '3.2'
-- );

