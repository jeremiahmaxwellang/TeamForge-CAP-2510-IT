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
(4, 1, 7.80, '>='),
(11, 1, 388.40, '>='),
(3, 1, -0.30, '>='),
(25, 1, -31.40, '>='),
(7, 1, 3.20, '<='),
(15, 1, 1.70, '>='),
(13, 1, 0.44, '>='),
(6, 1, 0.21, '>='),
(19, 1, 0.25, '>=');

-- 2. Jungle
INSERT INTO benchmarks (metricId, roleId, benchmarkValue, comparator) VALUES
(4, 2, 6.80, '>='),
(13, 2, 0.67, '>='),
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
(11, 3, 400.00, '>='),
(13, 3, 0.62, '>='),
(14, 3, 4.00, '>='),
(7, 3, 3.20, '<='),
(2, 3, 6.60, '>='),
(5, 3, 0.25, '>=');

-- 4. ADC
INSERT INTO benchmarks (metricId, roleId, benchmarkValue, comparator) VALUES
(12, 4, 4.10, '>='),
(20, 4, 1.00, '>='),
(4, 4, 8.90, '>='),
(3, 4, -0.25, '>='),
(25, 4, -6.75, '>='),
(10, 4, 7.75, '>='),
(11, 4, 460.00, '>='),
(5, 4, 0.25, '>=');

-- 5. Support
INSERT INTO benchmarks (metricId, roleId, benchmarkValue, comparator) VALUES
(21, 5, 0.43, '>='),
(20, 5, 3.60, '>='),
(7, 5, 4.00, '<='),
(2, 5, 12.60, '>='),
(13, 5, 0.76, '>='),
(24, 5, 5.00, '>='),
(23, 5, 5.00, '>='),
(1, 5, 0.55, '>=');


-- -----------------------------------------------------
-- SCRIMS
-- -----------------------------------------------------

INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES 
(1, 'Viridis Arcus vs. Annihilation Scrim', '2026-02-23', 'https://www.youtube.com/watch?v=qD_K7_bP4IQ', '30:11', 'evaluated');

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

INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES 
(2, 'Viridis Arcus vs. Punk Rockers', '2026-02-24', 'https://www.youtube.com/watch?v=qD_K7_bP4IQ', '29:55', 'evaluated');

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
INSERT INTO scrims(scrimId, name, date, videoLink, length, status)
VALUES 
(3, 'Viridis Arcus vs. Sesame Street', '2026-03-04', 'https://www.youtube.com/watch?v=qD_K7_bP4IQ', '30:02', 'unevaluated');

-- Insert scrim players for scrimId = 3
INSERT INTO scrimPlayers (scrimId, playerId, roleId, teamId, win)
VALUES
(3, 4, 1, '1', 'L'),
(3, 8, 2, '1', 'L'),
(3, 3, 3, '1', 'L'),
(3, 5, 4, '1', 'L'),
(3, 6, 5, '1', 'L');

-- -----------------------------------------------------
-- TOURNAMENTS
-- -----------------------------------------------------

INSERT INTO tournaments (tournamentId, name, startDate, endDate, win)
VALUES
(1, 'May Kickoff Clash', '2025-05-17', '2025-05-18', 'W'),
(2, 'June Rift Gauntlet', '2025-06-07', '2025-06-08', 'L'),
(3, 'June Campus Showdown', '2025-06-28', '2025-06-29', 'N/A'),
(4, 'July Collegiate Cup', '2025-07-19', '2025-07-20', 'W'),
(5, 'August Finals Qualifier', '2025-08-09', '2025-08-10', 'L'),
(6, 'September Open Series', '2025-09-06', '2025-09-07', 'N/A'),
(7, 'October Rift Rumble', '2025-10-04', '2025-10-05', 'W'),
(8, 'October Nexus Trials', '2025-10-25', '2025-10-26', 'L'),
(9, 'November Varsity Cup', '2025-11-15', '2025-11-16', 'W'),
(10, 'December Invitational', '2025-12-06', '2025-12-07', 'N/A'),
(11, 'January Season Opener', '2026-01-17', '2026-01-18', 'L'),
(12, 'February Rift Cup', '2026-02-07', '2026-02-08', 'W'),
(13, 'March Midseason Clash', '2026-03-07', '2026-03-08', 'N/A'),
(14, 'April Academy Cup', '2026-04-04', '2026-04-05', 'W'),
(15, 'Spring Crown Finals', '2026-04-18', '2026-04-19', 'L');

-- Period 1: May 2025 to August 2025
-- Tournament 1: veteran core with two substitutes
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(1, 4, 1, 'N'),
(1, 7, 2, 'N'),
(1, 3, 3, 'N'),
(1, 5, 4, 'N'),
(1, 6, 5, 'N'),
(1, 13, 1, 'Y'),
(1, 17, 5, 'Y');

-- Tournament 2: academy starters with one substitute
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(2, 13, 1, 'N'),
(2, 8, 2, 'N'),
(2, 15, 3, 'N'),
(2, 16, 4, 'N'),
(2, 17, 5, 'N'),
(2, 14, 2, 'Y');

-- Tournament 3: mixed lineup with mid substitute
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(3, 4, 1, 'N'),
(3, 14, 2, 'N'),
(3, 3, 3, 'N'),
(3, 16, 4, 'N'),
(3, 6, 5, 'N'),
(3, 15, 3, 'Y');

-- Tournament 4: starters only
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(4, 13, 1, 'N'),
(4, 7, 2, 'N'),
(4, 15, 3, 'N'),
(4, 5, 4, 'N'),
(4, 17, 5, 'N');

-- Tournament 5: alternate jungler and support reserve
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(5, 4, 1, 'N'),
(5, 9, 2, 'N'),
(5, 3, 3, 'N'),
(5, 5, 4, 'N'),
(5, 17, 5, 'N'),
(5, 8, 2, 'Y');

-- Period 2: September 2025 to December 2025
-- Tournament 6: balanced lineup with top and support subs
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(6, 13, 1, 'N'),
(6, 14, 2, 'N'),
(6, 15, 3, 'N'),
(6, 16, 4, 'N'),
(6, 6, 5, 'N'),
(6, 4, 1, 'Y'),
(6, 17, 5, 'Y');

-- Tournament 7: returning veterans with ADC reserve
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(7, 4, 1, 'N'),
(7, 8, 2, 'N'),
(7, 3, 3, 'N'),
(7, 16, 4, 'N'),
(7, 17, 5, 'N'),
(7, 5, 4, 'Y');

-- Tournament 8: development roster with jungle sub
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(8, 13, 1, 'N'),
(8, 7, 2, 'N'),
(8, 15, 3, 'N'),
(8, 5, 4, 'N'),
(8, 6, 5, 'N'),
(8, 14, 2, 'Y');

-- Tournament 9: aggressive lineup with two reserves
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(9, 4, 1, 'N'),
(9, 14, 2, 'N'),
(9, 3, 3, 'N'),
(9, 5, 4, 'N'),
(9, 17, 5, 'N'),
(9, 9, 2, 'Y'),
(9, 16, 4, 'Y');

-- Tournament 10: late-season lineup with support reserve
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(10, 13, 1, 'N'),
(10, 9, 2, 'N'),
(10, 15, 3, 'N'),
(10, 16, 4, 'N'),
(10, 6, 5, 'N'),
(10, 17, 5, 'Y');

-- Period 3: January 2026 to April 2026
-- Tournament 11: veteran starters with top reserve
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(11, 4, 1, 'N'),
(11, 7, 2, 'N'),
(11, 3, 3, 'N'),
(11, 16, 4, 'N'),
(11, 17, 5, 'N'),
(11, 13, 1, 'Y');

-- Tournament 12: flexible lineup with two substitutes
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(12, 13, 1, 'N'),
(12, 8, 2, 'N'),
(12, 15, 3, 'N'),
(12, 5, 4, 'N'),
(12, 6, 5, 'N'),
(12, 4, 1, 'Y'),
(12, 14, 2, 'Y');

-- Tournament 13: mixed starters with jungle reserve
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(13, 4, 1, 'N'),
(13, 14, 2, 'N'),
(13, 3, 3, 'N'),
(13, 16, 4, 'N'),
(13, 17, 5, 'N'),
(13, 7, 2, 'Y');

-- Tournament 14: academy starters with top reserve
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(14, 13, 1, 'N'),
(14, 9, 2, 'N'),
(14, 15, 3, 'N'),
(14, 5, 4, 'N'),
(14, 6, 5, 'N'),
(14, 4, 1, 'Y');

-- Tournament 15: spring finals lineup with two substitutes
INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
VALUES
(15, 4, 1, 'N'),
(15, 8, 2, 'N'),
(15, 15, 3, 'N'),
(15, 16, 4, 'N'),
(15, 17, 5, 'N'),
(15, 13, 1, 'Y'),
(15, 6, 5, 'Y');