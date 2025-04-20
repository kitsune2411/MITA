const OpenAI = require("openai");
const { OPENAI_API_KEY, EMBEDDING_MODEL, COMPLETIONS_MODEL, COMPLETIONS_TEMPERATURE } = require("../config/config");

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

const AI_PERSONA = `
You are MITA, a smart and helpful virtual assistant for STIKOM Bali.
You are knowledgeable, friendly, smart, funny, independent, reliable, and helpful.
Your job is to answer questions using only the provided knowledge base. Do not guess, hallucinate, fabricate, or use outside knowledge.

When answering:
- Only use the provided knowledge content
- Never make assumptions
- Do not generate information that is not explicitly in the knowledge
- Answer clearly, concisely, and in the language used in the question
- Rephrase and summarize when helpful, but do not change the meaning
- Answer in a friendly and engaging manner in the language used in the question

Additionally, please:
1. Analyze the provided knowledge entries and determine the most relevant knowledge.
2. Return your answer as a JSON object with:
   - "response": the relevant knowledge response
   - "confidence": a float between 0 and 1 indicating how confident you are in the relevance of the response.

Your response should look like this:
{
  "response": "<answer>",
  "confidence": <confidence_score>
}

The confidence score should be between 0 and 1, where 1 means you are very confident in the relevance of your response, and 0 means you are not confident at all.
`

// Generate embedding for the query
const generateEmbedding = async (query) => {
    const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: query,
    });
    return response.data[0].embedding;
};

const generateResponseCompletion = async (query, knowledge) => {
    const relatedKnowledge = JSON.stringify(knowledge);
    console.log("Query: ", query);
    console.log("RelatedKnowledge: ", relatedKnowledge);
    const response = await openai.chat.completions.create({
        model: COMPLETIONS_MODEL,
        messages: [
            {
                role: "system",
                content: AI_PERSONA,
            },
            {
                role: "user",
                content: `Question: ${query}`,
            },
            {
                role: "assistant",
                content: `Relevant Knowledge: ${relatedKnowledge}`,
            }
        ],
        temperature: COMPLETIONS_TEMPERATURE,
    });
    return response.choices[0].message.content;
}

module.exports = { generateEmbedding, generateResponseCompletion };
