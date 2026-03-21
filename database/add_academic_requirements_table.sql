CREATE TABLE IF NOT EXISTS academicRequirements (
  requirementId INT UNSIGNED NOT NULL AUTO_INCREMENT,
  metricKey VARCHAR(20) NOT NULL,
  comparator ENUM('>', '<', '>=', '<=') NOT NULL,
  threshold DECIMAL(4,2) NOT NULL,
  updatedBy INT UNSIGNED NULL,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (requirementId),
  UNIQUE KEY uq_academicRequirements_metricKey (metricKey),
  KEY fk_academicRequirements_users1_idx (updatedBy),
  CONSTRAINT fk_academicRequirements_users1
    FOREIGN KEY (updatedBy)
    REFERENCES users (userId)
    ON DELETE SET NULL
    ON UPDATE NO ACTION
) ENGINE=InnoDB;