import { QUESTIONS } from "../src/data/questions.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { config } = req.body;

    const prompt = `
Generate exactly 5 interview questions for a ${config.level} ${config.role} candidate.

Cover a mix of technical and behavioral topics appropriate for that level.

Write all questions in plain spoken English — avoid symbols like ==, ===, !=, &&, ||, etc. Spell them out in words (e.g. "double equals" instead of "==").

Respond ONLY with a JSON array of exactly 5 strings, nothing else.

Example format:
["question one here", "question two here", "question three here", "question four here", "question five here"]

 `;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();

    const questions = JSON.parse(
      data.choices[0].message.content.trim()
    );

    if (!Array.isArray(questions) || questions.length !== 5) {
      throw new Error("Unexpected question format from API");
    }

    return res.status(200).json({
      questions
    });

  } catch (err) {
    console.error("generateQuestions failed:", err);

    const { config } = req.body;

    const fallback =
      QUESTIONS?.[config?.role]?.[config?.level] || [];

    return res.status(200).json({
      questions: fallback,
      fallback: true
    });
  }
}