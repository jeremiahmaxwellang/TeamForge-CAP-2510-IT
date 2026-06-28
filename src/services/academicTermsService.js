const db = require('../config/database');

const DEFAULT_TERMS = [
    { termName: 'Term 1', startDate: '2026-05-01', endDate: '2026-08-31' },
    { termName: 'Term 2', startDate: '2026-09-01', endDate: '2026-12-31' },
    { termName: 'Term 3', startDate: '2027-01-01', endDate: '2027-04-30' }
];

let ensureTablePromise = null;

async function ensureAcademicTermsTable() {
    if (!ensureTablePromise) {
        ensureTablePromise = db.query(`
            CREATE TABLE IF NOT EXISTS academic_terms (
                termId INT NOT NULL AUTO_INCREMENT,
                termName VARCHAR(50) NOT NULL,
                startDate DATE NOT NULL,
                endDate DATE NOT NULL,
                PRIMARY KEY (termId)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
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

function isValidDateOnly(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) {
        return false;
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

function normalizeTerm(term, index) {
    const termName = `Term ${index + 1}`;
    const startDate = String(term?.startDate || '').trim();
    const endDate = String(term?.endDate || '').trim();

    if (!isValidDateOnly(startDate)) {
        throw createValidationError(`${termName} start date must be a valid date.`);
    }

    if (!isValidDateOnly(endDate)) {
        throw createValidationError(`${termName} end date must be a valid date.`);
    }

    if (startDate > endDate) {
        throw createValidationError(`${termName} start date must be before or equal to its end date.`);
    }

    return { termName, startDate, endDate };
}

function validateNoOverlaps(terms) {
    const sortedTerms = [...terms].sort((a, b) => a.startDate.localeCompare(b.startDate));

    for (let i = 1; i < sortedTerms.length; i += 1) {
        const previous = sortedTerms[i - 1];
        const current = sortedTerms[i];

        if (previous.endDate >= current.startDate) {
            throw createValidationError(`${previous.termName} overlaps with ${current.termName}.`);
        }
    }
}

async function seedDefaultTermsIfEmpty() {
    const [rows] = await db.query('SELECT COUNT(*) AS count FROM academic_terms');
    if (Number(rows[0].count) > 0) return;

    await db.query(
        `INSERT INTO academic_terms (termName, startDate, endDate)
         VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)`,
        DEFAULT_TERMS.flatMap((term) => [term.termName, term.startDate, term.endDate])
    );
}

async function getAcademicTerms() {
    await ensureAcademicTermsTable();
    await seedDefaultTermsIfEmpty();

    const [rows] = await db.query(`
        SELECT
            termId,
            termName,
            DATE_FORMAT(startDate, "%Y-%m-%d") AS startDate,
            DATE_FORMAT(endDate, "%Y-%m-%d") AS endDate
        FROM academic_terms
        ORDER BY termId ASC
        LIMIT 3
    `);

    return rows;
}

async function updateAcademicTerms(terms) {
    await ensureAcademicTermsTable();

    if (!Array.isArray(terms) || terms.length !== 3) {
        throw createValidationError('Exactly three academic terms are required.');
    }

    const normalizedTerms = terms.map(normalizeTerm);
    validateNoOverlaps(normalizedTerms);

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query('DELETE FROM academic_terms');

        for (const term of normalizedTerms) {
            await connection.query(
                `INSERT INTO academic_terms (termName, startDate, endDate)
                 VALUES (?, ?, ?)`,
                [term.termName, term.startDate, term.endDate]
            );
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }

    return getAcademicTerms();
}

module.exports = {
    getAcademicTerms,
    updateAcademicTerms
};