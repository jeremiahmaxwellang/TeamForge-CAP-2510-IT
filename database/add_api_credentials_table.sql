USE `teamforgedb`;

CREATE TABLE IF NOT EXISTS `apiCredentials` (
  `credentialId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `provider` VARCHAR(50) NOT NULL,
  `encryptedSecret` LONGTEXT NOT NULL,
  `iv` VARCHAR(64) NOT NULL,
  `authTag` VARCHAR(64) NOT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdBy` INT UNSIGNED NULL,
  `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `rotatedAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`credentialId`),
  INDEX `idx_apiCredentials_provider_active` (`provider`, `isActive`),
  INDEX `fk_apiCredentials_users1_idx` (`createdBy`),
  CONSTRAINT `fk_apiCredentials_users1`
    FOREIGN KEY (`createdBy`)
    REFERENCES `users` (`userId`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION
);