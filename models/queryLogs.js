const db = require('../config/db');

const logQuery = async (
    question,
    response,
    confidenceScore,
    isFallback,
    ipAddress,
    userAgent,
    userId = null,
    sessionId = null
) => {
    try {
        await db.query(
            `INSERT INTO query_logs
        (question, response, confidence_score, is_fallback, ip_address, user_agent, user_id, session_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [question, response, confidenceScore, isFallback, ipAddress, userAgent, userId, sessionId]
        );
    } catch (err) {
        console.error('Failed to log query:', err);
    }
};

module.exports = { logQuery };
