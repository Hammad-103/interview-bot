import { KEYWORDS } from "../src/data/questions.js";

export default async function handler(req, res) {
   if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }
    const { questions, finalAnswers, config } = req.body;

  const qa = questions.map((q, i) => ({
    q,
    a: finalAnswers[i]
  }));

  const prompt = `You are a supportive but honest interviewer evaluating a ${config.level} ${config.role} candidate. These answers were captured via speech-to-text during a live spoken interview, so expect run-on sentences, missing punctuation, filler words, and occasional transcription errors — do NOT penalize for grammar, phrasing, or how the answer is worded. Focus only on whether the underlying technical/conceptual understanding is correct.

Scoring guide (1-9):
- 8-9: Correct, solid understanding of the core concept, even if not exhaustive or perfectly phrased
- 6-7: Mostly correct with minor gaps or missing detail
- 4-5: Partially correct, shows some understanding but has notable gaps or a misconception
- 2-3: Attempted but mostly incorrect or too vague to show real understanding
- 0-1: Empty, "[Skipped]", or completely unrelated to the question

Be generous with partial credit — a ${config.level} candidate does not need a textbook-perfect answer to score well. If the candidate demonstrates they understand the core idea, even informally or with imperfect wording, score it 6 or above.

Questions and answers:
${qa.map((x, i) => `Q${i + 1}: ${x.q}\nAnswer: ${x.a}`).join("\n\n")}

Respond ONLY with a JSON array like [7,4,8,3,6] nothing else.`;

  try {
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
          max_tokens: 100,
          messages: [{ role: "user", content: prompt }]
        })
      }
    );
   if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }
    const data = await response.json();

    const scores = JSON.parse(
      data.choices[0].message.content.trim()
    );

    return res.status(200).json({ scores });

  } catch (err) {
    console.error("evaluateAnswers failed:", err)
    const keywordSets = KEYWORDS[config.role][config.level];

    const scores = finalAnswers.map((answer, i) => {
      if (answer === "[Skipped]" || !answer) return 0;

      const text = answer.toLowerCase();
      const keywords = keywordSets[i] || [];

      const matched = keywords.filter(
        k => text.includes(k.toLowerCase())
      ).length;

      const keywordScore = Math.min(
        (matched / Math.max(keywords.length * 0.4, 1)) * 5,
        5
      );

 

      const hasExample =
        /example|instance|like|such as|for instance|when i|i did|we used|in my/.test(text);

      return Math.min(
        Math.max(
          Math.round(
            keywordScore  +
            (hasExample ? 1 : 0)
          ),
          0
        ),
        9
      );
    });

    return res.status(200).json({ 
        fallback:true,
        scores });
  }
}