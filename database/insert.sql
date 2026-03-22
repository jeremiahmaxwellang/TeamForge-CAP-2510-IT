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
    'teamForge123!!',
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
    'teamForge123!!',
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
    'teamForge123!!',
    'Jotaro',
    'Joestar',
    'Player',
    'hailrain#hailrain',
    'Active'
),
(
    4,
    'haimehen@gmail.com',
    'teamForge123!!',
    'Jaime',
    'Henry',
    'Player',
    'Coww2#coww2',
    'Active'
),
(
    5,
    'kalachuchi@gmail.com',
    'teamForge123!!',
    'Wendy',
    'Chuchi',
    'Player',
    'Cowwean#cowwrean',
    'Active'
),
(
    6,
    'vacrowned@gmail.com',
    'teamForge123!!',
    'Crow',
    'Ned',
    'Player',
    'syl#syl',
    'Active'
),
(
    7,
    '5starprod@gmail.com',
    'teamForge123!!',
    'Jonah',
    'Jameson',
    'Player',
    'Jonah#jameson',
    'Active'
),
(
    8,
    'mushimiko@gmail.com',
    'teamForge123!!',
    'Mikhail',
    'Sy',
    'Player',
    'Rascal#1234',
    'Active'
),
(
    9,
    'lancr1226@gmail.com',
    'teamForge123!!',
    'Lance',
    'Go',
    'Player',
    'not#applicable',
    'Active'
),
(
    13,
    'hoshiyo2121@gmail.com',
    'teamForge123!!',
    'Haru',
    'Yoshida',
    'Player',
    'Hoshiyo#2121',
    'Active'
),
(
    14,
    'theblueprint000@gmail.com',
    'teamForge123!!',
    'Nick',
    'Blueprint',
    'Player',
    'The Blueprint#000',
    'Active'
),
(
    15,
    'stellar1105@gmail.com',
    'teamForge123!!',
    'Stella',
    'Ramos',
    'Player',
    'Stellar#1105',
    'Active'
),
(
    16,
    'oneofwunoste@gmail.com',
    'teamForge123!!',
    'One',
    'Wun',
    'Player',
    'one of wun#oste',
    'Active'
),
(
    17,
    'maple091@gmail.com',
    'teamForge123!!',
    'Maple',
    'Navarro',
    'Player',
    'Maple#091',
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
),
(
    13,
    'Hoshiyo',
    '2121',
    'Unranked',
    'Unranked',
    1,
    2,
    '12600013',
    'N/A',
    '0.0',
    '0.0',
    'N/A',
    'F',
    1
),
(
    14,
    'The Blueprint',
    '000',
    'Unranked',
    'Unranked',
    2,
    1,
    '12600014',
    'N/A',
    '0.0',
    '0.0',
    'N/A',
    'F',
    1
),
(
    15,
    'Stellar',
    '1105',
    'Unranked',
    'Unranked',
    3,
    5,
    '12600015',
    'N/A',
    '0.0',
    '0.0',
    'N/A',
    'F',
    1
),
(
    16,
    'one of wun',
    'oste',
    'Unranked',
    'Unranked',
    4,
    1,
    '12600016',
    'N/A',
    '0.0',
    '0.0',
    'N/A',
    'F',
    1
),
(
    17,
    'Maple',
    '091',
    'Unranked',
    'Unranked',
    5,
    3,
    '12600017',
    'N/A',
    '0.0',
    '0.0',
    'N/A',
    'F',
    1
);

-- -----------------------------------------------------
-- APPLICATION PERIODS (2 weeks each)
-- -----------------------------------------------------
INSERT INTO application_periods (startDate, endDate) VALUES
('2025-09-01', '2025-09-13'),
('2026-01-26', '2026-02-07'),
('2026-03-21', '2026-04-04'); -- period 3

-- -----------------------------------------------------
-- APPLICANTS (Bad)
-- -----------------------------------------------------

-- Top/Mid: zero#6983
-- Jungle/Support: Zayexium#ACT
-- Jungle/Jungle: Pr1m3put1n#3135
-- Mid/Mid: Yishun Resident#walao
-- Mid/Top: Sou Hiyori#YTTD
-- ADC/Support: Venzyx#1432
-- Support/Support: MrBedroom#0000 (Low champ pool: Teemo one-trick)

-- Applicant: zero#6983 (Top/Mid)
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status) 
VALUES (18, 'zero@example.com', 'teamForge123!!', 'Lex', 'Luthor', 'Applicant', 'zero#6983', 'Active');

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, schoolId, course, lastGPA, CGPA, teamId, yearLevel)
VALUES (18, 'zero', '6983', 'Platinum I', 'Platinum II', 1, 3, '12100018', 'BSCS-NIS', 3.10, 3.20, 1, '1st Year');

INSERT INTO applications (periodId, userId, primaryRoleId, status) VALUES (3, 18, 1, 'Pending');

-- Applicant: Zayexium#ACT (Jungle/Support)
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status) 
VALUES (19, 'zayexium@example.com', 'teamForge123!!', 'Barry', 'Allen', 'Applicant', 'Zayexium#ACT', 'Active');

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, schoolId, course, lastGPA, CGPA, teamId, yearLevel)
VALUES (19, 'Zayexium', 'ACT', 'Gold II', 'Gold I', 2, 5, '12100019', 'BSCS-NIS', 2.90, 3.00, 1, '4th Year');

INSERT INTO applications (periodId, userId, primaryRoleId, status) VALUES (3, 19, 2, 'Pending');

-- Applicant: Pr1m3put1n#3135 (Jungle/Jungle)
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status) 
VALUES (20, 'pr1m3put1n@example.com', 'teamForge123!!', 'Tony', 'Tang', 'Applicant', 'Pr1m3put1n#3135', 'Active');

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, schoolId, course, lastGPA, CGPA, teamId, yearLevel)
VALUES (20, 'Pr1m3put1n', '3135', 'Diamond IV', 'Diamond IV', 2, 2, '12100020', 'BSCS-NIS', 3.40, 3.50, 1, '4th Year');

INSERT INTO applications (periodId, userId, primaryRoleId, status) VALUES (3, 20, 2, 'Pending');

-- Applicant: Yishun Resident#walao (Mid/Mid)
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status) 
VALUES (21, 'yishun@example.com', 'teamForge123!!', 'Zachary', 'Valjean', 'Applicant', 'Yishun Resident#walao', 'Active');

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, schoolId, course, lastGPA, CGPA, teamId, yearLevel)
VALUES (21, 'Yishun Resident', 'walao', 'Platinum II', 'Platinum III', 3, 3, '12100021', 'BSCS-NIS', 3.00, 3.05, 1, '2nd Year');

INSERT INTO applications (periodId, userId, primaryRoleId, status) VALUES (3, 21, 3, 'Pending');

-- Applicant: Sou Hiyori#YTTD (Mid/Top)
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status) 
VALUES (22, 'souhiyori@example.com', 'teamForge123!!', 'Joshua', 'Hiyori', 'Applicant', 'Sou Hiyori#YTTD', 'Active');

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, schoolId, course, lastGPA, CGPA, teamId, yearLevel)
VALUES (22, 'Sou Hiyori', 'YTTD', 'Emerald I', 'Emerald II', 3, 1, '12100022', 'BSCS-NIS', 3.20, 3.25, 1, '1st Year');

INSERT INTO applications (periodId, userId, primaryRoleId, status) VALUES (3, 22, 3, 'Pending');

-- Applicant: Venzyx#1432 (ADC/Support)
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status) 
VALUES (23, 'venzyx@example.com', 'teamForge123!!', 'Jordan', 'Peele', 'Applicant', 'Venzyx#1432', 'Active');

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, schoolId, course, lastGPA, CGPA, teamId, yearLevel)
VALUES (23, 'Venzyx', '1432', 'Diamond II', 'Diamond III', 4, 5, '12100023', 'BSCS-NIS', 3.35, 3.40, 1, '3rd Year');

INSERT INTO applications (periodId, userId, primaryRoleId, status) VALUES (3, 23, 4, 'Pending');

-- Applicant: MrBedroom#0000 (Support/Support, Teemo one-trick)
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status) 
VALUES (24, 'mrbedroom@example.com', 'teamForge123!!', 'Mikhail', 'Dent', 'Applicant', 'MrBedroom#0000', 'Active');

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, schoolId, course, lastGPA, CGPA, teamId, yearLevel)
VALUES (24, 'MrBedroom', '0000', 'Silver I', 'Silver I', 5, 5, '12100024', 'BSCS-NIS', 2.50, 2.60, 1, '2nd Year');

INSERT INTO applications (periodId, userId, primaryRoleId, status) VALUES (3, 24, 5, 'Pending');

-- -----------------------------------------------------
-- APPLICATIONS in previous terms
-- -----------------------------------------------------
-- Accepted applications in Period 1
INSERT INTO applications (periodId, userId, primaryRoleId, status) VALUES
(1, 3, 3, 'Accepted'),  -- VA Tartaros (Mid)
(1, 4, 1, 'Accepted'),  -- Haimehen (Top)
(1, 5, 4, 'Accepted'),  -- Kalachuchi (ADC)
(1, 6, 5, 'Accepted'),  -- VA Crowned (Support)
(1, 7, 2, 'Accepted');  -- 5star (Jungle)

-- Accepted applications in Period 2
INSERT INTO applications (periodId, userId, primaryRoleId, status) VALUES
(2, 8, 2, 'Accepted'),  -- VA Mushi (Jungle)
(2, 9, 2, 'Accepted'),  -- lancr (Jungle)
(2, 13, 1, 'Accepted'), -- Hoshiyo (Top)
(2, 14, 2, 'Accepted'), -- The Blueprint (Jungle)
(2, 15, 3, 'Accepted'), -- Stellar (Mid)
(2, 16, 4, 'Accepted'), -- one of wun (ADC)
(2, 17, 5, 'Accepted'); -- Maple (Support)

-- Rejected Period 1 applications
INSERT INTO applications (periodId, userId, primaryRoleId, status) VALUES
(1, 20, 2, 'Rejected'), -- Pr1m3put1n Jungle
(1, 21, 3, 'Rejected'), -- Yishun Resident Mid
(1, 22, 3, 'Rejected'), -- Sou Hiyori Mid
(1, 23, 4, 'Rejected'), -- Venzyx ADC
(1, 24, 5, 'Rejected'); -- MrBedroom Support

-- Rejected Period 2 applications
INSERT INTO applications (periodId, userId, primaryRoleId, status) VALUES
(2, 18, 1, 'Rejected'), -- zero#6983 Top
(2, 19, 2, 'Rejected'), -- Zayexium Jungle
(2, 20, 2, 'Rejected'), -- Pr1m3put1n Jungle
(2, 21, 3, 'Rejected'), -- Yishun Resident Mid
(2, 22, 3, 'Rejected'), -- Sou Hiyori Mid
(2, 23, 4, 'Rejected'), -- Venzyx ADC
(2, 24, 5, 'Rejected'); -- MrBedroom Support


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
(14, 1, 4.00, '>='),     -- Kills
(2, 1, 6.00, '>='),      -- Assists
(12, 1, 2.50, '>='),     -- KDA
(4, 1, 7.80, '>='),      -- CS/Min
(11, 1, 388.40, '>='),   -- Gold/Min
(5, 1, 25.00, '>='),     -- Damage Share %
(19, 1, 28000.00, '>='), -- Tanking
(15, 1, 1.70, '>='),     -- Solo Kills
(7, 1, 3.20, '<=');      -- Deaths

-- 2. Jungle
INSERT INTO benchmarks (metricId, roleId, benchmarkValue, comparator) VALUES
(14, 2, 5.00, '>='),     -- Kills
(2, 2, 8.00, '>='),      -- Assists
(12, 2, 3.50, '>='),     -- KDA
(4, 2, 6.80, '>='),      -- CS/Min
(11, 2, 410.00, '>='),   -- Gold/Min
(7, 2, 3.50, '<='),      -- Deaths
(13, 2, 67.00, '>='),    -- Kill Participation %
(20, 2, 1.60, '>='),     -- Vision Score/Min
(8, 2, 2.00, '>='),      -- Dragon Kills
(16, 2, 1.00, '>='),     -- Team Baron
(17, 2, 1.00, '>='),     -- Team Elder
(18, 2, 1.00, '>='),     -- Team Herald
(22, 2, 2.00, '>='),     -- Void Monster
(9, 2, 4.00, '>=');      -- Enemy Jungle Control

-- 3. Mid
INSERT INTO benchmarks (metricId, roleId, benchmarkValue, comparator) VALUES
(14, 3, 5.50, '>='),     -- Kills
(2, 3, 6.60, '>='),      -- Assists
(12, 3, 3.50, '>='),     -- KDA
(4, 3, 8.60, '>='),      -- CS/Min
(11, 3, 400.00, '>='),   -- Gold/Min
(7, 3, 3.20, '<='),      -- Deaths
(13, 3, 62.00, '>='),    -- Kill Participation %
(5, 3, 25.00, '>='),     -- Damage Share %
(15, 3, 1.50, '>=');     -- Solo Kills

-- 4. ADC
INSERT INTO benchmarks (metricId, roleId, benchmarkValue, comparator) VALUES
(14, 4, 6.00, '>='),     -- Kills
(2, 4, 6.00, '>='),      -- Assists
(12, 4, 4.10, '>='),     -- KDA
(4, 4, 8.90, '>='),      -- CS/Min
(11, 4, 460.00, '>='),   -- Gold/Min
(7, 4, 3.50, '<='),      -- Deaths
(5, 4, 28.00, '>='),     -- Damage Share %
(20, 4, 1.00, '>=');     -- Vision Score/Min

-- 5. Support
INSERT INTO benchmarks (metricId, roleId, benchmarkValue, comparator) VALUES
(14, 5, 1.00, '>='),     -- Kills
(2, 5, 12.60, '>='),     -- Assists
(12, 5, 3.20, '>='),     -- KDA
(4, 5, 1.50, '>='),      -- CS/Min
(11, 5, 250.00, '>='),   -- Gold/Min
(7, 5, 4.00, '<='),      -- Deaths
(13, 5, 76.00, '>='),    -- Kill Participation %
(21, 5, 43.00, '>='),    -- Vision Score Share %
(20, 5, 3.60, '>='),     -- Vision Score/Min
(24, 5, 35.00, '>='),    -- Wards Placed
(23, 5, 10.00, '>='),    -- Wards Destroyed
(1, 5, 55.00, '>=');     -- Proximity Time to ADC


-- -----------------------------------------------------
-- SCRIMS
-- -----------------------------------------------------

-- Scrim 1
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (1, 'Viridis Arcus vs. Annihilation Scrim', '2026-02-23', 'https://www.youtube.com/watch?v=qD_K7_bP4IQ', '30:11', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (1, 4, 1, 'W'), (1, 7, 2, 'W'), (1, 3, 3, 'W'), (1, 5, 4, 'W'), (1, 6, 5, 'W');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(1, 7, 'Barely spoke in teamfights', 3, 1, 3, 2),
(1, 4, 'Top laner gave good calls', 3, 4, 3, 2),
(1, 3, 'Mid laner average comms', 3, 3, 3, 2),
(1, 5, 'ADC vocal early, quiet late', 3, 2, 4, 2),
(1, 6, 'Support steady comms', 3, 4, 3, 2);

-- Scrim 2
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (2, 'Viridis Arcus vs. Justice League', '2026-02-24', 'https://www.youtube.com/watch?v=scrim2', '28:45', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (2, 13, 1, 'L'), (2, 7, 2, 'L'), (2, 14, 3, 'L'), (2, 9, 4, 'L'), (2, 17, 5, 'L');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(2, 7, 'Quiet in comms', 3, 2, 3, 2),
(2, 13, 'Top laner weak comms', 2, 2, 2, 2),
(2, 14, 'Mid laner strong comms', 4, 5, 4, 2),
(2, 9, 'ADC average', 3, 3, 3, 2),
(2, 17, 'Support vocal', 4, 4, 4, 2);

-- Scrim 3
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (3, 'Viridis Arcus vs. Avengers', '2026-02-25', 'https://www.youtube.com/watch?v=scrim3', '32:10', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (3, 4, 1, 'W'), (3, 7, 2, 'W'), (3, 15, 3, 'W'), (3, 5, 4, 'W'), (3, 6, 5, 'W');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(3, 7, 'Minimal communication', 3, 1, 3, 2),
(3, 4, 'Top laner silent this game', 3, 2, 3, 2),
(3, 15, 'Mid laner strong comms', 4, 5, 4, 2),
(3, 5, 'ADC average comms', 3, 3, 3, 2),
(3, 6, 'Support weak comms', 2, 2, 2, 2);

-- Scrim 4
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (4, 'Viridis Arcus vs. X-Men', '2026-02-26', 'https://www.youtube.com/watch?v=scrim4', '29:55', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (4, 13, 1, 'L'), (4, 7, 2, 'L'), (4, 3, 3, 'L'), (4, 16, 4, 'L'), (4, 6, 5, 'L');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(4, 7, 'Silent during fights', 2, 2, 2, 2),
(4, 13, 'Top laner improved comms', 3, 3, 3, 2),
(4, 3, 'Mid laner steady', 3, 4, 3, 2),
(4, 16, 'ADC poor comms', 2, 1, 2, 2),
(4, 6, 'Support strong comms', 4, 5, 4, 2);

-- Scrim 5
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (5, 'Viridis Arcus vs. Fantastic Four', '2026-02-27', 'https://www.youtube.com/watch?v=scrim5', '31:20', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (5, 4, 1, 'W'), (5, 7, 2, 'W'), (5, 14, 3, 'W'), (5, 9, 4, 'W'), (5, 17, 5, 'W');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(5, 7, 'Some comms but inconsistent', 3, 1, 3, 2),
(5, 4, 'Top laner vocal', 4, 4, 4, 2),
(5, 14, 'Mid laner weak comms', 2, 2, 2, 2),
(5, 9, 'ADC average', 3, 3, 3, 2),
(5, 17, 'Support strong', 4, 5, 4, 2);

-- Scrim 6
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (6, 'Viridis Arcus vs. Guardians of the Galaxy', '2026-02-28', 'https://www.youtube.com/watch?v=scrim6', '27:40', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (6, 13, 1, 'L'), (6, 7, 2, 'L'), (6, 15, 3, 'L'), (6, 5, 4, 'L'), (6, 6, 5, 'L');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(6, 7, 'Barely spoke', 2, 2, 2, 2),
(6, 13, 'Top laner average', 3, 3, 3, 2),
(6, 15, 'Mid laner vocal', 4, 4, 4, 2),
(6, 5, 'ADC weak comms', 2, 2, 2, 2),
(6, 6, 'Support average', 3, 3, 3, 2);

-- Scrim 7
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (7, 'Viridis Arcus vs. Teen Titans', '2026-03-01', 'https://www.youtube.com/watch?v=scrim7', '33:00', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (7, 4, 1, 'W'), (7, 7, 2, 'W'), (7, 3, 3, 'W'), (7, 16, 4, 'W'), (7, 17, 5, 'W');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(7, 7, 'Minimal comms again', 3, 2, 3, 2),
(7, 4, 'Top laner strong', 4, 5, 4, 2),
(7, 3, 'Mid laner average', 3, 3, 3, 2),
(7, 16, 'ADC poor comms', 2, 1, 2, 2),
(7, 17, 'Support steady', 3, 4, 3, 2);

-- Scrim 8
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (8, 'Viridis Arcus vs. Watchmen', '2026-03-02', 'https://www.youtube.com/watch?v=scrim8', '30:15', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (8, 13, 1, 'L'), (8, 7, 2, 'L'), (8, 14, 3, 'L'), (8, 9, 4, 'L'), (8, 6, 5, 'L');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(8, 7, 'Silent', 2, 1, 2, 2),
(8, 13, 'Top laner weak', 2, 2, 2, 2),
(8, 14, 'Mid laner strong', 4, 5, 4, 2),
(8, 9, 'ADC average', 3, 3, 3, 2),
(8, 6, 'Support vocal', 4, 4, 4, 2);

-- Scrim 9
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (9, 'Viridis Arcus vs. Incredibles', '2026-03-03', 'https://www.youtube.com/watch?v=scrim9', '29:30', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (9, 4, 1, 'W'), (9, 7, 2, 'W'), (9, 15, 3, 'W'), (9, 5, 4, 'W'), (9, 17, 5, 'W');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(9, 7, 'Some comms but weak', 3, 2, 3, 2),
(9, 4, 'Top laner average', 3, 3, 3, 2),
(9, 15, 'Mid laner strong', 4, 4, 4, 2),
(9, 5, 'ADC weak', 2, 2, 2, 2),
(9, 17, 'Support strong', 4, 5, 4, 2);

-- Scrim 10
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (10, 'Viridis Arcus vs. Defenders', '2026-03-04', 'https://www.youtube.com/watch?v=scrim10', '28:55', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (10, 13, 1, 'L'), (10, 7, 2, 'L'), (10, 3, 3, 'L'), (10, 16, 4, 'L'), (10, 6, 5, 'L');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(10, 7, 'Silent again', 2, 1, 2, 2),
(10, 13, 'Top laner vocal', 4, 4, 4, 2),
(10, 3, 'Mid laner average', 3, 3, 3, 2),
(10, 16, 'ADC strong', 4, 5, 4, 2),
(10, 6, 'Support weak', 2, 2, 2, 2);





-- Scrim 11 (The Blueprint game 1)
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (11, 'Scrim 11', '2026-03-10', 'https://youtu.be/scrim11', '31:40', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (11, 4, 1, 'W'), (11, 14, 2, 'W'), (11, 3, 3, 'W'), (11, 5, 4, 'W'), (11, 6, 5, 'W');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES (11, 14, 'Solid comms, clear calls', 3, 3, 3, 2);

-- Scrim 12 (The Blueprint game 2)
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (12, 'Scrim 12', '2026-03-11', 'https://youtu.be/scrim12', '30:20', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (12, 4, 1, 'L'), (12, 14, 2, 'L'), (12, 3, 3, 'L'), (12, 5, 4, 'L'), (12, 6, 5, 'L');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES (12, 14, 'Good communication, steady shotcalling', 3, 4, 3, 2);

-- Scrim 13 (The Blueprint game 3)
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (13, 'Scrim 13', '2026-03-12', 'https://youtu.be/scrim13', '29:50', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (13, 4, 1, 'W'), (13, 14, 2, 'W'), (13, 3, 3, 'W'), (13, 5, 4, 'W'), (13, 6, 5, 'W');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES (13, 14, 'Communicated rotations well', 3, 3, 3, 2);

-- Scrim 14 (The Blueprint game 4)
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (14, 'Scrim 14', '2026-03-13', 'https://youtu.be/scrim14', '32:05', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (14, 4, 1, 'L'), (14, 14, 2, 'L'), (14, 3, 3, 'L'), (14, 5, 4, 'L'), (14, 6, 5, 'L');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES (14, 14, 'Strong comms, decisive calls', 4, 4, 3, 2);

-- Scrim 15 (The Blueprint game 5)
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (15, 'Scrim 15', '2026-03-14', 'https://youtu.be/scrim15', '30:40', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (15, 4, 1, 'W'), (15, 14, 2, 'W'), (15, 3, 3, 'W'), (15, 5, 4, 'W'), (15, 6, 5, 'W');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES (15, 14, 'Clear communication, good synergy', 3, 3, 3, 2);

-- Scrim 16 (The Blueprint game 6)
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (16, 'Scrim 16', '2026-03-15', 'https://youtu.be/scrim16', '31:15', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (16, 4, 1, 'L'), (16, 14, 2, 'L'), (16, 3, 3, 'L'), (16, 5, 4, 'L'), (16, 6, 5, 'L');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES (16, 14, 'Good comms, steady', 3, 4, 3, 2);

-- Scrim 17 (The Blueprint game 7)
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES (17, 'Scrim 17', '2026-03-16', 'https://youtu.be/scrim17', '29:35', 'evaluated');

INSERT INTO scrimPlayers (scrimId, playerId, roleId, win)
VALUES (17, 4, 1, 'W'), (17, 14, 2, 'W'), (17, 3, 3, 'W'), (17, 5, 4, 'W'), (17, 6, 5, 'W');

INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES (17, 14, 'Strong comms, very vocal', 4, 4, 3, 2);


-- -----------------------------------------------------
-- TOURNAMENTS
-- -----------------------------------------------------

INSERT INTO tournaments (tournamentId, name, startDate, endDate, win)
VALUES
(1, 'Campus Clash 2026 Qualifiers', '2026-01-18', '2026-01-19', 'W'),
(2, 'Inter-University Rift Cup', '2026-02-07', '2026-02-08', 'L'),
(3, 'Summer Showdown Invitational', '2026-03-15', '2026-03-16', 'N/A'),
(4, 'January Nexus Open', '2026-01-23', '2026-01-24', 'W'),
(5, 'Rift Rivals Collegiate Week 1', '2026-01-30', '2026-01-31', 'L'),
(6, 'February Phoenix Bracket', '2026-02-14', '2026-02-15', 'N/A'),
(7, 'Spring Split City Clash', '2026-02-27', '2026-02-28', 'W'),
(8, 'March Midlane Masters', '2026-03-21', '2026-03-22', 'L'),
(9, 'April Academy Invitational', '2026-04-04', '2026-04-05', 'N/A'),
(10, 'Campus Crown Cup', '2026-04-18', '2026-04-19', 'W');

-- Tournament 1: full roster with two subs
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(1, 4, 1, 'N'),
(1, 14, 2, 'N'),
(1, 3, 3, 'N'),
(1, 16, 4, 'N'),
(1, 6, 5, 'N'),
(1, 13, 1, 'Y'),
(1, 17, 5, 'Y');

-- Tournament 2: starters only, no subs
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(2, 13, 1, 'N'),
(2, 7, 2, 'N'),
(2, 15, 3, 'N'),
(2, 5, 4, 'N'),
(2, 17, 5, 'N');

-- Tournament 3: one substitute available
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(3, 4, 1, 'N'),
(3, 14, 2, 'N'),
(3, 3, 3, 'N'),
(3, 16, 4, 'N'),
(3, 6, 5, 'N'),
(3, 15, 3, 'Y');

-- Tournament 4: full starters, no substitutes
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(4, 4, 1, 'N'),
(4, 7, 2, 'N'),
(4, 3, 3, 'N'),
(4, 5, 4, 'N'),
(4, 6, 5, 'N');

-- Tournament 5: one substitute available
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(5, 13, 1, 'N'),
(5, 14, 2, 'N'),
(5, 15, 3, 'N'),
(5, 16, 4, 'N'),
(5, 17, 5, 'N'),
(5, 7, 2, 'Y');

-- Tournament 6: two substitutes available
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(6, 4, 1, 'N'),
(6, 8, 2, 'N'),
(6, 3, 3, 'N'),
(6, 5, 4, 'N'),
(6, 6, 5, 'N'),
(6, 13, 1, 'Y'),
(6, 17, 5, 'Y');

-- Tournament 7: starters only
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(7, 13, 1, 'N'),
(7, 7, 2, 'N'),
(7, 15, 3, 'N'),
(7, 16, 4, 'N'),
(7, 17, 5, 'N');

-- Tournament 8: one substitute available
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(8, 4, 1, 'N'),
(8, 14, 2, 'N'),
(8, 3, 3, 'N'),
(8, 5, 4, 'N'),
(8, 6, 5, 'N'),
(8, 15, 3, 'Y');

-- Tournament 9: mixed roster with two subs
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(9, 13, 1, 'N'),
(9, 8, 2, 'N'),
(9, 15, 3, 'N'),
(9, 16, 4, 'N'),
(9, 17, 5, 'N'),
(9, 3, 3, 'Y'),
(9, 6, 5, 'Y');

-- Tournament 10: full roster with one substitute
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(10, 4, 1, 'N'),
(10, 7, 2, 'N'),
(10, 3, 3, 'N'),
(10, 5, 4, 'N'),
(10, 6, 5, 'N'),
(10, 14, 2, 'Y');