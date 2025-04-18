const db = require('../config/db');

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


// Model for fetching knowledge based on query
const getKnowledgeByEmbedding = async (queryEmbedding) => {
    // Convert query embedding to the correct vector literal format
    const queryEmbeddingStr = `[${queryEmbedding.join(',')}]`;  // Ensures correct format for pgvector

    const res = await db.query(
        `SELECT k.title, k.content
         FROM knowledge k
         JOIN knowledge_embeddings ke ON k.id = ke.knowledge_id
         ORDER BY ke.embedding <#> $1 -- Use the pgvector operator for cosine similarity
         LIMIT 1`,
        [queryEmbeddingStr]  // Pass the query embedding as a valid vector literal
    );

    return res.rows[0];
};

module.exports = { insertKnowledge, getKnowledgeByEmbedding };
