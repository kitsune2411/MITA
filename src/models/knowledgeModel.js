const db = require('../config/db');
const { CONFIDENCE_THRESHOLD } = require('../config/config'); // Import configuration settings

// Model for inserting knowledge
const insertKnowledge = async (title, category, content, embedding) => {
    // Convert the embedding array to a vector literal format
    const embeddingStr = `[${embedding.join(',')}]`;  // Ensures correct format for pgvector

    const res = await db.query(
        'INSERT INTO knowledge(title, category, content) VALUES($1, $2, $3) RETURNING id',
        [title, category, content]
    );

    const knowledgeId = res.rows[0].id;

    // Insert the embedding in the knowledge_embeddings table
    await db.query(
        'INSERT INTO knowledge_embeddings(knowledge_id, embedding) VALUES($1, $2)',
        [knowledgeId, embeddingStr]  // Use the correct vector literal format
    );

    return knowledgeId;
};

// Soft delete a knowledge record
const softDeleteKnowledge = async (id) => {
    await db.query(
        'UPDATE knowledge SET deleted_at = NOW() WHERE id = $1',
        [id]
    );
};

// Restore a soft-deleted record
const restoreKnowledge = async (id) => {
    await db.query(
        'UPDATE knowledge SET deleted_at = NULL WHERE id = $1',
        [id]
    );
};

// Get all knowledge entries not deleted
const getAllKnowledge = async () => {
    const res = await db.query(
        'SELECT * FROM knowledge WHERE deleted_at IS NULL ORDER BY created_at DESC'
    );
    return res.rows;
};


// Model for fetching knowledge based on query
const getKnowledgeByEmbedding = async (queryEmbedding) => {
    try {
        // Convert query embedding to the correct vector literal format
        const queryEmbeddingStr = `[${queryEmbedding.join(',')}]`;  // Ensures correct format for pgvector

        // Fetch the most relevant knowledge entry based on the embedding similarity
        const res = await db.query(
            `SELECT k.title, k.content,
                    1 - (ke.embedding <#> $1) AS confidence_score
             FROM knowledge k
             JOIN knowledge_embeddings ke ON k.id = ke.knowledge_id
             WHERE k.deleted_at IS NULL
             ORDER BY ke.embedding <#> $1
             LIMIT 5`,
            [queryEmbeddingStr]
        );

        if (res.rows.length === 0) {
            return {
                message: "No relevant information found. Try asking differently!",
                confidence: 0
            };
        }

        const topResult = res.rows.filter(row => row.confidence_score >= CONFIDENCE_THRESHOLD);

        if (topResult.length > 0) {
            return topResult;
        } else {
            return {
                message: "No relevant information found. Try asking differently!",
                confidence: topResult.confidence_score
            };
        }

    } catch (err) {
        console.error('Error fetching knowledge:', err);
        return {
            message: "An error occurred while processing your request. Please try again later.",
            confidence: 0
        };
    }
};


module.exports = {
    insertKnowledge,
    softDeleteKnowledge,
    restoreKnowledge,
    getAllKnowledge,
    getKnowledgeByEmbedding
};
