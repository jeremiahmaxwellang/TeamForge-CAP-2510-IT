USE teamforgedb;

-- Team Details
INSERT INTO teamDetails(teamName, teamIcon)
VALUES ('Viridis Arcus', 'VA_logo.png');

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
(3,'tartaros@gmail.com','teamForge123!!','Jotaro','Joestar','Player','hailrain#hailrain','Active'),
(4,'haimehen@gmail.com','teamForge123!!','Jaime','Henry','Player','Coww2#coww2','Active'),
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

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, schoolId, course, lastGPA, CGPA, yearLevel, isSub, teamId, puuid)
VALUES 
(3,'VA Tartaros','VA1','Diamond III','Grandmaster',3,2,'12304219','BSCS-SE','3.4','3.3','3rd Year','F',1,NULL),
(4,'Haimehen','41yk','Diamond IV','Master',1,3,'12445678','BSCS-NIS','3.5','3.2','2nd Year','F',2,NULL),
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
    1,
    NULL
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
    2,
    NULL

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
    1,
    NULL
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
    2,
    NULL
),
(9,'lancr','1226','Emerald I','Diamond II',2,4,'12367890','BSIT','2.1','1.9','2nd Year','F',1, NULL),
(13,'Hoshiyo','2121','Challenger','Challenger',1,2,'12600013','BSND','3.0','3.2','4th Year','F',1,NULL),
(
    14,
    'The Blueprint',
    '000',
    'Challenger',
    'Challenger',
    2,
    1,
    '12600014',
    'BS-ST',
    '2.1',
    '1.9',
    '2nd Year',
    'F',
    1,
    NULL
),
(
    15,
    'Stellar',
    '1105',
    'Challenger',
    'Challenger',
    3,
    5,
    '12600015',
    'BSND',
    '3.0',
    '3.2',
    '4th Year',
    'F',
    1,
    NULL
),
(
    16,
    'one of wun',
    'oste',
    'Master',
    'Challenger',
    4,
    1,
    '12600016',
    'BSCS-ST',
    '3.0',
    '3.2',
    '2nd Year',
    'F',
    1,
    NULL
),
(17,'Maple','091','Challenger','Challenger',5,3,
    '12600017',
    'BSIS',
    '3.0',
    '3.5',
    '4th Year',
    'F',
    1,
    NULL
);

-- -----------------------------------------------------
-- APPLICATION PERIODS (2 weeks each)
-- -----------------------------------------------------
INSERT INTO application_periods (periodId, startDate, endDate) VALUES
(1, '2025-09-01', '2025-09-13'),
(2, '2026-01-26', '2026-02-07'),
(3, '2026-03-21', '2026-04-04'); -- period 3

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

INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status) 
VALUES
(18, 'zero@example.com', 'teamForge123!!', 'Lex', 'Luthor', 'Applicant', 'zero#6983', 'Active'),
(19, 'zayexium@example.com', 'teamForge123!!', 'Barry', 'Allen', 'Applicant', 'Zayexium#ACT', 'Active'),
(20, 'pr1m3put1n@example.com', 'teamForge123!!', 'Tony', 'Tang', 'Applicant', 'Pr1m3put1n#3135', 'Active'),
(21, 'yishun@example.com', 'teamForge123!!', 'Zachary', 'Valjean', 'Applicant', 'Yishun Resident#walao', 'Active'),
(22, 'souhiyori@example.com', 'teamForge123!!', 'Joshua', 'Hiyori', 'Applicant', 'Sou Hiyori#YTTD', 'Active'),
(23, 'venzyx@example.com', 'teamForge123!!', 'Jordan', 'Peele', 'Applicant', 'Venzyx#1432', 'Active'),
(24, 'mrbedroom@example.com', 'teamForge123!!', 'Mikhail', 'Dent', 'Applicant', 'MrBedroom#0000', 'Active');

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, schoolId, course, lastGPA, CGPA, teamId, yearLevel, puuid)
VALUES
(18, 'zero', '6983', 'Diamond I', 'Diamond II', 1, 3, '12100018', 'BSCS-NIS', 3.10, 3.20, 1, '1st Year', NULL),
(19, 'Zayexium', 'ACT', 'Diamond IV', 'Master', 2, 5, '12100019', 'BSCS-NIS', 2.90, 3.00, 1, '4th Year', NULL),
(20, 'Pr1m3put1n', '3135', 'Challenger', 'Challenger', 2, 2, '12100020', 'BSCS-NIS', 3.40, 3.50, 1, '4th Year', NULL),
(21, 'Yishun Resident', 'walao', 'Diamond II', 'Diamond III', 3, 3, '12100021', 'BSCS-NIS', 3.00, 3.05, 1, '2nd Year', NULL),
(22, 'Sou Hiyori', 'YTTD', 'Challenger', 'Challenger', 3, 1, '12100022', 'BSCS-NIS', 3.20, 3.25, 1, '1st Year', NULL),
(23, 'Venzyx', '1432', 'Diamond II', 'Diamond III', 4, 5, '12100023', 'BSCS-NIS', 3.35, 3.40, 1, '3rd Year', NULL),
(24, 'MrBedroom', '0000', 'Diamond I', 'Challenger', 5, 5, '12100024', 'BSCS-NIS', 2.50, 2.60, 1, '2nd Year', NULL);

INSERT INTO applications (periodId, userId, primaryRoleId, status) 
VALUES
(3, 18, 1, 'Pending'),
(3, 19, 2, 'Pending'),
(3, 20, 2, 'Pending'),
(3, 21, 3, 'Pending'),
(3, 22, 3, 'Pending'),
(3, 23, 4, 'Pending'),
(3, 24, 5, 'Pending');

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
-- EVENTS: SCRIMS
-- -----------------------------------------------------
-- Scrim Event 1
INSERT INTO events (title_summary, type, location, start_date, status)
VALUES ('Viridis Arcus vs. Justice League', 'Scrim', 'Online', '2026-03-01', 'evaluated');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status)
VALUES (18, 4, 1, 'Present'), (18, 7, 2, 'Present'), (18, 3, 3, 'Present'), (18, 5, 4, 'Present'), (18, 6, 5, 'Present');

-- Scrim Event 2
INSERT INTO events (title_summary, type, location, start_date, status)
VALUES ('Viridis Arcus vs. Avengers', 'Scrim', 'Online', '2026-03-02', 'evaluated');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status)
VALUES (19, 13, 1, 'Present'), (19, 14, 2, 'Present'), (19, 15, 3, 'Present'), (19, 9, 4, 'Present'), (19, 17, 5, 'Present');

-- Scrim Event 3
INSERT INTO events (title_summary, type, location, start_date, status)
VALUES ('Viridis Arcus vs. X-Men', 'Scrim', 'Online', '2026-03-03', 'evaluated');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status)
VALUES (20, 4, 1, 'Present'), (20, 7, 2, 'Present'), (20, 15, 3, 'Present'), (20, 5, 4, 'Present'), (20, 6, 5, 'Present');

-- Scrim Event 4
INSERT INTO events (title_summary, type, location, start_date, status)
VALUES ('Viridis Arcus vs. Fantastic Four', 'Scrim', 'Online', '2026-03-04', 'evaluated');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status)
VALUES (21, 13, 1, 'Present'), (21, 14, 2, 'Present'), (21, 3, 3, 'Present'), (21, 16, 4, 'Present'), (21, 6, 5, 'Present');

-- Scrim Event 5
INSERT INTO events (title_summary, type, location, start_date, status)
VALUES ('Viridis Arcus vs. Guardians of the Galaxy', 'Scrim', 'Online', '2026-03-05', 'evaluated');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status)
VALUES (22, 4, 1, 'Present'), (22, 7, 2, 'Present'), (22, 14, 3, 'Present'), (22, 9, 4, 'Present'), (22, 17, 5, 'Present');

-- Scrim Event 6
INSERT INTO events (title_summary, type, location, start_date, status)
VALUES ('Viridis Arcus vs. Teen Titans', 'Scrim', 'Online', '2026-03-06', 'evaluated');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status)
VALUES (23, 13, 1, 'Present'), (23, 7, 2, 'Present'), (23, 15, 3, 'Present'), (23, 5, 4, 'Present'), (23, 6, 5, 'Present');

-- Scrim Event 7
INSERT INTO events (title_summary, type, location, start_date, status)
VALUES ('Viridis Arcus vs. Watchmen', 'Scrim', 'Online', '2026-03-07', 'evaluated');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status)
VALUES (24, 4, 1, 'Present'), (24, 14, 2, 'Present'), (24, 3, 3, 'Present'), (24, 16, 4, 'Present'), (24, 17, 5, 'Present');

-- Scrim Event 8
INSERT INTO events (title_summary, type, location, start_date, status)
VALUES ('Viridis Arcus vs. Incredibles', 'Scrim', 'Online', '2026-03-08', 'evaluated');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status)
VALUES (25, 13, 1, 'Present'), (25, 7, 2, 'Present'), (25, 14, 3, 'Present'), (25, 9, 4, 'Present'), (25, 6, 5, 'Present');

-- Scrim Event 9
INSERT INTO events (title_summary, type, location, start_date, status)
VALUES ('Viridis Arcus vs. Defenders', 'Scrim', 'Online', '2026-03-09', 'evaluated');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status)
VALUES (26, 4, 1, 'Present'), (26, 7, 2, 'Present'), (26, 15, 3, 'Present'), (26, 5, 4, 'Present'), (26, 17, 5, 'Present');

-- Scrim Event 10
INSERT INTO events (title_summary, type, location, start_date, status)
VALUES ('Viridis Arcus vs. Dark Avengers', 'Scrim', 'Online', '2026-03-10', 'evaluated');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status)
VALUES (27, 13, 1, 'Present'), (27, 14, 2, 'Present'), (27, 3, 3, 'Present'), (27, 16, 4, 'Present'), (27, 6, 5, 'Present');

-- Scrim 1 (eventId = 18) – 5star bad
INSERT INTO player_evaluations (eventId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(18, 7, 'Struggled to coordinate, poor comms', 2, 1, 2, 2),
(18, 4, 'Top laner gave good calls', 3, 4, 3, 2),
(18, 3, 'Mid laner average comms', 3, 3, 3, 2),
(18, 5, 'ADC vocal early, quiet late', 3, 2, 4, 2),
(18, 6, 'Support steady comms', 3, 4, 3, 2);

-- Scrim 2 (eventId = 19) – Blueprint good
INSERT INTO player_evaluations VALUES
(19, 14, 'Excellent shotcalling, clear comms', 5, 5, 4, 2),
(19, 13, 'Top laner weak comms', 2, 2, 2, 2),
(19, 15, 'Mid laner strong comms', 4, 4, 4, 2),
(19, 9, 'ADC average', 3, 3, 3, 2),
(19, 17, 'Support vocal', 4, 4, 4, 2);

-- Scrim 3 (eventId = 20) – 5star bad
INSERT INTO player_evaluations VALUES
(20, 7, 'Minimal communication, lacked presence', 2, 1, 2, 2),
(20, 4, 'Top laner silent this game', 3, 2, 3, 2),
(20, 15, 'Mid laner strong comms', 4, 5, 4, 2),
(20, 5, 'ADC average comms', 3, 3, 3, 2),
(20, 6, 'Support weak comms', 2, 2, 2, 2);

-- Scrim 4 (eventId = 21) – Blueprint good
INSERT INTO player_evaluations VALUES
(21, 14, 'Strong comms, decisive calls', 4, 5, 4, 2),
(21, 13, 'Top laner improved comms', 3, 3, 3, 2),
(21, 3, 'Mid laner steady', 3, 4, 3, 2),
(21, 16, 'ADC poor comms', 2, 1, 2, 2),
(21, 6, 'Support strong comms', 4, 5, 4, 2);

-- Scrim 5 (eventId = 22) – both present
INSERT INTO player_evaluations VALUES
(22, 7, 'Some comms but inconsistent', 3, 2, 3, 2),
(22, 14, 'Clear communication, good synergy', 4, 4, 4, 2),
(22, 4, 'Top laner vocal', 4, 4, 4, 2),
(22, 9, 'ADC average', 3, 3, 3, 2),
(22, 17, 'Support strong', 4, 5, 4, 2);

-- Scrim 6 (eventId = 23) – 5star bad
INSERT INTO player_evaluations VALUES
(23, 7, 'Barely spoke, weak comms', 2, 1, 2, 2),
(23, 13, 'Top laner average', 3, 3, 3, 2),
(23, 15, 'Mid laner vocal', 4, 4, 4, 2),
(23, 5, 'ADC weak comms', 2, 2, 2, 2),
(23, 6, 'Support average', 3, 3, 3, 2);

-- Scrim 7 (eventId = 24) – Blueprint good
INSERT INTO player_evaluations VALUES
(24, 14, 'Excellent comms, led rotations well', 5, 5, 4, 2),
(24, 4, 'Top laner strong', 4, 5, 4, 2),
(24, 3, 'Mid laner average', 3, 3, 3, 2),
(24, 16, 'ADC poor comms', 2, 1, 2, 2),
(24, 17, 'Support steady', 3, 4, 3, 2);

-- Scrim 8 (eventId = 25) – both present
INSERT INTO player_evaluations VALUES
(25, 7, 'Silent again, poor coordination', 2, 1, 2, 2),
(25, 14, 'Good comms, steady shotcalling', 4, 4, 4, 2),
(25, 13, 'Top laner weak', 2, 2, 2, 2),
(25, 9, 'ADC average', 3, 3, 3, 2),
(25, 6, 'Support vocal', 4, 4, 4, 2);

-- Scrim 9 (eventId = 26) – 5star bad
INSERT INTO player_evaluations VALUES
(26, 7, 'Some comms but weak', 3, 2, 3, 2),
(26, 4, 'Top laner average', 3, 3, 3, 2),
(26, 15, 'Mid laner strong', 4, 4, 4, 2),
(26, 5, 'ADC weak', 2, 2, 2, 2),
(26, 17, 'Support strong', 4, 5, 4, 2);

-- Scrim 10 (eventId = 27) – Blueprint good
INSERT INTO player_evaluations VALUES
(27, 14, 'Strong comms, very vocal', 5, 5, 4, 2),
(27, 13, 'Top laner vocal', 4, 4, 4, 2),
(27, 3, 'Mid laner average', 3, 3, 3, 2),
(27, 16, 'ADC strong', 4, 5, 4, 2),
(27, 6, 'Support weak', 2, 2, 2, 2);


-- -----------------------------------------------------
-- EVENTS: TOURNAMENTS
-- -----------------------------------------------------

-- Period 1: May 2025 to August 2025
INSERT INTO events (eventId, title_summary, type, location, start_date, end_date, win, status)
VALUES
(28, 'May Kickoff Clash', 'Tournament', 'Online', '2025-05-17', '2025-05-18', 'W', 'completed'),
(29, 'June Rift Gauntlet', 'Tournament', 'Online', '2025-06-07', '2025-06-08', 'L', 'completed'),
(30, 'June Campus Showdown', 'Tournament', 'Campus Arena', '2025-06-28', '2025-06-29', 'N/A', 'completed'),
(31, 'July Collegiate Cup', 'Tournament', 'Online', '2025-07-19', '2025-07-20', 'W', 'completed'),
(32, 'August Finals Qualifier', 'Tournament', 'Online', '2025-08-09', '2025-08-10', 'L', 'completed'),
(33, 'May Thunderstrike', 'Tournament', 'Online', '2025-05-24', '2025-05-25', 'W', 'completed'),
(34, 'June Rift Showdown', 'Tournament', 'Online', '2025-06-14', '2025-06-15', 'W', 'completed'),
(35, 'July Clash Series', 'Tournament', 'Online', '2025-07-05', '2025-07-06', 'W', 'completed'),
(36, 'July Lightning Cup', 'Tournament', 'Online', '2025-07-26', '2025-07-27', 'W', 'completed'),
(37, 'August Rift Qualifier', 'Tournament', 'Online', '2025-08-16', '2025-08-17', 'L', 'completed');

-- Period 2: September 2025 to December 2025
INSERT INTO events VALUES
(38, 'September Open Series', 'Tournament', 'Online', '2025-09-06', '2025-09-07', 'N/A', 'completed'),
(39, 'October Rift Rumble', 'Tournament', 'Online', '2025-10-04', '2025-10-05', 'W', 'completed'),
(40, 'October Nexus Trials', 'Tournament', 'Online', '2025-10-25', '2025-10-26', 'L', 'completed'),
(41, 'November Varsity Cup', 'Tournament', 'Online', '2025-11-15', '2025-11-16', 'W', 'completed'),
(42, 'December Invitational', 'Tournament', 'Online', '2025-12-06', '2025-12-07', 'N/A', 'completed'),
(43, 'September Rift Challenge', 'Tournament', 'Online', '2025-09-20', '2025-09-21', 'W', 'completed'),
(44, 'October Clash Invitational', 'Tournament', 'Online', '2025-10-18', '2025-10-19', 'L', 'completed'),
(45, 'November Open Cup', 'Tournament', 'Online', '2025-11-08', '2025-11-09', 'W', 'completed'),
(46, 'November Nexus Brawl', 'Tournament', 'Online', '2025-11-29', '2025-11-30', 'L', 'completed'),
(47, 'December Year-End Series', 'Tournament', 'Online', '2025-12-20', '2025-12-21', 'N/A', 'completed');

-- Period 3: January 2026 to April 2026
INSERT INTO events VALUES
(48, 'January Season Opener', 'Tournament', 'Online', '2026-01-17', '2026-01-18', 'L', 'completed'),
(49, 'February Rift Cup', 'Tournament', 'Online', '2026-02-07', '2026-02-08', 'W', 'completed'),
(50, 'March Midseason Clash', 'Tournament', 'Online', '2026-03-07', '2026-03-08', 'N/A', 'completed'),
(51, 'April Academy Cup', 'Tournament', 'Online', '2026-04-04', '2026-04-05', 'W', 'completed'),
(52, 'Spring Crown Finals', 'Tournament', 'Online', '2026-04-18', '2026-04-19', 'L', 'completed'),
(53, 'February Rift Trials', 'Tournament', 'Online', '2026-01-31', '2026-02-01', 'L', 'completed'),
(54, 'February Crown Series', 'Tournament', 'Online', '2026-02-21', '2026-02-22', 'L', 'completed'),
(55, 'March Gauntlet Cup', 'Tournament', 'Online', '2026-03-21', '2026-03-22', 'L', 'completed'),
(56, 'April Rift Revival', 'Tournament', 'Online', '2026-04-11', '2026-04-12', 'W', 'completed'),
(57, 'April Final Showdown', 'Tournament', 'Online', '2026-04-25', '2026-04-26', 'L', 'completed');



-- Tournament 16 → Event 43 attendees
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub)
VALUES
(43, 4, 1, 'Present', 'N'),
(43, 7, 2, 'Present', 'N'),
(43, 3, 3, 'Present', 'N'),
(43, 5, 4, 'Present', 'N'),
(43, 6, 5, 'Present', 'N'),
(43, 8, 2, 'Excused', 'Y');

-- Tournament 17 → Event 44 attendees
INSERT INTO event_attendees VALUES
(44, 4, 1, 'Present', 'N'),
(44, 7, 2, 'Present', 'N'),
(44, 15, 3, 'Present', 'N'),
(44, 5, 4, 'Present', 'N'),
(44, 17, 5, 'Present', 'N'),
(44, 13, 1, 'Excused', 'Y');

-- Tournament 18 → Event 45 attendees
INSERT INTO event_attendees VALUES
(45, 13, 1, 'Present', 'N'),
(45, 7, 2, 'Present', 'N'),
(45, 3, 3, 'Present', 'N'),
(45, 5, 4, 'Present', 'N'),
(45, 6, 5, 'Present', 'N'),
(45, 4, 1, 'Excused', 'Y');

-- Tournament 19 → Event 46 attendees
INSERT INTO event_attendees VALUES
(46, 4, 1, 'Present', 'N'),
(46, 14, 2, 'Present', 'N'),
(46, 3, 3, 'Present', 'N'),
(46, 16, 4, 'Present', 'N'),
(46, 17, 5, 'Present', 'N'),
(46, 7, 2, 'Excused', 'Y');

-- Tournament 20 → Event 47 attendees
INSERT INTO event_attendees VALUES
(47, 13, 1, 'Present', 'N'),
(47, 9, 2, 'Present', 'N'),
(47, 15, 3, 'Present', 'N'),
(47, 16, 4, 'Present', 'N'),
(47, 6, 5, 'Present', 'N');

-- Tournament 21 → Event 48 attendees
INSERT INTO event_attendees VALUES
(48, 4, 1, 'Present', 'N'),
(48, 8, 2, 'Present', 'N'),
(48, 3, 3, 'Present', 'N'),
(48, 5, 4, 'Present', 'N'),
(48, 17, 5, 'Present', 'N'),
(48, 13, 1, 'Excused', 'Y');

-- Tournament 22 → Event 49 attendees
INSERT INTO event_attendees VALUES
(49, 13, 1, 'Present', 'N'),
(49, 7, 2, 'Present', 'N'),
(49, 15, 3, 'Present', 'N'),
(49, 16, 4, 'Present', 'N'),
(49, 6, 5, 'Present', 'N'),
(49, 9, 2, 'Excused', 'Y');

-- Tournament 23 → Event 50 attendees
INSERT INTO event_attendees VALUES
(50, 4, 1, 'Present', 'N'),
(50, 14, 2, 'Present', 'N'),
(50, 3, 3, 'Present', 'N'),
(50, 5, 4, 'Present', 'N'),
(50, 17, 5, 'Present', 'N');

-- Tournament 24 → Event 51 attendees
INSERT INTO event_attendees VALUES
(51, 13, 1, 'Present', 'N'),
(51, 9, 2, 'Present', 'N'),
(51, 15, 3, 'Present', 'N'),
(51, 16, 4, 'Present', 'N'),
(51, 6, 5, 'Present', 'N'),
(51, 4, 1, 'Excused', 'Y');

-- Tournament 25 → Event 52 attendees
INSERT INTO event_attendees VALUES
(52, 4, 1, 'Present', 'N'),
(52, 8, 2, 'Present', 'N'),
(52, 3, 3, 'Present', 'N'),
(52, 5, 4, 'Present', 'N'),
(52, 17, 5, 'Present', 'N'),
(52, 7, 2, 'Excused', 'Y'),
(52, 6, 5, 'Excused', 'Y');

-- Tournament 26 → Event 53 attendees
INSERT INTO event_attendees VALUES
(53, 4, 1, 'Present', 'N'),
(53, 7, 2, 'Present', 'N'),
(53, 3, 3, 'Present', 'N'),
(53, 16, 4, 'Present', 'N'),
(53, 17, 5, 'Present', 'N'),
(53, 13, 1, 'Excused', 'Y');

-- Tournament 27 → Event 54 attendees
INSERT INTO event_attendees VALUES
(54, 13, 1, 'Present', 'N'),
(54, 9, 2, 'Present', 'N'),
(54, 15, 3, 'Present', 'N'),
(54, 5, 4, 'Present', 'N'),
(54, 6, 5, 'Present', 'N');

-- Tournament 28 → Event 55 attendees
INSERT INTO event_attendees VALUES
(55, 4, 1, 'Present', 'N'),
(55, 14, 2, 'Present', 'N'),
(55, 3, 3, 'Present', 'N'),
(55, 16, 4, 'Present', 'N'),
(55, 17, 5, 'Present', 'N'),
(55, 7, 2, 'Excused', 'Y');

-- Tournament 29 → Event 56 attendees
INSERT INTO event_attendees VALUES
(56, 13, 1, 'Present', 'N'),
(56, 8, 2, 'Present', 'N'),
(56, 15, 3, 'Present', 'N'),
(56, 5, 4, 'Present', 'N'),
(56, 6, 5, 'Present', 'N'),
(56, 4, 1, 'Excused', 'Y');

-- Tournament 30 → Event 57 attendees
INSERT INTO event_attendees VALUES
(57, 4, 1, 'Present', 'N'),
(57, 7, 2, 'Present', 'N'),
(57, 3, 3, 'Present', 'N'),
(57, 16, 4, 'Present', 'N'),
(57, 6, 5, 'Present', 'N'),
(57, 9, 2, 'Excused', 'Y'),
(57, 17, 5, 'Excused', 'Y');