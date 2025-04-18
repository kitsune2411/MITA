const { insertKnowledge } = require('../models/knowledgeModel');
const { generateEmbedding } = require('../models/queryModel');

// Controller for adding knowledge
const addKnowledge = async (req, res) => {
    const { title, category, content } = req.body;

    try {
        // Generate embedding for the content
        const embedding = await generateEmbedding(content);

        // Insert knowledge into the database
        const knowledgeId = await insertKnowledge(title, category, content, embedding);

        res.status(201).json({ message: 'Knowledge added successfully', knowledgeId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { addKnowledge };
