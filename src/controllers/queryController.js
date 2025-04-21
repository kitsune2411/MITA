const { getKnowledgeByEmbedding } = require('../models/knowledgeModel');
const { generateEmbedding, generateResponseCompletion } = require('../models/queryModel');
const { logQuery } = require('../models/queryLogs');
const redis = require('../config/redis');
const { CACHE_TTL } = require('../config/config');

// Controller for handling student query
const handleQuery = async (req, res) => {
    const { query } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;

    try {
        if (!query || query.trim() === "") {
            return res.status(400).json({ message: "Query cannot be empty." });
        }

        // Check cache first
        const cacheKey = `mita:query:${query.toLowerCase().trim()}`;
        const cachedResult = await getCachedAnswer(cacheKey);
        if (cachedResult) {

            // Optional: log that this came from cache
            console.log("Cache hit:", cacheKey);
            await logQuery(
                query,
                cachedResult.response,
                cachedResult.confidence,
                cachedResult.isFallback || false,
                ipAddress,
                userAgent,
                userId,
                sessionId
            );

            return res.status(200).json({ ...cachedResult, fromCache: true });
        }

        // Generate embedding for the student's query
        const queryEmbedding = await generateEmbedding(query);

        // Fetch the most relevant knowledge entry
        const knowledge = await getKnowledgeByEmbedding(queryEmbedding);

        const result = await generateResponseCompletion(query, knowledge);

        if (!result) {
            return res.status(404).json({ message: 'No relevant information found.' });
        }

        let parsedResponse = null;
        try {
            parsedResponse = JSON.parse(result);
        } catch (error) {
            console.error("Error parsing GPT response:", error);
            return { message: "An error occurred. Please try again later." };
        }

        // Log the query and response
        await logQuery(
            query,
            parsedResponse.response || "No response",
            parsedResponse.confidence || 0,
            !!knowledge.message, // isFallback
            ipAddress,
            userAgent,
            userId,
            sessionId
        );

        // Cache the result
        await cacheAnswer(cacheKey, parsedResponse, CACHE_TTL);

        res.status(200).json(parsedResponse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getCachedAnswer = async (query) => {
    const cached = await redis.get(query);
    return cached ? JSON.parse(cached) : null;
};

const cacheAnswer = async (query, answer, ttl = 60 * 5) => { // Default TTL is 5 minutes
    await redis.set(query, JSON.stringify(answer), 'EX', ttl);
};

module.exports = { handleQuery };
