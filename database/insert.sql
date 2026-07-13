USE teamforgedb;

-- Team Details
INSERT INTO teamdetails(teamName, teamIcon, schoolName, schoolIcon)
VALUES ('My Team', 'Team_Logo.png', 'My University', 'school_logo.png');

-- League Roles
INSERT INTO leagueroles(roleId, displayedRole, role, teamPosition)
VALUES 
(1, 'Top', 'NONE', 'TOP'),
(2, 'Jungle', 'NONE', 'JUNGLE'),
(3, 'Mid', 'SOLO', 'MIDDLE'),
(4, 'AD Carry', 'CARRY', 'BOTTOM'),
(5, 'Support', 'SUPPORT', 'UTILITY');

-- Manager
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status) 
VALUES 
(1,'jeremiah_ang@dlsu.edu.ph','teamForge123!!','Jeremiah','Ang','Team Manager','Cowwrean#cowwrean','Active'),
(35,'manager1@test.com','teamForge123!!','Manager','One','Team Manager','Manager#1','Active'),
(36,'manager2@test.com','teamForge123!!','Manager','Two','Team Manager','Manager#2','Active'),
(25,'justin_nicolai_lee@dlsu.edu.ph','teamForge123!!','Justin','Lee','Team Manager','justinlee#1234','Active');

-- Coach 
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status) 
VALUES 
(2,'charles_duelas@dlsu.edu.ph','teamForge123!!','Charles','Duelas','Team Coach','AgentDuelly#agentduelly','Active'),
(37,'coach1@test.com','teamForge123!!','Coach','One','Team Coach','coach#1','Active')
-- (38,'coach2@test.com','teamForge123!!','Coach','Two','Team Coach','coach#2','Active'),
-- (39,'coach3@test.com','teamForge123!!','Coach','Three','Team Coach','coach#3','Active'),
-- (40,'coach4@test.com','teamForge123!!','Coach','Four','Team Coach','coach#4','Active')
;

-- -----------------------------------------------------
-- ANNOUNCEMENTS
-- -----------------------------------------------------
INSERT INTO announcements
    (`userId`, `title`, `content`, `dateCreated`)
VALUES
    (2, 'Recruitment Period Coming Soon', 'The recruitment period will begin soon on July 13. Please stay posted for details.', NOW());

-- Players
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status) 
VALUES 
(3,'tartaros@gmail.com','teamForge123!!','Jotaro','Joestar','Player','hailrain#hailrain','Active'),
(4,'haimehen@gmail.com','teamForge123!!','Jaime','Henry','Player','Coww2#coww2','Deactivated'),
(5,'kalachuchi@gmail.com','teamForge123!!','Wendy','Chuchi','Player','Cowwean#cowwrean','Active'),
(6,'vacrowned@gmail.com','teamForge123!!','Crow','Ned','Player','syl#syl','Active'),
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
-- Hoshiyo
(13,'hailrain.developer@gmail.com','teamForge123!!','Hoshiyo','Yoshida','Player','Hailrain#12','Active'),
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

-- -----------------------------------------------------
-- ADDITIONAL USERS
-- -----------------------------------------------------
INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status) 
VALUES 
(26, 'dutchman@ust.edu.ph', 'teamForge123!!', 'Dutch', 'Murray', 'Player', 'Flying Dutchman#GUARD', 'Active'),
(27, 'easy_eddie@ust.edu.ph', 'teamForge123!!', 'Easy', 'Eddie', 'Player', 'EasyEddie#1234', 'Active'),
(28, 'panix@ust.edu.ph', 'teamForge123!!', 'panix', 'burn', 'Player', 'panix#theburn', 'Active'),
(29, 'asterx_mizu@ust.edu.ph', 'teamForge123!!', 'Asterux', 'Mizu', 'Player', 'panix#theburn', 'Active'),
(30, 'rinku_ai@ust.edu.ph', 'teamForge123!!', 'Rinku', 'AI', 'Player', 'RinkuAI#1234', 'Active'),
(31, 'mors@ust.edu.ph', 'teamForge123!!', 'Rinku', 'AI', 'Player', 'MORS#1234', 'Active'),
(32, 'jade@ust.edu.ph', 'teamForge123!!', 'Jade', 'Hook', 'Player', 'jade#1234', 'Active'),
(33, 'carebears@ust.edu.ph', 'teamForge123!!', 'Ashura', 'Goat', 'Player', 'caredto#4102', 'Active'),
(34, 'magsin_keso@ust.edu.ph', 'teamForge123!!', 'Magsin', 'Keso', 'Player', 'Magsin#Keso', 'Active');

INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, schoolId, course, lastGPA, CGPA, yearLevel, isSub, teamId, puuid)
VALUES 
(3,'VA Tartaros','VA1','Diamond III','Grandmaster',3,2,'12304219','BSCS-SE','3.4','3.3','3rd Year','F',1,NULL),
(4,'Haimehen','41yk','Diamond IV','Master',1,3,'12445678','BSCS-NIS','3.5','3.2','2nd Year','F',2,NULL),
(5,'Kalachuchi','Wendy','Emerald I','Diamond IV',4,5,'12254321','BSIT','3.1','2.9','4th Year','F',1,NULL),
(6,'VA Crowned','1013','Emerald III','Diamond III', 5,5,'12387654', 'BSND', '3.5','3.2','3rd Year','F',2,NULL),
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
(9,'lancr','1226','Emerald I','Diamond II',2,4,'12367890','BSIT','2.1','1.9','4th Year','F',1, NULL),
-- Hoshiyo
(13,'Hoshiyo','2121','Challenger','Challenger',1,2,'12600013','BSND','3.0','3.2','4th Year','F',1,NULL),
(14,'The Blueprint','000','Challenger','Challenger',2,1,'12600014','BS-ST','2.1','1.9','2nd Year','F',1,NULL),
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
    '4th Year',
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
-- ADDITIONAL PLAYERS
-- -----------------------------------------------------
INSERT INTO players(userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, schoolId, course, lastGPA, CGPA, yearLevel, isSub, teamId, puuid)
VALUES 
-- Flying Dutchman#GUARD
(26, 'Flying Dutchman', 'GUARD', 'Diamond I', 'Master', 1, 4, '12345678', 'BSIT', '3.2', '4.0', '4th Year', 'F', 1, NULL),

-- Easy Eddie#1111
(27, 'Easy Eddie', '1111', 'Diamond I', 'Grandmaster', 2, 1, '12345678', 'BSIT', '3.2', '4.0', '3rd Year', 'F', 1, NULL),

-- Panix#burnn
(28, 'Panix', 'burnn', 'Platinum I', 'Platinum I', 3, 5, NULL, 'N/A', '0.0', '0.0', 'N/A', 'F', 1, NULL),

-- Asterux#mizu
(29, 'Asterux', 'mizu', 'Emerald III', 'Platinum I', 2, 1, NULL, 'N/A', '0.0', '0.0', 'N/A', 'F', 1, NULL),

-- MORS#41819
(31, 'MORS', '41819', 'Diamond II', 'Diamond I', 4, 1, NULL, 'N/A', '0.0', '0.0', 'N/A', 'F', 1, NULL),

-- na hook si jade#poopp
(32, 'na hook si jade', 'poopp', 'Platinum III', 'Platinum III', 1, 5, NULL, 'N/A', '0.0', '0.0', 'N/A', 'F', 1, NULL),

-- caredto#kedto (ID adjusted to 33 to avoid conflict)
(33, 'caredto', 'kedto', 'Master I', 'Challenger', 2, 1, NULL, 'N/A', '0.0', '0.0', 'N/A', 'F', 1, NULL),
(34, 'Magsin', 'Keso', 'Diamond IV', 'Master I', 1, 2, '12299999', 'BSCS', '3.0', '3.0', '3rd Year', 'F', 1, NULL);

-- -----------------------------------------------------
-- APPLICATION PERIODS (2 weeks each)
-- -----------------------------------------------------
INSERT INTO application_periods (periodId, startDate, endDate) VALUES
(1, '2025-07-10', '2025-07-20'),
(2, '2026-01-10', '2026-01-26'),
(3, '2026-07-13', '2026-08-10'); -- period 3

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

-- Seeded/preexisting accounts should not be forced to change password on first login.
-- Newly created users still keep the schema/application default of firstLogin = 1.
UPDATE users
SET firstLogin = 0
WHERE userId BETWEEN 1 AND 33;

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
-- APPLICATION PERIOD 3 EVALUATIONS (Bad)
-- -----------------------------------------------------

INSERT INTO applicantevaluations (userId, coachId, comment, ratingGameSense, ratingCommunication, ratingChampionPool)
VALUES
(18, 2, 'Top/Mid trial: made several unforced trades and misread wave states, leading to early deaths. Comms were sparse and reactive rather than proactive, though he does have a wide champion pool to work with.', 2, 1, 4),
(19, 2, 'Jungle/Support trial: pathing was predictable and got counter-jungled repeatedly. Support reps showed hesitant ward placement, but callouts once fights started were clear.', 1, 5, 2),
(20, 2, 'Jungle/Jungle trial: struggled to track enemy jungler and gave up multiple objectives uncontested. Champion pool felt one-dimensional, defaulted to the same pick both games.', 2, 2, 1),
(21, 2, 'Mid/Mid trial: fell behind in lane both games and didn''t adjust playstyle after falling behind. Very little callouts on enemy jungle pressure, but showed a decent variety of picks across both games.', 1, 1, 3),
(22, 2, 'Mid/Top trial: mechanically shaky in lane, missed several key ability combos. Communication was minimal, mostly silent during skirmishes, though game sense around objectives was passable.', 3, 1, 2),
(23, 2, 'ADC/Support trial: positioning in teamfights was consistently too aggressive, died early in most engagements. Support pairing lacked coordination, though the champion pool covered most matchups.', 2, 4, 4),
(24, 2, 'Support/Support trial: one-trick on Teemo severely limited draft flexibility, opponents banned it out with ease in game 2. Game sense on wards and rotations was otherwise solid.', 4, 3, 1);

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
INSERT INTO metricroles (metricId, roleId) VALUES
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
INSERT INTO metricroles (metricId, roleId) VALUES
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
INSERT INTO metricroles (metricId, roleId) VALUES
(26,3),  -- averageWinrate
(4,3),   -- averageCsPerMinute
(11,3),  -- averageGoldPerMinute
(13,3),  -- averageKillParticipation
(14,3),  -- averageKills
(7,3),   -- averageDeaths
(2,3),   -- averageAssists
(5,3);   -- averageDamageShare

-- 4. ADC
INSERT INTO metricroles (metricId, roleId) VALUES
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
INSERT INTO metricroles (metricId, roleId) VALUES
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
-- EVENTS: SCRIMS (dates spread Aug 2025 -> Jul 20 2026)
-- -----------------------------------------------------
-- Scrim Event 1
INSERT INTO events (title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES ('UST Teletigers vs. Justice League', 'Scrim', 'Online', '2025-08-01', '2025-08-01', 'N/A', 'evaluated', 2, '2025-08-01 18:00:00', '2025-08-01 20:30:00');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES (18, 4, 1, 'Present', 'N', 'Team 1'), (18, 7, 2, 'Present', 'N', 'Team 1'), (18, 3, 3, 'Present', 'N', 'Team 1'), (18, 5, 4, 'Present', 'N', 'Team 1'), (18, 6, 5, 'Present', 'N', 'Team 1'),
(18, 13, 1, 'Present', 'N', 'Team 2'), (18, 14, 2, 'Present', 'N', 'Team 2'), (18, 15, 3, 'Present', 'N', 'Team 2'), (18, 9, 4, 'Present', 'N', 'Team 2'), (18, 17, 5, 'Present', 'N', 'Team 2');

-- Scrim Event 2
INSERT INTO events (title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES ('UST Teletigers vs. Avengers', 'Scrim', 'Online', '2025-09-05', '2025-09-05', 'N/A', 'evaluated', 2, '2025-09-05 18:00:00', '2025-09-05 20:30:00');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES (19, 13, 1, 'Present', 'N', 'Team 1'), (19, 14, 2, 'Present', 'N', 'Team 1'), (19, 15, 3, 'Present', 'N', 'Team 1'), (19, 9, 4, 'Present', 'N', 'Team 1'), (19, 17, 5, 'Present', 'N', 'Team 1'),
(19, 4, 1, 'Present', 'N', 'Team 2'), (19, 7, 2, 'Present', 'N', 'Team 2'), (19, 3, 3, 'Present', 'N', 'Team 2'), (19, 5, 4, 'Present', 'N', 'Team 2'), (19, 6, 5, 'Present', 'N', 'Team 2');

-- Scrim Event 3
INSERT INTO events (title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES ('UST Teletigers vs. X-Men', 'Scrim', 'Online', '2025-10-10', '2025-10-10', 'N/A', 'evaluated', 2, '2025-10-10 18:00:00', '2025-10-10 20:30:00');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES (20, 4, 1, 'Present', 'N', 'Team 1'), (20, 7, 2, 'Present', 'N', 'Team 1'), (20, 15, 3, 'Present', 'N', 'Team 1'), (20, 5, 4, 'Present', 'N', 'Team 1'), (20, 6, 5, 'Present', 'N', 'Team 1'),
(20, 13, 1, 'Present', 'N', 'Team 2'), (20, 14, 2, 'Present', 'N', 'Team 2'), (20, 3, 3, 'Present', 'N', 'Team 2'), (20, 9, 4, 'Present', 'N', 'Team 2'), (20, 17, 5, 'Present', 'N', 'Team 2');

-- Scrim Event 4
INSERT INTO events (title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES ('UST Teletigers vs. Fantastic Four', 'Scrim', 'Online', '2025-11-15', '2025-11-15', 'N/A', 'evaluated', 2, '2025-11-15 18:00:00', '2025-11-15 20:30:00');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES (21, 13, 1, 'Present', 'N', 'Team 1'), (21, 14, 2, 'Present', 'N', 'Team 1'), (21, 3, 3, 'Present', 'N', 'Team 1'), (21, 16, 4, 'Present', 'N', 'Team 1'), (21, 6, 5, 'Present', 'N', 'Team 1'),
(21, 4, 1, 'Present', 'N', 'Team 2'), (21, 7, 2, 'Present', 'N', 'Team 2'), (21, 15, 3, 'Present', 'N', 'Team 2'), (21, 5, 4, 'Present', 'N', 'Team 2'), (21, 17, 5, 'Present', 'N', 'Team 2');

-- Scrim Event 5
INSERT INTO events (title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES ('UST Teletigers vs. Guardians of the Galaxy', 'Scrim', 'Online', '2025-12-20', '2025-12-20', 'N/A', 'evaluated', 2, '2025-12-20 18:00:00', '2025-12-20 20:30:00');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES (22, 4, 1, 'Present', 'N', 'Team 1'), (22, 7, 2, 'Present', 'N', 'Team 1'), (22, 14, 3, 'Present', 'N', 'Team 1'), (22, 9, 4, 'Present', 'N', 'Team 1'), (22, 17, 5, 'Present', 'N', 'Team 1'),
(22, 13, 1, 'Present', 'N', 'Team 2'), (22, 15, 3, 'Present', 'N', 'Team 2'), (22, 3, 3, 'Present', 'N', 'Team 2'), (22, 5, 4, 'Present', 'N', 'Team 2'), (22, 6, 5, 'Present', 'N', 'Team 2');

-- Scrim Event 6
INSERT INTO events (title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES ('UST Teletigers vs. Teen Titans', 'Scrim', 'Online', '2026-01-24', '2026-01-24', 'N/A', 'evaluated', 2, '2026-01-24 18:00:00', '2026-01-24 20:30:00');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES (23, 13, 1, 'Present', 'N', 'Team 1'), (23, 7, 2, 'Present', 'N', 'Team 1'), (23, 15, 3, 'Present', 'N', 'Team 1'), (23, 5, 4, 'Present', 'N', 'Team 1'), (23, 6, 5, 'Present', 'N', 'Team 1'),
(23, 4, 1, 'Present', 'N', 'Team 2'), (23, 14, 2, 'Present', 'N', 'Team 2'), (23, 3, 3, 'Present', 'N', 'Team 2'), (23, 9, 4, 'Present', 'N', 'Team 2'), (23, 17, 5, 'Present', 'N', 'Team 2');

-- Scrim Event 7
INSERT INTO events (title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES ('UST Teletigers vs. Watchmen', 'Scrim', 'Online', '2026-03-01', '2026-03-01', 'N/A', 'evaluated', 2, '2026-03-01 18:00:00', '2026-03-01 20:30:00');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES (24, 4, 1, 'Present', 'N', 'Team 1'), (24, 14, 2, 'Present', 'N', 'Team 1'), (24, 3, 3, 'Present', 'N', 'Team 1'), (24, 16, 4, 'Present', 'N', 'Team 1'), (24, 17, 5, 'Present', 'N', 'Team 1'),
(24, 13, 1, 'Present', 'N', 'Team 2'), (24, 7, 2, 'Present', 'N', 'Team 2'), (24, 15, 3, 'Present', 'N', 'Team 2'), (24, 5, 4, 'Present', 'N', 'Team 2'), (24, 6, 5, 'Present', 'N', 'Team 2');

-- Scrim Event 8
INSERT INTO events (title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES ('UST Teletigers vs. Incredibles', 'Scrim', 'Online', '2026-04-05', '2026-04-05', 'N/A', 'evaluated', 2, '2026-04-05 18:00:00', '2026-04-05 20:30:00');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES (25, 13, 1, 'Present', 'N', 'Team 1'), (25, 7, 2, 'Present', 'N', 'Team 1'), (25, 14, 3, 'Present', 'N', 'Team 1'), (25, 9, 4, 'Present', 'N', 'Team 1'), (25, 6, 5, 'Present', 'N', 'Team 1'),
(25, 4, 1, 'Present', 'N', 'Team 2'), (25, 15, 3, 'Present', 'N', 'Team 2'), (25, 3, 3, 'Present', 'N', 'Team 2'), (25, 5, 4, 'Present', 'N', 'Team 2'), (25, 17, 5, 'Present', 'N', 'Team 2');

-- Scrim Event 9
INSERT INTO events (title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES ('UST Teletigers vs. Defenders', 'Scrim', 'Online', '2026-05-10', '2026-05-10', 'N/A', 'evaluated', 2, '2026-05-10 18:00:00', '2026-05-10 20:30:00');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES (26, 4, 1, 'Present', 'N', 'Team 1'), (26, 7, 2, 'Present', 'N', 'Team 1'), (26, 15, 3, 'Present', 'N', 'Team 1'), (26, 5, 4, 'Present', 'N', 'Team 1'), (26, 17, 5, 'Present', 'N', 'Team 1'),
(26, 13, 1, 'Present', 'N', 'Team 2'), (26, 14, 2, 'Present', 'N', 'Team 2'), (26, 3, 3, 'Present', 'N', 'Team 2'), (26, 9, 4, 'Present', 'N', 'Team 2'), (26, 6, 5, 'Present', 'N', 'Team 2');

-- Scrim Event 10
INSERT INTO events (title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES ('UST Teletigers vs. Dark Avengers', 'Scrim', 'Online', '2026-06-15', '2026-06-15', 'N/A', 'evaluated', 2, '2026-06-15 18:00:00', '2026-06-15 20:30:00');

INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES (27, 13, 1, 'Present', 'N', 'Team 1'), (27, 14, 2, 'Present', 'N', 'Team 1'), (27, 3, 3, 'Present', 'N', 'Team 1'), (27, 16, 4, 'Present', 'N', 'Team 1'), (27, 6, 5, 'Present', 'N', 'Team 1'),
(27, 4, 1, 'Present', 'N', 'Team 2'), (27, 7, 2, 'Present', 'N', 'Team 2'), (27, 15, 3, 'Present', 'N', 'Team 2'), (27, 5, 4, 'Present', 'N', 'Team 2'), (27, 17, 5, 'Present', 'N', 'Team 2');

-- Scrim Event 11: UST Teletigers In-house (Focus on New Talent)
INSERT INTO events (eventId, title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES (58, 'Teletigers Alpha vs. Teletigers Beta', 'Scrim', 'Online', '2026-07-01', '2026-07-01', 'N/A', 'evaluated', 2, '2026-07-01 18:00:00', '2026-07-01 20:30:00');

-- Scrim Event 12: UST Teletigers vs. Gen.G (Trialing New Jungle/Top)
INSERT INTO events (eventId, title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES (59, 'UST Teletigers vs. Gen.G', 'Scrim', 'Online', '2026-07-07', '2026-07-07', 'N/A', 'evaluated', 2, '2026-07-07 18:00:00', '2026-07-07 20:30:00');

-- Scrim Event 13: UST Teletigers vs. T1 (Trialing New Core)
INSERT INTO events (eventId, title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES (60, 'UST Teletigers vs. T1', 'Scrim', 'Online', '2026-07-13', '2026-07-13', 'N/A', 'evaluated', 2, '2026-07-13 18:00:00', '2026-07-13 20:30:00');

-- In-house August scrims with Magsin as Team 1 top laner and Hoshiyo as Team 2 top laner
INSERT INTO events (eventId, title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES (61, 'UST Teletigers In-house August 5', 'Scrim', 'Online', '2026-08-05', '2026-08-05', 'N/A', 'evaluated', 2, '2026-08-05 18:00:00', '2026-08-05 20:30:00');

INSERT INTO events (eventId, title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES (62, 'UST Teletigers In-house August 12', 'Scrim', 'Online', '2026-08-12', '2026-08-12', 'N/A', 'evaluated', 2, '2026-08-12 18:00:00', '2026-08-12 20:30:00');

INSERT INTO events (eventId, title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES (63, 'UST Teletigers In-house August 19', 'Scrim', 'Online', '2026-08-19', '2026-08-19', 'N/A', 'evaluated', 2, '2026-08-19 18:00:00', '2026-08-19 20:30:00');

INSERT INTO events (eventId, title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES (64, 'UST Teletigers In-house August 26', 'Scrim', 'Online', '2026-08-26', '2026-08-26', 'N/A', 'evaluated', 2, '2026-08-26 18:00:00', '2026-08-26 20:30:00');

-- Attendees for Event 61
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(61, 34, 1, 'Present', 'N', 'Team 1'), -- Magsin (Top)
(61, 29, 2, 'Absent', 'N', 'Team 1'), -- Asterux (Jungle)
(61, 28, 3, 'Present', 'N', 'Team 1'), -- Panix (Mid)
(61, 31, 4, 'Present', 'N', 'Team 1'), -- MORS (ADC)
(61, 17, 5, 'Present', 'N', 'Team 1'), -- Maple (Support)
(61, 13, 1, 'Present', 'N', 'Team 2'), -- Hoshiyo (Top)
(61, 32, 2, 'Present', 'N', 'Team 2'), -- na hook si jade (Jungle)
(61, 15, 3, 'Present', 'N', 'Team 2'), -- Stellar (Mid)
(61, 5, 4, 'Present', 'N', 'Team 2'), -- Kalachuchi (ADC)
(61, 6, 5, 'Present', 'N', 'Team 2'); -- VA Crowned (Support)

-- Attendees for Event 62
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(62, 34, 1, 'Absent', 'Y', 'Team 1'), -- Magsin absent
(62, 29, 2, 'Present', 'N', 'Team 1'), -- Asterux (Jungle)
(62, 28, 3, 'Present', 'N', 'Team 1'), -- Panix (Mid)
(62, 31, 4, 'Present', 'N', 'Team 1'), -- MORS (ADC)
(62, 17, 5, 'Present', 'N', 'Team 1'), -- Maple (Support)
(62, 13, 1, 'Present', 'N', 'Team 2'), -- Hoshiyo (Top)
(62, 32, 2, 'Present', 'N', 'Team 2'), -- na hook si jade (Jungle)
(62, 15, 3, 'Present', 'N', 'Team 2'), -- Stellar (Mid)
(62, 5, 4, 'Present', 'N', 'Team 2'), -- Kalachuchi (ADC)
(62, 6, 5, 'Present', 'N', 'Team 2'); -- VA Crowned (Support)

-- Attendees for Event 63
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(63, 34, 1, 'Absent', 'Y', 'Team 1'), -- Magsin absent
(63, 29, 2, 'Present', 'N', 'Team 1'), -- Asterux (Jungle)
(63, 28, 3, 'Present', 'N', 'Team 1'), -- Panix (Mid)
(63, 31, 4, 'Present', 'N', 'Team 1'), -- MORS (ADC)
(63, 17, 5, 'Present', 'N', 'Team 1'), -- Maple (Support)
(63, 13, 1, 'Absent', 'Y', 'Team 2'), -- Hoshiyo absent
(63, 32, 2, 'Present', 'N', 'Team 2'), -- na hook si jade (Jungle)
(63, 15, 3, 'Present', 'N', 'Team 2'), -- Stellar (Mid)
(63, 5, 4, 'Present', 'N', 'Team 2'), -- Kalachuchi (ADC)
(63, 6, 5, 'Present', 'N', 'Team 2'); -- VA Crowned (Support)

-- Attendees for Event 64
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(64, 34, 1, 'Absent', 'Y', 'Team 1'), -- Magsin absent
(64, 29, 2, 'Present', 'N', 'Team 1'), -- Asterux (Jungle)
(64, 28, 3, 'Present', 'N', 'Team 1'), -- Panix (Mid)
(64, 31, 4, 'Present', 'N', 'Team 1'), -- MORS (ADC)
(64, 17, 5, 'Present', 'N', 'Team 1'), -- Maple (Support)
(64, 13, 1, 'Present', 'N', 'Team 2'), -- Hoshiyo (Top)
(64, 32, 2, 'Present', 'N', 'Team 2'), -- na hook si jade (Jungle)
(64, 15, 3, 'Present', 'N', 'Team 2'), -- Stellar (Mid)
(64, 5, 4, 'Present', 'N', 'Team 2'), -- Kalachuchi (ADC)
(64, 6, 5, 'Present', 'N', 'Team 2'); -- VA Crowned (Support)

-- Scrim 1 (eventId = 18) – 5star bad
INSERT INTO player_evaluations (eventId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(18, 7, 'Struggled to coordinate, poor comms', 2, 1, 2, 2),
(18, 4, 'Top laner gave good calls', 3, 4, 3, 2),
(18, 3, 'Mid laner average comms', 3, 3, 3, 2),
(18, 5, 'ADC vocal early, quiet late', 3, 2, 4, 2),
(18, 6, 'Support steady comms', 3, 4, 3, 2);

-- Scrim 2 (eventId = 19) – Blueprint good
INSERT INTO player_evaluations (eventId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(19, 14, 'Excellent shotcalling, clear comms', 5, 5, 4, 2),
(19, 13, 'Top laner weak comms', 2, 2, 2, 2),
(19, 15, 'Mid laner strong comms', 4, 4, 4, 2),
(19, 9, 'ADC average', 3, 3, 3, 2),
(19, 17, 'Support vocal', 4, 4, 4, 2);

-- Scrim 3 (eventId = 20) – 5star bad
INSERT INTO player_evaluations (eventId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(20, 7, 'Minimal communication, lacked presence', 2, 1, 2, 2),
(20, 4, 'Top laner silent this game', 3, 2, 3, 2),
(20, 15, 'Mid laner strong comms', 4, 5, 4, 2),
(20, 5, 'ADC average comms', 3, 3, 3, 2),
(20, 6, 'Support weak comms', 2, 2, 2, 2);

-- Scrim 4 (eventId = 21) – Blueprint good
INSERT INTO player_evaluations (eventId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(21, 14, 'Strong comms, decisive calls', 4, 5, 4, 2),
(21, 13, 'Top laner improved comms', 3, 3, 3, 2),
(21, 3, 'Mid laner steady', 3, 4, 3, 2),
(21, 16, 'ADC poor comms', 2, 1, 2, 2),
(21, 6, 'Support strong comms', 4, 5, 4, 2);

-- Scrim 5 (eventId = 22) – both present
INSERT INTO player_evaluations (eventId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(22, 7, 'Some comms but inconsistent', 3, 2, 3, 2),
(22, 14, 'Clear communication, good synergy', 4, 4, 4, 2),
(22, 4, 'Top laner vocal', 4, 4, 4, 2),
(22, 9, 'ADC average', 3, 3, 3, 2),
(22, 17, 'Support strong', 4, 5, 4, 2);

-- Scrim 6 (eventId = 23) – 5star bad
INSERT INTO player_evaluations (eventId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(23, 7, 'Barely spoke, weak comms', 2, 1, 2, 2),
(23, 13, 'Top laner average', 3, 3, 3, 2),
(23, 15, 'Mid laner vocal', 4, 4, 4, 2),
(23, 5, 'ADC weak comms', 2, 2, 2, 2),
(23, 6, 'Support average', 3, 3, 3, 2);

-- Scrim 7 (eventId = 24) – Blueprint good
INSERT INTO player_evaluations (eventId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(24, 14, 'Excellent comms, led rotations well', 5, 5, 4, 2),
(24, 4, 'Top laner strong', 4, 5, 4, 2),
(24, 3, 'Mid laner average', 3, 3, 3, 2),
(24, 16, 'ADC poor comms', 2, 1, 2, 2),
(24, 17, 'Support steady', 3, 4, 3, 2);

-- Scrim 8 (eventId = 25) – both present
INSERT INTO player_evaluations (eventId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(25, 7, 'Silent again, poor coordination', 2, 1, 2, 2),
(25, 14, 'Good comms, steady shotcalling', 4, 4, 4, 2),
(25, 13, 'Top laner weak', 2, 2, 2, 2),
(25, 9, 'ADC average', 3, 3, 3, 2),
(25, 6, 'Support vocal', 4, 4, 4, 2);

-- Scrim 9 (eventId = 26) – 5star bad
INSERT INTO player_evaluations (eventId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(26, 7, 'Some comms but weak', 3, 2, 3, 2),
(26, 4, 'Top laner average', 3, 3, 3, 2),
(26, 15, 'Mid laner strong', 4, 4, 4, 2),
(26, 5, 'ADC weak', 2, 2, 2, 2),
(26, 17, 'Support strong', 4, 5, 4, 2);

-- Scrim 10 (eventId = 27) – Blueprint good
INSERT INTO player_evaluations (eventId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(27, 14, 'Strong comms, very vocal', 5, 5, 4, 2),
(27, 13, 'Top laner vocal', 4, 4, 4, 2),
(27, 3, 'Mid laner average', 3, 3, 3, 2),
(27, 16, 'ADC strong', 4, 5, 4, 2),
(27, 6, 'Support weak', 2, 2, 2, 2);

-- -----------------------------------------------------
-- ADDITIONAL SCRIMS FOR NEW PLAYERS
-- -----------------------------------------------------

-- Attendees for Event 58
-- Team 1 (Alpha): New Players Philippines, Easy Eddie, Panix, MORS + Existing Maple
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES 
(58, 26, 1, 'Present', 'N', 'Team 1'), -- Philippines (Top)
(58, 27, 2, 'Present', 'N', 'Team 1'), -- Easy Eddie (Jungle)
(58, 28, 3, 'Present', 'N', 'Team 1'), -- Panix (Mid)
(58, 31, 4, 'Present', 'N', 'Team 1'), -- MORS (ADC)
(58, 17, 5, 'Present', 'N', 'Team 1'), -- Maple (Support)
-- Team 2 (Beta): New Players Jade, Asterux + Existing Stellar, Kalachuchi, Crowned
(58, 32, 1, 'Present', 'N', 'Team 2'), -- na hook si jade (Top)
(58, 29, 2, 'Present', 'N', 'Team 2'), -- Asterux (Jungle)
(58, 15, 3, 'Present', 'N', 'Team 2'), -- Stellar (Mid)
(58, 5, 4, 'Present', 'N', 'Team 2'),  -- Kalachuchi (ADC)
(58, 6, 5, 'Present', 'N', 'Team 2');  -- VA Crowned (Support)


-- Attendees for Event 59
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES 
(59, 32, 1, 'Present', 'N', 'Team 1'), -- na hook si jade (Top)
(59, 33, 2, 'Present', 'N', 'Team 1'), -- caredto (Jungle)
(59, 3, 3, 'Present', 'N', 'Team 1'),  -- VA Tartaros (Mid)
(59, 31, 4, 'Present', 'N', 'Team 1'), -- MORS (ADC)
(59, 17, 5, 'Present', 'N', 'Team 1'), -- Maple (Support)
(59, 27, 2, 'Excused', 'Y', 'Sub');    -- Easy Eddie (Sub Jungle)



-- Attendees for Event 60
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES 
(60, 26, 1, 'Present', 'N', 'Team 1'), -- Philippines (Top)
(60, 29, 2, 'Present', 'N', 'Team 1'), -- Asterux (Jungle)
(60, 28, 3, 'Present', 'N', 'Team 1'), -- Panix (Mid)
(60, 16, 4, 'Present', 'N', 'Team 1'), -- one of wun (ADC)
(60, 6, 5, 'Present', 'N', 'Team 1'),  -- VA Crowned (Support)
(60, 33, 2, 'Excused', 'Y', 'Sub');    -- caredto (Sub Jungle)

-- -----------------------------------------------------
-- EVALUATIONS FOR NEW PLAYERS
-- -----------------------------------------------------

-- Evaluation for Event 58 (Philippines and Panix)
INSERT INTO player_evaluations (eventId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(58, 26, 'Solid laning phase, communicated TP windows well', 4, 4, 3, 2),
(58, 28, 'Good mechanical outplays in mid, needs better map awareness', 3, 3, 4, 2),
(58, 31, 'Excellent positioning in teamfights', 4, 3, 4, 2),
(58, 32, 'Aggressive but caught out occasionally', 2, 3, 3, 2);

-- Evaluation for Event 59 (caredto and na hook si jade)
INSERT INTO player_evaluations (eventId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(59, 33, 'Pathing was unpredictable for the enemy, very efficient', 5, 4, 4, 2),
(59, 32, 'Handled the 1v2 dive pressure well', 4, 4, 3, 2);

-- Evaluation for Event 61 (Magsin and Hoshiyo)
INSERT INTO player_evaluations (eventId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
VALUES
(61, 34, 'Showed promise on lane assignment but lacked consistency after long breaks', 3, 3, 2, 2),
(61, 13, 'Played strong top with good map awareness in this scrim', 4, 4, 3, 2);

-- -----------------------------------------------------
-- EVENTS: TOURNAMENTS (follows UST Calendar na)
-- -----------------------------------------------------


-- TERM 1 (2025-08-04 to 2025-12-18)
INSERT INTO events (eventId, title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES
(28, 'Alliance Games (AllG) Season 5 - Group Stage', 'Tournament', 'Online', '2025-08-04', '2025-08-05', 'L', 'completed', 2, '2025-08-04 09:00:00', '2025-08-04 16:30:00'),
(29, 'Estudyante Esports National Championships Season 3 - Group Stage', 'Tournament', 'Online', '2025-08-25', '2025-08-26', 'L', 'completed', 2, '2025-08-25 09:00:00', '2025-08-25 16:30:00'),
(30, 'CCE (Collegiate Center for Esports) Season 4 - LAN Finals', 'Tournament', 'Campus Arena', '2025-09-15', '2025-09-16', 'N/A', 'completed', 2, '2025-09-16 09:00:00', '2025-09-16 16:30:00'),
(31, 'Philippine Collegiate Championship (PCC) Season 3 - Regional League', 'Tournament', 'Online', '2025-10-06', '2025-10-07', 'L', 'completed', 2, '2025-10-07 09:00:00', '2025-10-07 16:30:00'),
(32, 'Alliance Games (AllG) Season 5 - Grand Finals', 'Tournament', 'Online', '2025-10-27', '2025-10-28', 'L', 'completed', 2, '2025-10-27 09:00:00', '2025-10-27 16:30:00'),
(33, 'CCE Immersion Cup Season 2', 'Tournament', 'Online', '2025-08-11', '2025-08-12', 'W', 'completed', 2, '2025-08-11 09:00:00', '2025-08-11 16:30:00'),
(34, 'Estudyante Esports National Championships Season 3 - Playoffs', 'Tournament', 'Online', '2025-09-01', '2025-09-02', 'W', 'completed', 2, '2025-09-01 09:00:00', '2025-09-01 16:30:00'),
(35, 'Philippine Collegiate Championship (PCC) Season 3 - National League', 'Tournament', 'Online', '2025-09-22', '2025-09-23', 'W', 'completed', 2, '2025-09-22 09:00:00', '2025-09-22 16:30:00'),
(36, 'Friendship Games (CHED-CCE) Season 1', 'Tournament', 'Online', '2025-10-13', '2025-10-14', 'W', 'completed', 2, '2025-10-14 09:00:00', '2025-10-14 16:30:00'),
(37, 'MPS SEA Campus Invitational - Philippine Qualifiers', 'Tournament', 'Online', '2025-11-01', '2025-11-02', 'L', 'completed', 2, '2025-11-02 09:00:00', '2025-11-02 16:30:00');


-- TERM 2 (2026-01-10 to 2026-06-15) - unchanged, already fits
INSERT INTO events (eventId, title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES
(48, 'CCE (Collegiate Center for Esports) Season 5 - Regional Qualifiers', 'Tournament', 'Online', '2026-01-26', '2026-01-27', 'L', 'completed', 2, '2026-01-26 09:00:00', '2026-01-26 16:30:00'),
(49, 'Philippine Collegiate Championship (PCC) Season 4 - Open Cup', 'Tournament', 'Online', '2026-02-07', '2026-02-08', 'W', 'completed', 2, '2026-02-07 09:00:00', '2026-02-07 16:30:00'),
(50, 'Alliance Games (AllG) Season 6 - Regional Qualifiers', 'Tournament', 'Online', '2026-03-07', '2026-03-08', 'N/A', 'completed', 2, '2026-03-07 09:00:00', '2026-03-07 16:30:00'),
(51, 'Estudyante Esports National Championships Season 4 - Regional Qualifiers', 'Tournament', 'Online', '2026-04-04', '2026-04-05', 'W', 'completed', 2, '2026-04-04 09:00:00', '2026-04-04 16:30:00'),
(52, 'Campus Playfest 2026 - League of Legends Grand Finals', 'Tournament', 'Online', '2026-04-18', '2026-04-19', 'L', 'completed', 2, '2026-04-18 09:00:00', '2026-04-18 16:30:00'),
(53, 'CCE Immersion Cup Season 3 - Qualifiers', 'Tournament', 'Online', '2026-01-31', '2026-02-01', 'L', 'completed', 2, '2026-01-31 09:00:00', '2026-01-31 16:30:00'),
(54, 'Friendship Games (CHED-CCE) Season 2 - Group Stage', 'Tournament', 'Online', '2026-02-21', '2026-02-22', 'L', 'completed', 2, '2026-02-21 09:00:00', '2026-02-21 16:30:00'),
(55, 'Philippine Collegiate Championship (PCC) Season 4 - Regional League (Luzon)', 'Tournament', 'Online', '2026-03-21', '2026-03-22', 'L', 'completed', 2, '2026-03-21 09:00:00', '2026-03-21 16:30:00'),
(56, 'MPS SEA Campus Invitational Season 2 - Philippine Qualifiers', 'Tournament', 'Online', '2026-04-11', '2026-04-12', 'W', 'completed', 2, '2026-04-11 09:00:00', '2026-04-11 16:30:00'),
(57, 'Alliance Games (AllG) Season 6 - Regional Finals', 'Tournament', 'Online', '2026-04-25', '2026-04-26', 'L', 'completed', 2, '2026-04-25 09:00:00', '2026-04-25 16:30:00');


-- TERM 3 (2026-08-03 to 2026-12-19)
INSERT INTO events (eventId, title_summary, type, location, start_date, end_date, win, status, creator_id, start_datetime, end_datetime)
VALUES
(38, 'Alliance Games (AllG) Season 6 - Group Stage', 'Tournament', 'Online', '2026-08-03', '2026-08-04', 'N/A', 'Upcoming', 2, '2026-08-03 09:00:00', '2026-08-03 16:30:00'),
(39, 'Estudyante Esports National Championships Season 4 - Group Stage', 'Tournament', 'Online', '2026-08-17', '2026-08-18', 'N/A', 'Upcoming', 2, '2026-08-17 09:00:00', '2026-08-17 16:30:00'),
(40, 'CCE (Collegiate Center for Esports) Season 5 - LAN Finals', 'Tournament', 'Online', '2026-08-24', '2026-08-25', 'N/A', 'Upcoming', 2, '2026-08-24 09:00:00', '2026-08-24 16:30:00'),
(41, 'Philippine Collegiate Championship (PCC) Season 4 - Grand Finals', 'Tournament', 'Online', '2026-09-07', '2026-09-08', 'N/A', 'Upcoming', 2, '2026-09-07 09:00:00', '2026-09-07 16:30:00'),
(42, 'Estudyante Esports National Championships Season 4 - Playoffs 1', 'Tournament', 'Online', '2026-09-21', '2026-09-22', 'N/A', 'Upcoming', 2, '2026-09-21 09:00:00', '2026-09-21 16:30:00'),
(43, 'CCE Immersion Cup Season 3 - Finals', 'Tournament', 'Online', '2026-10-05', '2026-10-06', 'N/A', 'Upcoming', 2, '2026-10-05 09:00:00', '2026-10-05 16:30:00'),
(44, 'Estudyante Esports National Championships Season 4 - Playoffs 2', 'Tournament', 'Online', '2026-10-12', '2026-10-13', 'N/A', 'Upcoming', 2, '2026-10-12 09:00:00', '2026-10-12 16:30:00'),
(45, 'Philippine Collegiate Championship (PCC) Season 4 - National League', 'Tournament', 'Online', '2026-10-19', '2026-10-20', 'N/A', 'Upcoming', 2, '2026-10-19 09:00:00', '2026-10-19 16:30:00'),
(46, 'Friendship Games (CHED-CCE) Season 2 - Finals', 'Tournament', 'Online', '2026-10-26', '2026-10-27', 'N/A', 'Upcoming', 2, '2026-10-26 09:00:00', '2026-10-26 16:30:00'),
(47, 'MPS SEA Campus Invitational Season 2 - Philippine Finals', 'Tournament', 'Online', '2026-10-09', '2026-10-09', 'N/A', 'Upcoming', 2, '2026-10-09 09:00:00', '2026-10-09 16:30:00');


-- Tournament 16 → Event 43 attendees
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(43, 4, 1, 'Present', 'N', 'Team 1'),
(43, 7, 2, 'Present', 'N', 'Team 1'),
(43, 3, 3, 'Present', 'N', 'Team 1'),
(43, 5, 4, 'Present', 'N', 'Team 1'),
(43, 6, 5, 'Present', 'N', 'Team 1'),
(43, 8, 2, 'Excused', 'Y', 'Sub');

-- Tournament 17 → Event 44 attendees
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(44, 4, 1, 'Present', 'N', 'Team 1'),
(44, 7, 2, 'Present', 'N', 'Team 1'),
(44, 15, 3, 'Present', 'N', 'Team 1'),
(44, 5, 4, 'Present', 'N', 'Team 1'),
(44, 17, 5, 'Present', 'N', 'Team 1'),
(44, 13, 1, 'Excused', 'Y', 'Sub');

-- Tournament 18 → Event 45 attendees
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(45, 13, 1, 'Present', 'N', 'Team 1'),
(45, 7, 2, 'Present', 'N', 'Team 1'),
(45, 3, 3, 'Present', 'N', 'Team 1'),
(45, 5, 4, 'Present', 'N', 'Team 1'),
(45, 6, 5, 'Present', 'N', 'Team 1'),
(45, 4, 1, 'Excused', 'Y', 'Sub');

-- Tournament 19 → Event 46 attendees
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(46, 4, 1, 'Present', 'N', 'Team 1'),
(46, 14, 2, 'Present', 'N', 'Team 1'),
(46, 3, 3, 'Present', 'N', 'Team 1'),
(46, 16, 4, 'Present', 'N', 'Team 1'),
(46, 17, 5, 'Present', 'N', 'Team 1'),
(46, 7, 2, 'Excused', 'Y', 'Sub');

-- Tournament 20 → Event 47 attendees
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(47, 13, 1, 'Present', 'N', 'Team 1'),
(47, 9, 2, 'Present', 'N', 'Team 1'),
(47, 15, 3, 'Present', 'N', 'Team 1'),
(47, 16, 4, 'Present', 'N', 'Team 1'),
(47, 6, 5, 'Present', 'N', 'Team 1');

-- Tournament 21 → Event 48 attendees
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(48, 4, 1, 'Present', 'N', 'Team 1'),
(48, 8, 2, 'Present', 'N', 'Team 1'),
(48, 3, 3, 'Present', 'N', 'Team 1'),
(48, 5, 4, 'Present', 'N', 'Team 1'),
(48, 17, 5, 'Present', 'N', 'Team 1'),
(48, 13, 1, 'Excused', 'Y', 'Sub');

-- Tournament 22 → Event 49 attendees
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(49, 13, 1, 'Present', 'N', 'Team 1'),
(49, 7, 2, 'Present', 'N', 'Team 1'),
(49, 15, 3, 'Present', 'N', 'Team 1'),
(49, 16, 4, 'Present', 'N', 'Team 1'),
(49, 6, 5, 'Present', 'N', 'Team 1'),
(49, 9, 2, 'Excused', 'Y', 'Sub');

-- Tournament 23 → Event 50 attendees
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(50, 4, 1, 'Present', 'N', 'Team 1'),
(50, 14, 2, 'Present', 'N', 'Team 1'),
(50, 3, 3, 'Present', 'N', 'Team 1'),
(50, 5, 4, 'Present', 'N', 'Team 1'),
(50, 17, 5, 'Present', 'N', 'Team 1');

-- Tournament 24 → Event 51 attendees
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(51, 13, 1, 'Present', 'N', 'Team 1'),
(51, 9, 2, 'Present', 'N', 'Team 1'),
(51, 15, 3, 'Present', 'N', 'Team 1'),
(51, 16, 4, 'Present', 'N', 'Team 1'),
(51, 6, 5, 'Present', 'N', 'Team 1'),
(51, 4, 1, 'Excused', 'Y', 'Sub');

-- Tournament 25 → Event 52 attendees
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(52, 4, 1, 'Present', 'N', 'Team 1'),
(52, 8, 2, 'Present', 'N', 'Team 1'),
(52, 3, 3, 'Present', 'N', 'Team 1'),
(52, 5, 4, 'Present', 'N', 'Team 1'),
(52, 17, 5, 'Present', 'N', 'Team 1'),
(52, 7, 2, 'Excused', 'Y', 'Sub'),
(52, 6, 5, 'Excused', 'Y', 'Sub');

-- Tournament 26 → Event 53 attendees
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(53, 4, 1, 'Present', 'N', 'Team 1'),
(53, 7, 2, 'Present', 'N', 'Team 1'),
(53, 3, 3, 'Present', 'N', 'Team 1'),
(53, 16, 4, 'Present', 'N', 'Team 1'),
(53, 17, 5, 'Present', 'N', 'Team 1'),
(53, 13, 1, 'Excused', 'Y', 'Sub');

-- Tournament 27 → Event 54 attendees
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(54, 13, 1, 'Present', 'N', 'Team 1'),
(54, 9, 2, 'Present', 'N', 'Team 1'),
(54, 15, 3, 'Present', 'N', 'Team 1'),
(54, 5, 4, 'Present', 'N', 'Team 1'),
(54, 6, 5, 'Present', 'N', 'Team 1');

-- Tournament 28 → Event 55 attendees
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(55, 4, 1, 'Present', 'N', 'Team 1'),
(55, 14, 2, 'Present', 'N', 'Team 1'),
(55, 3, 3, 'Present', 'N', 'Team 1'),
(55, 16, 4, 'Present', 'N', 'Team 1'),
(55, 17, 5, 'Present', 'N', 'Team 1'),
(55, 7, 2, 'Excused', 'Y', 'Sub');

-- Tournament 29 → Event 56 attendees
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(56, 13, 1, 'Present', 'N', 'Team 1'),
(56, 8, 2, 'Present', 'N', 'Team 1'),
(56, 15, 3, 'Present', 'N', 'Team 1'),
(56, 5, 4, 'Present', 'N', 'Team 1'),
(56, 6, 5, 'Present', 'N', 'Team 1'),
(56, 4, 1, 'Excused', 'Y', 'Sub');

-- Tournament 30 → Event 57 attendees
INSERT INTO event_attendees (eventId, userId, player_role, attendance_status, is_sub, team)
VALUES
(57, 4, 1, 'Present', 'N', 'Team 1'),
(57, 7, 2, 'Present', 'N', 'Team 1'),
(57, 3, 3, 'Present', 'N', 'Team 1'),
(57, 16, 4, 'Present', 'N', 'Team 1'),
(57, 6, 5, 'Present', 'N', 'Team 1'),
(57, 9, 2, 'Excused', 'Y', 'Sub'),
(57, 17, 5, 'Excused', 'Y', 'Sub');

-- SEM 1
-- August 2025 to December 2025.
-- SEM 2
-- January 2026 to June 2026.
INSERT INTO `teamforgedb`.`academic_terms` (`termName`, `startDate`, `endDate`) VALUES 
('Term 1', '2025-08-04', '2025-12-18'),
('Term 2', '2026-01-10', '2026-06-15'),
('Term 3', '2026-08-03', '2026-12-19');


-- Populates start_datetime / end_datetime (and start_date / end_date) with the
-- actual class times parsed out of each title, instead of defaulting to 12:00am.
INSERT INTO events (title_summary, type, location, start_date, start_datetime, end_date, end_datetime, win, status, creator_id)
WITH RECURSIVE weeks AS (
    SELECT 0 AS wk
    UNION ALL
    SELECT wk + 1 FROM weeks WHERE wk < 14
),
class_schedule (userId, weekday_offset, title_summary, location, start_time, end_time) AS (
    VALUES
    -- userId 3: VA Tartaros (BSCS-SE)
    ROW(3, 1, 'Class: Data Structures and Algorithms (9:00-10:30 AM)', 'Room CS-301', '09:00:00', '10:30:00'),
    ROW(3, 2, 'Class: Software Engineering I (1:00-2:30 PM)', 'Room CS-302', '13:00:00', '14:30:00'),
    ROW(3, 3, 'Class: Database Systems (10:00-11:30 AM)', 'Room CS-301', '10:00:00', '11:30:00'),
    ROW(3, 4, 'Class: Web Development (2:00-3:30 PM)', 'Room CS-303', '14:00:00', '15:30:00'),

    -- userId 13: Hoshiyo - Top laner, busy Mondays
    ROW(13, 0, 'Class: Networking Fundamentals (9:00-10:30 AM)', 'Room CS-201', '09:00:00', '10:30:00'),
    ROW(13, 2, 'Class: Discrete Mathematics (10:00-11:30 AM)', 'Room CS-202', '10:00:00', '11:30:00'),
    ROW(13, 3, 'Class: Programming Logic (1:00-2:30 PM)', 'Room CS-201', '13:00:00', '14:30:00'),
    ROW(13, 5, 'Class: Information Security (9:00-10:30 AM)', 'Room CS-203', '09:00:00', '10:30:00'),

    -- userId 5: Kalachuchi (BSIT)
    ROW(5, 1, 'Class: Capstone Project I (3:00-4:30 PM)', 'Room IT-401', '15:00:00', '16:30:00'),
    ROW(5, 3, 'Class: IT Elective 3 (9:00-10:30 AM)', 'Room IT-402', '09:00:00', '10:30:00'),
    ROW(5, 4, 'Class: Systems Integration (1:00-2:30 PM)', 'Room IT-401', '13:00:00', '14:30:00'),

    -- userId 6: VA Crowned (BSND)
    ROW(6, 0, 'Class: Related Learning Experience (9:00-11:00 AM)', 'ND Clinic', '09:00:00', '11:00:00'),
    ROW(6, 1, 'Class: Nursing Care Management (9:00-10:30 AM)', 'Room ND-301', '09:00:00', '10:30:00'),
    ROW(6, 2, 'Class: Anatomy and Physiology (10:00-11:30 AM)', 'Room ND-302', '10:00:00', '11:30:00'),
    ROW(6, 4, 'Class: Community Health Nursing (1:00-2:30 PM)', 'Room ND-301', '13:00:00', '14:30:00'),

    -- userId 7: 5star (BSIT)
    ROW(7, 0, 'Class: Capstone Project I (9:00-10:30 AM)', 'Room IT-401', '09:00:00', '10:30:00'),
    ROW(7, 1, 'Class: IT Elective 2 (1:00-2:30 PM)', 'Room IT-402', '13:00:00', '14:30:00'),
    ROW(7, 3, 'Class: Systems Administration (10:00-11:30 AM)', 'Room IT-403', '10:00:00', '11:30:00'),
    ROW(7, 5, 'Class: Mobile App Development (9:00-10:30 AM)', 'Room IT-401', '09:00:00', '10:30:00'),

    -- userId 8: VA Mushi (BSIT)
    ROW(8, 0, 'Class: Intro to Computing (9:00-10:30 AM)', 'Room IT-101', '09:00:00', '10:30:00'),
    ROW(8, 2, 'Class: Data Structures (10:00-11:30 AM)', 'Room IT-102', '10:00:00', '11:30:00'),
    ROW(8, 4, 'Class: Object-Oriented Programming (1:00-2:30 PM)', 'Room IT-101', '13:00:00', '14:30:00'),

    -- userId 9: lancr (BSIT)
    ROW(9, 1, 'Class: Discrete Structures (9:00-10:30 AM)', 'Room IT-103', '09:00:00', '10:30:00'),
    ROW(9, 2, 'Class: Networking 1 (1:00-2:30 PM)', 'Room IT-104', '13:00:00', '14:30:00'),
    ROW(9, 3, 'Class: Web Systems (10:00-11:30 AM)', 'Room IT-103', '10:00:00', '11:30:00'),
    ROW(9, 5, 'Class: Elective 1 (9:00-10:30 AM)', 'Room IT-101', '09:00:00', '10:30:00'),

    -- userId 14: The Blueprint (BS-ST)
    ROW(14, 0, 'Class: Sports Science Fundamentals (9:00-10:30 AM)', 'Room ST-201', '09:00:00', '10:30:00'),
    ROW(14, 1, 'Class: Anatomy for Sports (10:00-11:30 AM)', 'Room ST-202', '10:00:00', '11:30:00'),
    ROW(14, 3, 'Class: Exercise Physiology (1:00-2:30 PM)', 'Room ST-201', '13:00:00', '14:30:00'),

    -- userId 15: Stellar (BSND)
    ROW(15, 0, 'Class: Related Learning Experience (9:00-11:00 AM)', 'ND Clinic', '09:00:00', '11:00:00'),
    ROW(15, 2, 'Class: Maternal and Child Nursing (10:00-11:30 AM)', 'Room ND-401', '10:00:00', '11:30:00'),
    ROW(15, 4, 'Class: Nursing Research (1:00-2:30 PM)', 'Room ND-402', '13:00:00', '14:30:00'),
    ROW(15, 5, 'Class: Community Health Nursing II (9:00-10:30 AM)', 'Room ND-401', '09:00:00', '10:30:00'),

    -- userId 16: one of wun (BSCS-ST)
    ROW(16, 0, 'Class: Data Structures and Algorithms (9:00-10:30 AM)', 'Room CS-201', '09:00:00', '10:30:00'),
    ROW(16, 1, 'Class: Discrete Mathematics (10:00-11:30 AM)', 'Room CS-202', '10:00:00', '11:30:00'),
    ROW(16, 3, 'Class: Programming Logic (1:00-2:30 PM)', 'Room CS-201', '13:00:00', '14:30:00'),

    -- userId 17: Maple (BSIS)
    ROW(17, 1, 'Class: Systems Analysis and Design (9:00-10:30 AM)', 'Room IS-401', '09:00:00', '10:30:00'),
    ROW(17, 2, 'Class: IT Project Management (1:00-2:30 PM)', 'Room IS-402', '13:00:00', '14:30:00'),
    ROW(17, 4, 'Class: Capstone Project II (10:00-11:30 AM)', 'Room IS-401', '10:00:00', '11:30:00'),
    ROW(17, 5, 'Class: Elective 4 (9:00-10:30 AM)', 'Room IS-401', '09:00:00', '10:30:00'),

    -- userId 26: Flying Dutchman (BSIT) - no Tuesday classes; Data Communications moved Tue -> Mon
    ROW(26, 0, 'Class: Data Communications (9:00-10:30 AM)', 'Room IT-301', '09:00:00', '10:30:00'),
    ROW(26, 2, 'Class: Systems Integration and Architecture (1:00-2:30 PM)', 'Room IT-302', '13:00:00', '14:30:00'),
    ROW(26, 3, 'Class: Information Assurance and Security (10:00-11:30 AM)', 'Room IT-301', '10:00:00', '11:30:00'),
    ROW(26, 4, 'Class: IT Elective 1 (9:00-10:30 AM)', 'Room IT-303', '09:00:00', '10:30:00'),

    -- userId 32: Jade - added Tuesday class (placeholder course/room/time, swap in real details)
    ROW(32, 1, 'Class: Object-Oriented Programming (9:00-10:30 AM)', 'Room IT-105', '09:00:00', '10:30:00'),
    ROW(32, 2, 'Class: Systems Integration and Architecture (1:00-2:30 PM)', 'Room IT-302', '13:00:00', '14:30:00'),
    ROW(32, 3, 'Class: Information Assurance and Security (10:00-11:30 AM)', 'Room IT-301', '10:00:00', '11:30:00'),
    ROW(32, 4, 'Class: IT Elective 1 (9:00-10:30 AM)', 'Room IT-303', '09:00:00', '10:30:00'),

    -- userId 27: Easy Eddie (BSIT)
    ROW(27, 0, 'Class: Data Communications (9:00-10:30 AM)', 'Room IT-301', '09:00:00', '10:30:00'),
    ROW(27, 2, 'Class: Systems Integration and Architecture (1:00-2:30 PM)', 'Room IT-302', '13:00:00', '14:30:00'),
    ROW(27, 4, 'Class: Information Assurance and Security (10:00-11:30 AM)', 'Room IT-301', '10:00:00', '11:30:00')
)
SELECT
    cs.title_summary,
    'Other' AS type,
    cs.location,
    DATE_ADD('2026-08-03', INTERVAL (w.wk * 7 + cs.weekday_offset) DAY) AS start_date,
    TIMESTAMP(
        DATE_ADD('2026-08-03', INTERVAL (w.wk * 7 + cs.weekday_offset) DAY),
        cs.start_time
    ) AS start_datetime,
    DATE_ADD('2026-08-03', INTERVAL (w.wk * 7 + cs.weekday_offset) DAY) AS end_date,
    TIMESTAMP(
        DATE_ADD('2026-08-03', INTERVAL (w.wk * 7 + cs.weekday_offset) DAY),
        cs.end_time
    ) AS end_datetime,
    'N/A' AS win,
    'scheduled' AS status,
    cs.userId AS creator_id
FROM weeks w
CROSS JOIN class_schedule cs;