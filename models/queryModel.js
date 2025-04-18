const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Generate embedding for the query
const generateEmbedding = async (query) => {
    const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: query,
    });
    return response.data[0].embedding;
};

module.exports = { generateEmbedding };
