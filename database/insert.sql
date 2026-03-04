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
(5, 'Support', 'SUPPORT', 'UTILITY');

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

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, schoolId, course, lastGPA, CGPA, yearLevel, isSub, teamId)
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
    '3rd Year',
    'F',
    1
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
    '2nd Year',
    'F',
    2
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
    '4th Year',
    'F',
    1
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
    '3rd Year',
    'F',
    2
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
    '4th Year',
    'F',
    1
),
(
    8,
    'VA Mushi',
    'Miko',
    'Diamond II',
    'Diamond IV',
    2,
    1,
    '12404219',
    'BSIT',
    '3.5',
    '3.1',
    '2nd Year',
    'T',
    2
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
    '2nd Year',
    'F',
    1
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

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, schoolId, course, lastGPA, CGPA, applicationStatus, teamId)
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
    'Pending',
    1
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
    'Pending',
    2
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
    'Pending',
    1
);

-- -----------------------------------------------------
-- METRICS
-- -----------------------------------------------------
INSERT INTO metrics (metricId, metricName, metricDescription) VALUES
(1,  'averageAdcProximityAt15', 'Average Proximity Time to ADC by 15 minutes'),
(2,  'averageAssists', 'Average Assists per game'),
(3,  'averageCsDiffAt15', 'Average CS Difference at 15 minutes'),
(4,  'averageCsPerMinute', 'Average Creep Score per Minute'),
(5,  'averageDamageShare', 'Average Damage Share Percentage'),
(6,  'averageDamageToBuildings', 'Average Damage dealt to buildings'),
(7,  'averageDeaths', 'Average Deaths per game'),
(8,  'averageDragonKills', 'Average Dragon Kills'),
(9,  'averageEnemyJungleControl', 'Average Enemy Jungle Monster Kills'),
(10, 'averageGoldDiffAt15', 'Average Gold Difference at 15 minutes'),
(11, 'averageGoldPerMinute', 'Average Gold Per Minute'),
(12, 'averageKDA', 'Average Kill/Death/Assist Ratio'),
(13, 'averageKillParticipation', 'Average Kill Participation Percentage'),
(14, 'averageKills', 'Average Kills per game'),
(15, 'averageSoloKills', 'Average Solo Kills per game'),
(16, 'averageTeamBaronKills', 'Average Team Baron Kills'),
(17, 'averageTeamElderDragonKills', 'Average Team Elder Dragon Kills'),
(18, 'averageTeamRiftHeraldKills', 'Average Team Rift Herald Kills'),
(19, 'averageTotalDamageTaken', 'Average Total Damage Taken'),
(20, 'averageVisionScorePerMinute', 'Average Vision Score Per Minute'),
(21, 'averageVisionScoreShare', 'Average Vision Score Share Percentage'),
(22, 'averageVoidMonsterKills', 'Average Void Monster Kills'),
(23, 'averageWardsDestroyed', 'Average Total Wards Destroyed'),
(24, 'averageWardsPlaced', 'Average Total Wards Placed'),
(25, 'averageXpDiffAt15', 'Average Experience Difference at 15 minutes'),
(26, 'averageWinrate', 'Average Winrate');

-- -----------------------------------------------------
-- METRIC ROLES
-- -----------------------------------------------------

-- 1. Top
INSERT INTO metricRoles (metricId, roleId) VALUES
(26,1), -- averageWinrate
(4,1),  -- averageCsPerMinute
(11,1), -- averageGoldPerMinute
(3,1),  -- averageCsDiffAt15
(25,1), -- averageXpDiffAt15
(7,1),  -- averageDeaths
(15,1), -- averageSoloKills
(13,1), -- averageKillParticipation
(6,1),  -- averageDamageToBuildings
(19,1); -- averageTotalDamageTaken

-- 2. Jungle
INSERT INTO metricRoles (metricId, roleId) VALUES
(26,2),  -- averageWinrate
(4,2),   -- averageCsPerMinute
(13,2),  -- averageKillParticipation
(20,2),  -- averageVisionScorePerMinute
(3,2),   -- averageCsDiffAt15
(8,2),   -- averageDragonKills
(16,2),  -- averageTeamBaronKills
(17,2),  -- averageTeamElderDragonKills
(18,2),  -- averageTeamRiftHeraldKills
(22,2),  -- averageVoidMonsterKills
(9,2);   -- averageEnemyJungleControl

-- 3. Mid
INSERT INTO metricRoles (metricId, roleId) VALUES
(26,3),  -- averageWinrate
(4,3),   -- averageCsPerMinute
(11,3),  -- averageGoldPerMinute
(13,3),  -- averageKillParticipation
(14,3),  -- averageKills
(7,3),   -- averageDeaths
(2,3),   -- averageAssists
(5,3);   -- averageDamageShare

-- 4. ADC
INSERT INTO metricRoles (metricId, roleId) VALUES
(26,4),  -- averageWinrate
(12,4),  -- averageKDA
(20,4),  -- averageVisionScorePerMinute
(4,4),   -- averageCsPerMinute
(3,4),   -- averageCsDiffAt15
(25,4),  -- averageXpDiffAt15
(10,4),  -- averageGoldDiffAt15
(11,4),  -- averageGoldPerMinute
(5,4);   -- averageDamageShare

-- 5. Support
INSERT INTO metricRoles (metricId, roleId) VALUES
(26,5),  -- averageWinrate
(21,5),  -- averageVisionScoreShare
(20,5),  -- averageVisionScorePerMinute
(7,5),   -- averageDeaths
(2,5),   -- averageAssists
(13,5),  -- averageKillParticipation
(24,5),  -- averageWardsPlaced
(23,5),  -- averageWardsDestroyed
(1,5);   -- averageAdcProximityAt15

-- -----------------------------------------------------
-- BENCHMARKS
-- -----------------------------------------------------

-- 1. Top
INSERT INTO benchmarks (metricId, roleId, benchmarkValue, comparator) VALUES
(4, 1, 7.80, '>='),
(11, 1, 388.40, '>='),
(3, 1, -0.30, '>='),
(25, 1, -31.40, '>='),
(7, 1, 3.20, '<='),
(15, 1, 1.70, '>='),
(13, 1, 0.44, '>='), -- Kill Participation
(6, 1, 0.21, '>='),  -- Damage to Buildings
(19, 1, 0.25, '>='); -- Total Damage Taken

-- 2. Jungle
INSERT INTO benchmarks (metricId, roleId, benchmarkValue, comparator) VALUES
(4, 2, 6.80, '>='),
(13, 2, 0.67, '>='), -- Kill Participation
(20, 2, 1.60, '>='),
(3, 2, 0.00, '>'),
(8, 2, 2.00, '>='),
(16, 2, 1.00, '>='),
(17, 2, 1.00, '>='),
(18, 2, 1.00, '>='),
(22, 2, 2.00, '>='),
(9, 2, 4.00, '>=');

-- 3. Mid
INSERT INTO benchmarks (metricId, roleId, benchmarkValue, comparator) VALUES
(4, 3, 8.60, '>='),
(11, 3, 400.00, '>='), -- Gold Per Minute (GPM)
(13, 3, 0.62, '>='),
(14, 3, 4.00, '>='),
(7, 3, 3.20, '<='),
(2, 3, 6.60, '>='),
(5, 3, 0.25, '>='); -- Damage Share

-- 4. ADC
INSERT INTO benchmarks (metricId, roleId, benchmarkValue, comparator) VALUES
(12, 4, 4.10, '>='),
(20, 4, 1.00, '>='),
(4, 4, 8.90, '>='),
(3, 4, -0.25, '>='),
(25, 4, -6.75, '>='),
(10, 4, 7.75, '>='),
(11, 4, 460.00, '>='),
(5, 4, 0.25, '>='); -- Damage Share

-- 5. Support
INSERT INTO benchmarks (metricId, roleId, benchmarkValue, comparator) VALUES
(21, 5, 0.43, '>='), -- Vision Score Share
(20, 5, 3.60, '>='),
(7, 5, 4.00, '<='),
(2, 5, 12.60, '>='),
(13, 5, 0.76, '>='), -- Kill Participation
(24, 5, 5.00, '>='),
(23, 5, 5.00, '>='),
(1, 5, 0.55, '>='); -- Proximity Time to ADC by 15 Minutes


-- -----------------------------------------------------
-- SCRIMS
-- -----------------------------------------------------

INSERT INTO scrims(scrimId, name, date, videoLink, length)
VALUES 
(1, 'Viridis Arcus vs. Annihilation Scrim', '2026-02-23', 'https://www.youtube.com/watch?v=qD_K7_bP4IQ', '30:11');

-- Insert scrim players for scrimId = 1
INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES
(1, 4, 1, 'W'),
(1, 7, 2, 'W'),
(1, 3, 3, 'W'),
(1, 5, 4, 'W'),
(1, 6, 5, 'W');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(1, 4, 'Flexible with a variety of champions but barely communicates with team', 3, 2, 4, 2);

INSERT INTO scrims(scrimId, name, date, videoLink, length)
VALUES 
(2, 'Viridis Arcus vs. Punk Rockers', '2026-02-24', 'https://www.youtube.com/watch?v=qD_K7_bP4IQ', '29:55');

-- Insert scrim players for scrimId = 2
INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES
(2, 4, 1, 'L'),
(2, 7, 2, 'L'),
(2, 3, 3, 'L'),
(2, 5, 4, 'L'),
(2, 6, 5, 'L');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(2, 4, 'Communication has improved since last scrim', 4, 5, 4, 2);

-- SCRIM 3 
INSERT INTO scrims(scrimId, name, date, videoLink, length)
VALUES 
(3, 'Viridis Arcus vs. Sesame Street', '2026-03-04', 'https://www.youtube.com/watch?v=qD_K7_bP4IQ', '30:02');

-- Insert scrim players for scrimId = 3
INSERT INTO scrimPlayers (scrimId, playerId, roleId, teamId, win)
VALUES
(3, 4, 1, '1', 'L'),
(3, 8, 2, '1', 'L'),
(3, 3, 3, '1', 'L'),
(3, 5, 4, '1', 'L'),
(3, 6, 5, '1', 'L');