 
 import { KEYWORDS } from '../data/questions'

 export async function evaluateAnswers(questions, finalAnswers, config) {
  
try{
  const response = await fetch('/api/evaluate-answers',{
    method:'POST',
    headers:{'Content-Type': 'application/json'},
    body:JSON.stringify({questions, finalAnswers,config})
  })
  const data = await response.json()
  return data.scores
}
catch(err){
console.log('API call failed:', err)  
    const keywordSets = KEYWORDS[config.role][config.level] 
  const scores = finalAnswers.map((answer, i) => { if (answer === '[Skipped]') return 0 
  const text = answer.toLowerCase() 
  const keywords = keywordSets[i] || [] 
  const matched = keywords.filter(k => text.includes(k.toLowerCase())).length 
  const keywordScore = Math.min((matched / Math.max(keywords.length * 0.4, 1)) * 5, 5) 
  const hasExample = /example|instance|like|such as|for instance|when i|i did|we used|in my/.test(text) 
  return Math.min(Math.max(Math.round(keywordScore  + (hasExample ? 1 : 0)), 0), 9) }) 
  return scores
}
    }

