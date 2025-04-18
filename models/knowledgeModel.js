const db = require('../config/db');

const CONFIDENCE_THRESHOLD = 0.85; // Define a constant for confidence score threshold

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

        // Fetch multiple results (e.g., top 3) with their confidence scores
        const res = await db.query(
            `SELECT k.title, k.content,
                    1 - (ke.embedding <#> $1) AS confidence_score  -- 1 - cosine_distance to get similarity
             FROM knowledge k
             JOIN knowledge_embeddings ke ON k.id = ke.knowledge_id
             WHERE k.deleted_at IS NULL
             ORDER BY ke.embedding <#> $1  -- Use the pgvector operator for cosine distance
             LIMIT 3`,  // Fetch top 3 results
            [queryEmbeddingStr]
        );

        // Check if we got results
        if (res.rows.length === 0) {
            return { message: "I'm not confident about this answer. Could you please clarify?" };
        }

        // Sort results by confidence score
        const sortedResults = res.rows.sort((a, b) => b.confidence_score - a.confidence_score);

        // Filter based on confidence threshold
        const topResult = sortedResults[0];

        if (topResult.confidence_score >= CONFIDENCE_THRESHOLD) {
            return {
                title: topResult.title,
                content: topResult.content,
                confidence: topResult.confidence_score
            };
        } else {
            return { message: "I'm not confident about this answer. Could you please clarify?" };
        }

    } catch (err) {
        console.error('Error fetching knowledge:', err);
        return { message: "An error occurred while processing your request. Please try again later." };
    }
};


module.exports = {
    insertKnowledge,
    softDeleteKnowledge,
    restoreKnowledge,
    getAllKnowledge,
    getKnowledgeByEmbedding
};
