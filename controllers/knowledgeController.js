const { insertKnowledge, softDeleteKnowledge, restoreKnowledge: restoreKnowledgeModel, getAllKnowledge: fetchAllKnowledge } = require('../models/knowledgeModel');
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

// Controller for soft-deleting knowledge
const deleteKnowledge = async (req, res) => {
    const { id } = req.params;

    try {
        await softDeleteKnowledge(id);
        res.status(200).json({ message: `Knowledge with ID ${id} deleted successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Controller for restoring deleted knowledge
const restoreKnowledge = async (req, res) => {
    const { id } = req.params;

    try {
        await restoreKnowledgeModel(id);
        res.status(200).json({ message: `Knowledge with ID ${id} restored successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Controller for listing all active (non-deleted) knowledge
const getAllKnowledge = async (req, res) => {
    try {
        const knowledgeList = await fetchAllKnowledge();
        res.status(200).json(knowledgeList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    addKnowledge,
    deleteKnowledge,
    restoreKnowledge,
    getAllKnowledge
};
