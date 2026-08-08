 
 import { KEYWORDS } from '../data/questions'

 export async function evaluateAnswers(questions, finalAnswers, config) {
  console.log('evaluateAnswers called!') 
 const qa = questions.map((q, i) => ({ q, a: finalAnswers[i] }))
    const prompt = `You are a strict but fair interviewer evaluating a ${config.level} ${config.role} candidate. Rate each answer from 1-9. If the answer is '[Skipped]' or empty, give it 0. Questions and answers: ${qa.map((x, i) => `Q${i+1}: ${x.q}\nAnswer: ${x.a}`).join('\n\n')}. Respond ONLY with a JSON array like [7,4,8,3,6] nothing else.`

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 100,
          messages: [{ role: "user", content: prompt }]
        })
      })
      const data = await response.json()
        console.log('API response:', data)   // ye line add karo

      const scores = JSON.parse(data.choices[0].message.content.trim())
      return scores
    } catch (err) {
        console.log('API call failed:', err)   // ye line add karo

      const keywordSets = KEYWORDS[config.role][config.level]
      const scores = finalAnswers.map((answer, i) => {
        if (answer === '[Skipped]') return 0
        const text = answer.toLowerCase()
        const keywords = keywordSets[i] || []
        const matched = keywords.filter(k => text.includes(k.toLowerCase())).length
        const keywordScore = Math.min((matched / Math.max(keywords.length * 0.4, 1)) * 5, 5)
        const hasPunctuation = (text.match(/[.!?]/g) || []).length >= 2
        const hasExample = /example|instance|like|such as|for instance|when i|i did|we used|in my/.test(text)
        return Math.min(Math.max(Math.round(keywordScore + (hasPunctuation ? 1 : 0) + (hasExample ? 1 : 0)), 0), 9)
      })
      return scores

    }

}