const dotenv = require('dotenv');
dotenv.config();

const CONFIDENCE_THRESHOLD = process.env.CONFIDENCE_THRESHOLD || 0.85;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
const COMPLETIONS_MODEL = process.env.COMPLETIONS_MODEL || "gpt-4";
const COMPLETIONS_TEMPERATURE = process.env.TEMPERATURE || 0.7; // temperature for randomness in completions
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

module.exports = {
    CONFIDENCE_THRESHOLD,
    EMBEDDING_MODEL,
    OPENAI_API_KEY,
    COMPLETIONS_MODEL,
    COMPLETIONS_TEMPERATURE,
};