const OpenAI = require("openai");
const { OPENAI_API_KEY, EMBEDDING_MODEL } = require("../config/config");

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

// Generate embedding for the query
const generateEmbedding = async (query) => {
    const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: query,
    });
    return response.data[0].embedding;
};

module.exports = { generateEmbedding };
