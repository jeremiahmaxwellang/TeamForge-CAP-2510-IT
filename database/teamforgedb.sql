-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema teamforgedb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema teamforgedb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `teamforgedb` DEFAULT CHARACTER SET utf8 ;
USE `teamforgedb` ;

-- -----------------------------------------------------
-- Table `teamforgedb`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`users` (
  `userId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(254) NOT NULL,
  `passwordHash` VARCHAR(254) NULL,
  `firstname` VARCHAR(254) NOT NULL,
  `lastname` VARCHAR(254) NOT NULL,
  `position` ENUM('Team Manager', 'Team Coach', 'Player', 'Applicant') NOT NULL,
  `discord` VARCHAR(45) NULL,
  `status` ENUM('Active', 'Inactive', 'Deactivated') NOT NULL,
  `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamforgedb`.`players`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`players` (
  `userId` INT UNSIGNED NOT NULL,
  `gameName` VARCHAR(254) NULL,
  `tagLine` VARCHAR(5) NULL,
  `currentRank` VARCHAR(45) NULL,
  `peakRank` VARCHAR(45) NULL,
  `primaryRole` ENUM('TOP', 'MIDDLE', 'JUNGLE', 'CARRY', 'SUPPORT') NULL,
  `secondaryRole` ENUM('TOP', 'MIDDLE', 'JUNGLE', 'CARRY', 'SUPPORT') NULL,
  `puuid` VARCHAR(245) NULL,
  `accountRegion` ENUM('AMERICAS', 'ASIA', 'EUROPE', 'SEA') NULL,
  `schoolId` VARCHAR(45) NULL,
  `course` VARCHAR(45) NULL,
  `lastGPA` DECIMAL(6,2) NULL,
  `CGPA` DECIMAL(6,2) NULL,
  `applicationStatus` VARCHAR(45) NULL,
  `winrate` DECIMAL(6,2) NULL,
  `averageKDA` DECIMAL(6,2) NULL,
  PRIMARY KEY (`userId`),
  CONSTRAINT `fk_players_users`
    FOREIGN KEY (`userId`)
    REFERENCES `teamforgedb`.`users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamforgedb`.`announcements`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`announcements` (
  `announcementId` INT NOT NULL,
  `userId` INT UNSIGNED NOT NULL,
  `title` VARCHAR(254) NULL,
  `content` LONGTEXT NULL,
  `dateCreated` TIMESTAMP NULL,
  PRIMARY KEY (`announcementId`, `userId`),
  INDEX `fk_announcements_users1_idx` (`userId` ASC) VISIBLE,
  CONSTRAINT `fk_announcements_users1`
    FOREIGN KEY (`userId`)
    REFERENCES `teamforgedb`.`users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamforgedb`.`matches`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`matches` (
  `matchId` VARCHAR(45) NOT NULL,
  `userId` INT UNSIGNED NOT NULL,
  `gameCreation` BIGINT(20) NULL,
  `gameDuration` INT NULL,
  `gameEndTimestamp` BIGINT(20) NULL,
  `gameMode` VARCHAR(45) NULL,
  `gameName` VARCHAR(45) NULL,
  `gameStartTimestamp` BIGINT(20) NULL,
  `gameType` VARCHAR(45) NULL,
  `gameVersion` VARCHAR(45) NULL,
  PRIMARY KEY (`matchId`),
  INDEX `fk_matches_players1_idx` (`userId` ASC) VISIBLE,
  CONSTRAINT `fk_matches_players1`
    FOREIGN KEY (`userId`)
    REFERENCES `teamforgedb`.`players` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamforgedb`.`matchParticipants`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`matchParticipants` (
  `matchId` VARCHAR(45) NOT NULL,
  `participantId` INT NOT NULL,
  `puuid` VARCHAR(245) NULL,
  `riotIdGameTag` VARCHAR(45) NULL,
  `riotIdTagline` VARCHAR(45) NULL,
  `assists` INT NULL,
  `champLevel` INT NULL,
  `championId` INT NULL,
  `championName` VARCHAR(45) NULL,
  `creepScore` INT NULL,
  `creepScorePerMinute` DECIMAL(6,2) NULL,
  `damageDealthToBuildings` INT NULL,
  `deaths` INT NULL,
  `dragonKills` INT NULL,
  `goldEarned` INT NULL,
  `goldPerMinute` DECIMAL(6,2) NULL,
  `kda` DECIMAL(6,2) NULL,
  `kills` INT NULL,
  `killParticipation` DECIMAL(6,2) NULL,
  `item0` INT NULL,
  `item1` INT NULL,
  `item2` INT NULL,
  `item3` INT NULL,
  `item4` INT NULL,
  `item5` INT NULL,
  `item6` INT NULL,
  `neutralMinionsKilled` INT NULL,
  `role` VARCHAR(45) NULL,
  `soloKills` INT NULL,
  `teamId` INT NULL,
  `teamPosition` VARCHAR(45) NULL,
  `totalDamageDealt` INT NULL,
  `totalDamageTaken` INT NULL,
  `totalMinionsKilled` INT NULL,
  `visionScore` INT NULL,
  `visionScorePerMinute` DECIMAL(4,3) NULL,
  `wardsKilled` INT NULL,
  `wardsPlaced` INT NULL,
  `win` VARCHAR(45) NULL,
  `teamBaronKills` INT NULL,
  `teamElderDragonKills` INT NULL,
  `teamRiftHeraldKills` INT NULL,
  `voidMonsterKill` INT NULL,
  `objectiveRate` DECIMAL(6,2) NULL,
  `xpDiffAt15` INT NULL,
  `goldDiffAt15` INT NULL,
  `csDiffAt15` INT NULL,
  `damageShare` DECIMAL(6,2) NULL,
  `visionScoreShare` DECIMAL(6,2) NULL,
  `proximityToAdc` DECIMAL(6,2) NULL,
  PRIMARY KEY (`matchId`, `participantId`),
  CONSTRAINT `fk_matchParticipants_matches1`
    FOREIGN KEY (`matchId`)
    REFERENCES `teamforgedb`.`matches` (`matchId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamforgedb`.`vods`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`vods` (
  `userId` INT UNSIGNED NOT NULL,
  `name` VARCHAR(45) NULL,
  `date` DATE NULL,
  `videoLink` LONGTEXT NULL,
  `length` VARCHAR(45) NULL,
  `teams` VARCHAR(100) NULL,
  `win` VARCHAR(45) NULL,
  PRIMARY KEY (`userId`),
  CONSTRAINT `fk_vods_players1`
    FOREIGN KEY (`userId`)
    REFERENCES `teamforgedb`.`players` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamforgedb`.`evaluations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`evaluations` (
  `playerId` INT UNSIGNED NOT NULL,
  `comment` LONGTEXT NULL,
  `evaluationscol` VARCHAR(45) NULL,
  `ratingGameSense` INT NULL,
  `ratingCommunication` INT NULL,
  `ratingChampionPool` INT NULL,
  `coachId` INT NULL,
  PRIMARY KEY (`playerId`),
  CONSTRAINT `fk_evaluations_players1`
    FOREIGN KEY (`playerId`)
    REFERENCES `teamforgedb`.`players` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamforgedb`.`applicantQuestions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`applicantQuestions` (
  `questionId` INT NOT NULL,
  `question` LONGTEXT NULL,
  PRIMARY KEY (`questionId`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamforgedb`.`applicantAnswers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`applicantAnswers` (
  `userId` INT UNSIGNED NOT NULL,
  `questionId` INT NOT NULL,
  `answer` LONGTEXT NULL,
  PRIMARY KEY (`userId`, `questionId`),
  INDEX `fk_applicantAnswers_applicantQuestions1_idx` (`questionId` ASC) VISIBLE,
  CONSTRAINT `fk_applicantAnswers_applicantQuestions1`
    FOREIGN KEY (`questionId`)
    REFERENCES `teamforgedb`.`applicantQuestions` (`questionId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_applicantAnswers_users1`
    FOREIGN KEY (`userId`)
    REFERENCES `teamforgedb`.`users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamforgedb`.`benchmarks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`benchmarks` (
  `benchmarkId` INT NOT NULL,
  `role` ENUM('Top', 'Jungle', 'Mid', 'ADC', 'Support') NULL,
  `metricName` VARCHAR(45) NULL,
  `benchmarkValue` DECIMAL(6,2) NULL,
  `comparator` VARCHAR(45) NULL,
  PRIMARY KEY (`benchmarkId`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamforgedb`.`championPool`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamforgedb`.`championPool` (
  `userId` INT UNSIGNED NOT NULL,
  `championId` INT NOT NULL,
  `championName` VARCHAR(45) NULL,
  `games` INT NULL,
  `winrate` DECIMAL(6,2) NULL,
  `kda` DECIMAL(6,2) NULL,
  `creepScorePerMinute` DECIMAL(6,2) NULL,
  `goldPerMinute` DECIMAL(6,2) NULL,
  `damagePerMinute` DECIMAL(6,2) NULL,
  `killParticipation` DECIMAL(6,2) NULL,
  PRIMARY KEY (`userId`, `championId`),
  CONSTRAINT `fk_championPool_players1`
    FOREIGN KEY (`userId`)
    REFERENCES `teamforgedb`.`players` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
