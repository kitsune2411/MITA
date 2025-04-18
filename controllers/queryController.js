const { getKnowledgeByEmbedding } = require('../models/knowledgeModel');
const { generateEmbedding } = require('../models/queryModel');

// Controller for handling student query
const handleQuery = async (req, res) => {
    const { query } = req.body;

    try {
        // Generate embedding for the student's query
        const queryEmbedding = await generateEmbedding(query);

        // Fetch the most relevant knowledge entry
        const knowledge = await getKnowledgeByEmbedding(queryEmbedding);

        if (!knowledge) {
            return res.status(404).json({ message: 'No relevant information found.' });
        }

        res.status(200).json(knowledge);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { handleQuery };
