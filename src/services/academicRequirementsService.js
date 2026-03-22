const db = require('../config/database');

const ALLOWED_METRICS = ['gpa', 'cgpa'];
const ALLOWED_COMPARATORS = ['>', '<', '>=', '<='];
const DEFAULT_REQUIREMENTS = {
    gpa: {
        comparator: '>',
        threshold: 1.0
    },
    cgpa: {
        comparator: '>',
        threshold: 1.0
    }
};

let ensureTablePromise = null;

async function ensureAcademicRequirementsTable() {
    if (!ensureTablePromise) {
        ensureTablePromise = db.query(`
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
            ) ENGINE=InnoDB
        `).catch((error) => {
            ensureTablePromise = null;
            throw error;
        });
    }

    await ensureTablePromise;
}

function createValidationError(message) {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
}

function normalizeThreshold(rawValue, label) {
    if (rawValue === undefined || rawValue === null || rawValue === '') {
        return null;
    }

    const parsedValue = Number.parseFloat(rawValue);
    if (!Number.isFinite(parsedValue)) {
        throw createValidationError(`${label} threshold must be a valid number.`);
    }

    if (parsedValue < 0 || parsedValue > 5) {
        throw createValidationError(`${label} threshold must be between 0.00 and 5.00.`);
    }

    return Number(parsedValue.toFixed(2));
}

function normalizeRequirement(metricKey, requirement) {
    const label = metricKey.toUpperCase();
    const comparator = requirement && requirement.comparator;
    const threshold = normalizeThreshold(requirement && requirement.threshold, label);

    if (threshold === null) {
        return null;
    }

    if (!ALLOWED_COMPARATORS.includes(comparator)) {
        throw createValidationError(`${label} comparator must be one of ${ALLOWED_COMPARATORS.join(', ')}.`);
    }

    return {
        metricKey,
        comparator,
        threshold
    };
}

function mapRequirements(rows) {
    const requirements = {
        gpa: {
            comparator: DEFAULT_REQUIREMENTS.gpa.comparator,
            threshold: DEFAULT_REQUIREMENTS.gpa.threshold
        },
        cgpa: {
            comparator: DEFAULT_REQUIREMENTS.cgpa.comparator,
            threshold: DEFAULT_REQUIREMENTS.cgpa.threshold
        }
    };

    rows.forEach((row) => {
        if (!ALLOWED_METRICS.includes(row.metricKey)) {
            return;
        }

        requirements[row.metricKey] = {
            comparator: row.comparator,
            threshold: row.threshold === null ? null : Number(row.threshold)
        };
    });

    return requirements;
}

async function getAcademicRequirements() {
    await ensureAcademicRequirementsTable();

    const [rows] = await db.query(
        `SELECT metricKey, comparator, threshold
         FROM academicRequirements
         WHERE metricKey IN (?, ?)
         ORDER BY metricKey ASC`,
        ALLOWED_METRICS
    );

    return mapRequirements(rows);
}

async function updateAcademicRequirements(requirements, userId) {
    await ensureAcademicRequirementsTable();

    const normalizedRequirements = ALLOWED_METRICS.map((metricKey) => ({
        metricKey,
        value: normalizeRequirement(metricKey, requirements ? requirements[metricKey] : null)
    }));

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        for (const requirementEntry of normalizedRequirements) {
            if (!requirementEntry.value) {
                await connection.query(
                    'DELETE FROM academicRequirements WHERE metricKey = ?',
                    [requirementEntry.metricKey]
                );
                continue;
            }

            await connection.query(
                `INSERT INTO academicRequirements (metricKey, comparator, threshold, updatedBy)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                    comparator = VALUES(comparator),
                    threshold = VALUES(threshold),
                    updatedBy = VALUES(updatedBy),
                    updatedAt = CURRENT_TIMESTAMP`,
                [
                    requirementEntry.value.metricKey,
                    requirementEntry.value.comparator,
                    requirementEntry.value.threshold,
                    userId || null
                ]
            );
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }

    return getAcademicRequirements();
}

module.exports = {
    getAcademicRequirements,
    updateAcademicRequirements
};