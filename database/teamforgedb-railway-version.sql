-- TeamForge Railway DB Version
-- Change utf8mb4 to utf8mb4: Version 9.4 handles modern character sets natively. Making this change ensures that any special characters or emojis from your players 
-- (like Discord tags or Riot Game tags) won't cause database errors.
-- Remove  (Optional): It is safely supported, but removing it keeps your code highly portable and clean.

-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema teamforgedb
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `teamforgedb` ;

-- -----------------------------------------------------
-- Schema teamforgedb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `teamforgedb` DEFAULT CHARACTER SET utf8mb4 ;
USE `teamforgedb` ;

-- -----------------------------------------------------
-- Table `teamforgedb`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`users` (
  `userId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(254) NOT NULL,
  `passwordHash` VARCHAR(254) NULL DEFAULT NULL,
  `firstname` VARCHAR(254) NOT NULL,
  `lastname` VARCHAR(254) NOT NULL,
  `position` ENUM('Team Manager', 'Team Coach', 'Player', 'Sub', 'Applicant') NOT NULL,
  `discord` VARCHAR(45) NULL DEFAULT NULL,
  `status` ENUM('Active', 'Inactive', 'Deactivated') NOT NULL,
  `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `firstLogin` TINYINT NULL DEFAULT 1,
  `google_access_token` TEXT NULL,
  `google_refresh_token` TEXT NULL,
  `google_token_expiry` BIGINT NULL,
  `google_connected` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`userId`))
ENGINE = InnoDB
AUTO_INCREMENT = 25
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`academicrequirements`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`academicrequirements` (
  `requirementId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `metricKey` VARCHAR(20) NOT NULL,
  `comparator` ENUM('>', '<', '>=', '<=') NOT NULL,
  `threshold` DECIMAL(4,2) NOT NULL,
  `updatedBy` INT UNSIGNED NULL DEFAULT NULL,
  `updatedAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`requirementId`),
  UNIQUE INDEX `uq_academicRequirements_metricKey` (`metricKey` ASC) ,
  INDEX `fk_academicRequirements_users1_idx` (`updatedBy` ASC) ,
  CONSTRAINT `fk_academicRequirements_users1`
    FOREIGN KEY (`updatedBy`)
    REFERENCES `teamforgedb`.`users` (`userId`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`announcements`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`announcements` (
  `announcementId` INT NOT NULL AUTO_INCREMENT,
  `userId` INT UNSIGNED NOT NULL,
  `title` VARCHAR(254) NULL DEFAULT NULL,
  `content` LONGTEXT NULL DEFAULT NULL,
  `dateCreated` TIMESTAMP NULL DEFAULT NULL,
  `discordMessageId` LONGTEXT NULL,
  PRIMARY KEY (`announcementId`, `userId`),
  INDEX `fk_announcements_users1_idx` (`userId` ASC) ,
  CONSTRAINT `fk_announcements_users1`
    FOREIGN KEY (`userId`)
    REFERENCES `teamforgedb`.`users` (`userId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`apicredentials`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`apicredentials` (
  `credentialId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `provider` VARCHAR(50) NOT NULL,
  `encryptedSecret` LONGTEXT NOT NULL,
  `iv` VARCHAR(64) NOT NULL,
  `authTag` VARCHAR(64) NOT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT '1',
  `createdBy` INT UNSIGNED NULL DEFAULT NULL,
  `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `rotatedAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`credentialId`),
  INDEX `idx_apiCredentials_provider_active` (`provider` ASC, `isActive` ASC) ,
  INDEX `fk_apiCredentials_users1_idx` (`createdBy` ASC) ,
  CONSTRAINT `fk_apiCredentials_users1`
    FOREIGN KEY (`createdBy`)
    REFERENCES `teamforgedb`.`users` (`userId`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`applicantquestions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`applicantquestions` (
  `questionId` INT NOT NULL,
  `question` LONGTEXT NULL DEFAULT NULL,
  PRIMARY KEY (`questionId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`applicantanswers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`applicantanswers` (
  `userId` INT UNSIGNED NOT NULL,
  `questionId` INT NOT NULL,
  `answer` LONGTEXT NULL DEFAULT NULL,
  PRIMARY KEY (`userId`, `questionId`),
  INDEX `fk_applicantAnswers_applicantQuestions1_idx` (`questionId` ASC) ,
  CONSTRAINT `fk_applicantAnswers_applicantQuestions1`
    FOREIGN KEY (`questionId`)
    REFERENCES `teamforgedb`.`applicantquestions` (`questionId`),
  CONSTRAINT `fk_applicantAnswers_users1`
    FOREIGN KEY (`userId`)
    REFERENCES `teamforgedb`.`users` (`userId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`leagueroles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`leagueroles` (
  `roleId` INT NOT NULL,
  `displayedRole` VARCHAR(45) NULL DEFAULT NULL,
  `role` VARCHAR(45) NULL DEFAULT NULL,
  `teamPosition` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`roleId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`players`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`players` (
  `userId` INT UNSIGNED NOT NULL,
  `gameName` VARCHAR(254) NULL DEFAULT NULL,
  `tagLine` VARCHAR(5) NULL DEFAULT NULL,
  `currentRank` VARCHAR(45) NULL DEFAULT NULL,
  `peakRank` VARCHAR(45) NULL DEFAULT NULL,
  `primaryRoleId` INT NOT NULL,
  `secondaryRoleId` INT NULL DEFAULT NULL,
  `puuid` VARCHAR(245) NULL DEFAULT NULL,
  `accountRegion` ENUM('AMERICAS', 'ASIA', 'EUROPE', 'SEA') NULL DEFAULT 'ASIA',
  `schoolId` VARCHAR(45) NULL DEFAULT NULL,
  `course` VARCHAR(45) NULL DEFAULT NULL,
  `lastGPA` DECIMAL(6,2) NULL DEFAULT NULL,
  `CGPA` DECIMAL(6,2) NULL DEFAULT NULL,
  `teamId` INT NULL DEFAULT NULL,
  `yearLevel` VARCHAR(45) NULL DEFAULT NULL,
  `profilePhoto` VARCHAR(260) NULL DEFAULT NULL,
  `isSub` ENUM('T', 'F') NULL DEFAULT NULL,
  PRIMARY KEY (`userId`),
  INDEX `fk_players_leagueRoles1_idx` (`primaryRoleId` ASC) ,
  INDEX `fk_players_leagueRoles2_idx` (`secondaryRoleId` ASC) ,
  CONSTRAINT `fk_players_leagueRoles1`
    FOREIGN KEY (`primaryRoleId`)
    REFERENCES `teamforgedb`.`leagueroles` (`roleId`),
  CONSTRAINT `fk_players_leagueRoles2`
    FOREIGN KEY (`secondaryRoleId`)
    REFERENCES `teamforgedb`.`leagueroles` (`roleId`),
  CONSTRAINT `fk_players_users`
    FOREIGN KEY (`userId`)
    REFERENCES `teamforgedb`.`users` (`userId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`applicantevaluations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`applicantevaluations` (
  `evaluationId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` INT UNSIGNED NOT NULL,
  `coachId` INT UNSIGNED NOT NULL,
  `comment` LONGTEXT NULL DEFAULT NULL,
  `ratingGameSense` INT NULL DEFAULT NULL,
  `ratingCommunication` INT NULL DEFAULT NULL,
  `ratingChampionPool` INT NULL DEFAULT NULL,
  `evaluatedAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`evaluationId`),
  INDEX `fk_applicantEvaluations_players1_idx` (`userId` ASC) ,
  INDEX `fk_applicantEvaluations_users1_idx` (`coachId` ASC) ,
  CONSTRAINT `fk_applicantEvaluations_players1`
    FOREIGN KEY (`userId`)
    REFERENCES `teamforgedb`.`players` (`userId`),
  CONSTRAINT `fk_applicantEvaluations_users1`
    FOREIGN KEY (`coachId`)
    REFERENCES `teamforgedb`.`users` (`userId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`application_periods`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`application_periods` (
  `periodId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `startDate` DATE NULL DEFAULT NULL,
  `endDate` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`periodId`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`applications`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`applications` (
  `periodId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` INT UNSIGNED NOT NULL,
  `primaryRoleId` INT NOT NULL,
  `status` VARCHAR(45) NOT NULL DEFAULT 'Pending',
  PRIMARY KEY (`periodId`, `userId`),
  INDEX `fk_applications_players1_idx` (`userId` ASC) ,
  INDEX `fk_applications_leagueRoles1_idx` (`primaryRoleId` ASC) ,
  CONSTRAINT `fk_applications_application_periods1`
    FOREIGN KEY (`periodId`)
    REFERENCES `teamforgedb`.`application_periods` (`periodId`),
  CONSTRAINT `fk_applications_leagueRoles1`
    FOREIGN KEY (`primaryRoleId`)
    REFERENCES `teamforgedb`.`leagueroles` (`roleId`),
  CONSTRAINT `fk_applications_players1`
    FOREIGN KEY (`userId`)
    REFERENCES `teamforgedb`.`players` (`userId`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`metrics`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`metrics` (
  `metricId` INT NOT NULL,
  `metricName` VARCHAR(100) NULL DEFAULT NULL,
  `metricDescription` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`metricId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`benchmarks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`benchmarks` (
  `benchmarkId` INT NOT NULL AUTO_INCREMENT,
  `metricId` INT NULL DEFAULT NULL,
  `roleId` INT NULL DEFAULT NULL,
  `benchmarkValue` DECIMAL(10,2) NULL DEFAULT NULL,
  `comparator` ENUM('>', '<', '>=', '<=') NULL DEFAULT NULL,
  PRIMARY KEY (`benchmarkId`),
  INDEX `fk_benchmarks_leagueRoles1_idx` (`roleId` ASC) ,
  INDEX `fk_benchmarks_metrics1_idx` (`metricId` ASC) ,
  CONSTRAINT `fk_benchmarks_leagueRoles1`
    FOREIGN KEY (`roleId`)
    REFERENCES `teamforgedb`.`leagueroles` (`roleId`),
  CONSTRAINT `fk_benchmarks_metrics1`
    FOREIGN KEY (`metricId`)
    REFERENCES `teamforgedb`.`metrics` (`metricId`))
ENGINE = InnoDB
AUTO_INCREMENT = 43
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`candidatefavorites`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`candidatefavorites` (
  `favoriteId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `coachId` INT UNSIGNED NOT NULL,
  `candidateUserId` INT UNSIGNED NOT NULL,
  `roleId` INT NOT NULL,
  `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`favoriteId`),
  UNIQUE INDEX `uq_candidateFavorites_coach_candidate_role` (`coachId` ASC, `candidateUserId` ASC, `roleId` ASC) ,
  INDEX `idx_candidateFavorites_coach_role` (`coachId` ASC, `roleId` ASC) ,
  INDEX `fk_candidateFavorites_players1` (`candidateUserId` ASC) ,
  INDEX `fk_candidateFavorites_leagueRoles1` (`roleId` ASC) ,
  CONSTRAINT `fk_candidateFavorites_leagueRoles1`
    FOREIGN KEY (`roleId`)
    REFERENCES `teamforgedb`.`leagueroles` (`roleId`),
  CONSTRAINT `fk_candidateFavorites_players1`
    FOREIGN KEY (`candidateUserId`)
    REFERENCES `teamforgedb`.`players` (`userId`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_candidateFavorites_users1`
    FOREIGN KEY (`coachId`)
    REFERENCES `teamforgedb`.`users` (`userId`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`matches`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`matches` (
  `matchId` VARCHAR(45) NOT NULL,
  `userId` INT UNSIGNED NOT NULL,
  `gameCreation` BIGINT NULL DEFAULT NULL,
  `gameDuration` INT NULL DEFAULT NULL,
  `gameEndTimestamp` BIGINT NULL DEFAULT NULL,
  `gameMode` VARCHAR(45) NULL DEFAULT NULL,
  `gameName` VARCHAR(45) NULL DEFAULT NULL,
  `gameStartTimestamp` BIGINT NULL DEFAULT NULL,
  `gameType` VARCHAR(45) NULL DEFAULT NULL,
  `gameVersion` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`matchId`),
  INDEX `fk_matches_players1_idx` (`userId` ASC) ,
  CONSTRAINT `fk_matches_players1`
    FOREIGN KEY (`userId`)
    REFERENCES `teamforgedb`.`players` (`userId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`matchparticipants`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`matchparticipants` (
  `matchId` VARCHAR(45) NOT NULL,
  `participantId` INT NOT NULL,
  `puuid` VARCHAR(245) NULL DEFAULT NULL,
  `riotIdGameTag` VARCHAR(45) NULL DEFAULT NULL,
  `riotIdTagline` VARCHAR(45) NULL DEFAULT NULL,
  `queueId` INT NULL DEFAULT NULL,
  `assists` INT NULL DEFAULT NULL,
  `champLevel` INT NULL DEFAULT NULL,
  `championId` INT NULL DEFAULT NULL,
  `championName` VARCHAR(45) NULL DEFAULT NULL,
  `creepScore` INT NULL DEFAULT NULL,
  `creepScorePerMinute` DECIMAL(6,2) NULL DEFAULT NULL,
  `damageDealthToBuildings` INT NULL DEFAULT NULL,
  `deaths` INT NULL DEFAULT NULL,
  `dragonKills` INT NULL DEFAULT NULL,
  `goldEarned` INT NULL DEFAULT NULL,
  `goldPerMinute` DECIMAL(6,2) NULL DEFAULT NULL,
  `kda` DECIMAL(6,2) NULL DEFAULT NULL,
  `kills` INT NULL DEFAULT NULL,
  `killParticipation` DECIMAL(6,2) NULL DEFAULT NULL,
  `item0` INT NULL DEFAULT NULL,
  `item1` INT NULL DEFAULT NULL,
  `item2` INT NULL DEFAULT NULL,
  `item3` INT NULL DEFAULT NULL,
  `item4` INT NULL DEFAULT NULL,
  `item5` INT NULL DEFAULT NULL,
  `item6` INT NULL DEFAULT NULL,
  `neutralMinionsKilled` INT NULL DEFAULT NULL,
  `role` VARCHAR(45) NULL DEFAULT NULL,
  `soloKills` INT NULL DEFAULT NULL,
  `teamId` INT NULL DEFAULT NULL,
  `teamPosition` VARCHAR(45) NULL DEFAULT NULL,
  `totalDamageDealt` INT NULL DEFAULT NULL,
  `totalDamageTaken` INT NULL DEFAULT NULL,
  `totalMinionsKilled` INT NULL DEFAULT NULL,
  `visionScore` INT NULL DEFAULT NULL,
  `visionScorePerMinute` DECIMAL(4,3) NULL DEFAULT NULL,
  `wardsKilled` INT NULL DEFAULT NULL,
  `wardsPlaced` INT NULL DEFAULT NULL,
  `win` VARCHAR(45) NULL DEFAULT NULL,
  `teamBaronKills` INT NULL DEFAULT NULL,
  `teamElderDragonKills` INT NULL DEFAULT NULL,
  `teamRiftHeraldKills` INT NULL DEFAULT NULL,
  `voidMonsterKill` INT NULL DEFAULT NULL,
  `objectiveRate` DECIMAL(6,2) NULL DEFAULT NULL,
  `xpDiffAt15` INT NULL DEFAULT NULL,
  `goldDiffAt15` INT NULL DEFAULT NULL,
  `csDiffAt15` INT NULL DEFAULT NULL,
  `damageShare` DECIMAL(6,2) NULL DEFAULT NULL,
  `visionScoreShare` DECIMAL(6,2) NULL DEFAULT NULL,
  `proximityToAdc` DECIMAL(6,2) NULL DEFAULT NULL,
  `summoner1Id` INT NULL DEFAULT NULL,
  `summoner2Id` INT NULL DEFAULT NULL,
  `primaryPerkId` INT NULL DEFAULT NULL,
  `secondaryPerkStyleId` INT NULL DEFAULT NULL,
  PRIMARY KEY (`matchId`, `participantId`),
  CONSTRAINT `fk_matchParticipants_matches1`
    FOREIGN KEY (`matchId`)
    REFERENCES `teamforgedb`.`matches` (`matchId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`metricroles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`metricroles` (
  `metricId` INT NOT NULL,
  `roleId` INT NOT NULL,
  PRIMARY KEY (`metricId`, `roleId`),
  CONSTRAINT `fk_metricRoles_metrics1`
    FOREIGN KEY (`metricId`)
    REFERENCES `teamforgedb`.`metrics` (`metricId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`playerstatistics`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`playerstatistics` (
  `userId` INT UNSIGNED NOT NULL,
  `metricId` INT NOT NULL,
  `roleId` INT NOT NULL,
  `metricValue` DOUBLE NULL DEFAULT NULL,
  `recordedAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`, `metricId`, `roleId`),
  INDEX `fk_playerStatistics_metrics1_idx` (`metricId` ASC) ,
  INDEX `fk_playerStatistics_leagueRoles1_idx` (`roleId` ASC) ,
  CONSTRAINT `fk_playerStatistics_leagueRoles1`
    FOREIGN KEY (`roleId`)
    REFERENCES `teamforgedb`.`leagueroles` (`roleId`),
  CONSTRAINT `fk_playerStatistics_metrics1`
    FOREIGN KEY (`metricId`)
    REFERENCES `teamforgedb`.`metrics` (`metricId`),
  CONSTRAINT `fk_playerStatistics_players1`
    FOREIGN KEY (`userId`)
    REFERENCES `teamforgedb`.`players` (`userId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`teamdetails`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`teamdetails` (
  `teamName` VARCHAR(45) NOT NULL,
  `teamIcon` VARCHAR(260) NULL DEFAULT NULL,
  `schoolName` VARCHAR(260) NULL,
  `schoolIcon` VARCHAR(260) NULL,
  `discordServer` VARCHAR(260) NULL DEFAULT NULL,
  PRIMARY KEY (`teamName`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`events`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`events` (
  `eventId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title_summary` TEXT NOT NULL COMMENT 'Title of the event.',
  `creator_id` INT UNSIGNED NULL COMMENT 'The userId of the event creator',
  `type` ENUM('Scrim', 'Tournament', 'Meeting', 'Other') NOT NULL COMMENT 'type ENUM(\'Scrim\', \'Tournament\', \'Meeting\', \'Other\')',
  `location` TEXT NULL,
  `start_date` DATE NULL,
  `start_datetime` DATETIME NULL,
  `start_timezone` VARCHAR(45) NULL,
  `end_date` DATE NULL,
  `end_datetime` DATETIME NULL,
  `end_timezone` VARCHAR(45) NULL,
  `videoLink` LONGTEXT NULL,
  `length` VARCHAR(45) NULL,
  `win` ENUM('W', 'L', 'N/A') NULL COMMENT 'MOVE THIS FIELD TO event_attendees nalang',
  `status` TEXT NULL,
  `google_event_id` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Google Calendar event ID - NULL for TeamForge-native events',
  PRIMARY KEY (`eventId`),
  UNIQUE INDEX `google_event_id_UNIQUE` (`google_event_id` ASC) )
ENGINE = InnoDB
AUTO_INCREMENT = 18
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`player_evaluations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`player_evaluations` (
  `eventId` INT UNSIGNED NOT NULL,
  `playerId` INT UNSIGNED NOT NULL,
  `comment` LONGTEXT NULL DEFAULT NULL,
  `ratingGameSense` INT NULL DEFAULT NULL,
  `ratingCommunication` INT NULL DEFAULT NULL,
  `ratingChampionPool` INT NULL DEFAULT NULL,
  `coachId` INT NULL DEFAULT NULL,
  `timestamp` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`eventId`, `playerId`),
  CONSTRAINT `fk_evaluations_copy1_events1`
    FOREIGN KEY (`eventId`)
    REFERENCES `teamforgedb`.`events` (`eventId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `teamforgedb`.`event_attendees`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`event_attendees` (
  `eventId` INT UNSIGNED NOT NULL,
  `userId` INT UNSIGNED NOT NULL,
  `player_role` INT NULL,
  `attendance_status` ENUM('Present', 'Late', 'Absent', 'Excused') NULL COMMENT 'attendance status\nENUM(\'Present\', \'Late\', \'Absent\', \'Excused\')',
  `notes` LONGTEXT NULL,
  `is_sub` ENUM('Y', 'N') NULL DEFAULT 'N',
  `team` ENUM('Team 1', 'Team 2', 'Sub') NOT NULL DEFAULT 'Team 1',
  `win` ENUM('W', 'L', 'N/A') NOT NULL DEFAULT 'N/A' COMMENT 'use this to indicate who won',
  PRIMARY KEY (`eventId`, `userId`),
  INDEX `fk_event_attendees_users2_idx` (`userId` ASC) ,
  INDEX `fk_event_attendees_leagueroles2_idx` (`player_role` ASC) ,
  CONSTRAINT `fk_event_attendees_events1`
    FOREIGN KEY (`eventId`)
    REFERENCES `teamforgedb`.`events` (`eventId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_event_attendees_users2`
    FOREIGN KEY (`userId`)
    REFERENCES `teamforgedb`.`users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_event_attendees_leagueroles2`
    FOREIGN KEY (`player_role`)
    REFERENCES `teamforgedb`.`leagueroles` (`roleId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
