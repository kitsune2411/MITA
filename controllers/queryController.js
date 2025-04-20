const { getKnowledgeByEmbedding } = require('../models/knowledgeModel');
const { generateEmbedding } = require('../models/queryModel');
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


        // Log the query and response
        await logQuery(
            query,
            knowledge,
            knowledge.confidence || 0,
            !!knowledge.message, // isFallback
            ipAddress,
            userAgent,
            userId,
            sessionId
        );

        if (!knowledge) {
            return res.status(404).json({ message: 'No relevant information found.' });
        }

        res.status(200).json(knowledge);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { handleQuery };
