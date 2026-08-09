import { QUESTIONS } from '../data/questions'

export async function generateQuestions(config) {
  const prompt = `Generate exactly 5 interview questions for a ${config.level} ${config.role} candidate. Cover a mix of technical and behavioral topics appropriate for that level. Respond ONLY with a JSON array of exactly 5 strings, nothing else. Example format: ["question one here", "question two here", "question three here", "question four here", "question five here"]`

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }]
      })
    })
    const data = await response.json()
    const questions = JSON.parse(data.choices[0].message.content.trim())

    if (!Array.isArray(questions) || questions.length !== 5) {
      throw new Error('Unexpected question format from API')
    }

    return questions
  } catch (err) {
    console.log('generateQuestions failed, using fallback:', err)
    return QUESTIONS[config.role][config.level]
  }
}