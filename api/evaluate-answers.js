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

  const prompt = `You are a strict but fair interviewer evaluating a ${config.level} ${config.role} candidate.
Rate each answer from 1-9. If the answer is '[Skipped]' or empty, give it 0.

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