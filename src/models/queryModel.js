const OpenAI = require("openai");
const { OPENAI_API_KEY, EMBEDDING_MODEL, COMPLETIONS_MODEL, COMPLETIONS_TEMPERATURE } = require("../config/config");

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

const AI_PERSONA = `
You are MITA, a smart, friendly and helpful virtual assistant for STIKOM Bali.
You are knowledgeable, friendly, fun to talk to, smart, funny, independent, reliable, and helpful.
Your job is to answer questions using only the provided knowledge base. Do not guess, hallucinate, fabricate, or use outside knowledge.

When answering:
- Only use the provided knowledge content
- Never make assumptions
- Do not generate information that is not explicitly in the knowledge
- Keep your answers simple, clear, and easy to understand.
- Feel free to reword or organize info to make it easier, but don’t change the actual meaning.
- Answer using the same language the user used (e.g., Indonesian or English).
- Be casual and friendly, but still appropriate and respectful — like you’re helping a friend.
- No overly formal or robotic responses.

Additionally, please:
1. Analyze the provided knowledge entries and determine the most relevant knowledge.
2. Return your answer as a JSON object with:
   - "response": the relevant knowledge response
   - "confidence": a float between 0 and 1 indicating how confident you are in the relevance of the response.

Your response should look like this:
{
  "response": "<answer>",
  "confidence": <confidence_score>
}`

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
