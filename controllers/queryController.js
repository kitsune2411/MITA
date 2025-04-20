const { getKnowledgeByEmbedding } = require('../models/knowledgeModel');
const { generateEmbedding, generateResponseCompletion } = require('../models/queryModel');
const { logQuery } = require('../models/queryLogs');

// Controller for handling student query
const handleQuery = async (req, res) => {
    const { query } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;

    try {
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

        res.status(200).json(parsedResponse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { handleQuery };
