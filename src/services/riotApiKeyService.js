require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const crypto = require('crypto');
const db = require('../config/database');

const RIOT_PROVIDER = 'riot';
const CACHE_TTL_MS = 60 * 1000;

let cachedApiKey = null;
let cacheExpiresAt = 0;

function getEncryptionKey() {
    const secretMaterial = process.env.RIOT_API_KEY_SECRET || process.env.DB_PASSWORD || 'teamforge-riot-api-key';
    return crypto.createHash('sha256').update(String(secretMaterial)).digest();
}

function encryptApiKey(apiKey) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(apiKey, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
        encryptedSecret: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64')
    };
}

function decryptApiKey(row) {
    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        getEncryptionKey(),
        Buffer.from(row.iv, 'base64')
    );

    decipher.setAuthTag(Buffer.from(row.authTag, 'base64'));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(row.encryptedSecret, 'base64')),
        decipher.final()
    ]);

    return decrypted.toString('utf8');
}

function maskApiKey(apiKey) {
    if (!apiKey) return 'No Riot API key configured';
    if (apiKey.length <= 10) return `${apiKey.slice(0, 3)}****`;
    return `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`;
}

function invalidateRiotApiKeyCache() {
    cachedApiKey = null;
    cacheExpiresAt = 0;
}

async function getStoredActiveKeyRow() {
    const [rows] = await db.query(
        `SELECT credentialId, encryptedSecret, iv, authTag, createdAt, rotatedAt
         FROM apicredentials
         WHERE provider = ? AND isActive = 1
         ORDER BY COALESCE(rotatedAt, createdAt) DESC, credentialId DESC
         LIMIT 1`,
        [RIOT_PROVIDER]
    );

    return rows[0] || null;
}

async function getActiveRiotApiKey() {
    if (cachedApiKey && cacheExpiresAt > Date.now()) {
        return cachedApiKey;
    }

    const activeRow = await getStoredActiveKeyRow();
    if (activeRow) {
        const decryptedKey = decryptApiKey(activeRow);
        cachedApiKey = decryptedKey;
        cacheExpiresAt = Date.now() + CACHE_TTL_MS;
        return decryptedKey;
    }

    const fallbackApiKey = process.env.API_KEY || '';
    cachedApiKey = fallbackApiKey;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return fallbackApiKey;
}

async function getActiveRiotApiKeyStatus() {
    const activeRow = await getStoredActiveKeyRow();
    if (activeRow) {
        const apiKey = decryptApiKey(activeRow);
        return {
            hasKey: true,
            maskedKey: maskApiKey(apiKey),
            source: 'database',
            updatedAt: activeRow.rotatedAt || activeRow.createdAt || null
        };
    }

    if (process.env.API_KEY) {
        return {
            hasKey: true,
            maskedKey: maskApiKey(process.env.API_KEY),
            source: 'env',
            updatedAt: null
        };
    }

    return {
        hasKey: false,
        maskedKey: 'No Riot API key configured',
        source: 'none',
        updatedAt: null
    };
}

async function setActiveRiotApiKey(apiKey, userId) {
    const normalizedApiKey = String(apiKey || '').trim();
    if (!normalizedApiKey) {
        throw new Error('Riot API key is required.');
    }

    const encrypted = encryptApiKey(normalizedApiKey);
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        await connection.query(
            `UPDATE apicredentials
             SET isActive = 0
             WHERE provider = ? AND isActive = 1`,
            [RIOT_PROVIDER]
        );

        await connection.query(
            `INSERT INTO apicredentials (
                provider,
                encryptedSecret,
                iv,
                authTag,
                isActive,
                createdBy,
                rotatedAt
            ) VALUES (?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP)`,
            [RIOT_PROVIDER, encrypted.encryptedSecret, encrypted.iv, encrypted.authTag, userId || null]
        );

        await connection.commit();
        invalidateRiotApiKeyCache();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }

    return {
        maskedKey: maskApiKey(normalizedApiKey)
    };
}

module.exports = {
    getActiveRiotApiKey,
    getActiveRiotApiKeyStatus,
    setActiveRiotApiKey,
    invalidateRiotApiKeyCache,
    maskApiKey
};