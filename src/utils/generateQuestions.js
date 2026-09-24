import { QUESTIONS } from '../data/questions'

export async function generateQuestions(config) {
  try {
    const response = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config })
    })
    const data = await response.json()
    return data.questions
  }
   catch (err) {
    console.log('generateQuestions failed:', err)
    return QUESTIONS[config.role][config.level]
  }
}