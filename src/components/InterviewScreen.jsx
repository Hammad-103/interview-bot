import { useState, useEffect, useRef } from 'react'
import { QUESTIONS, KEYWORDS } from '../data/questions'

export default function InterviewScreen({ config, onFinish }) {
  const [phase, setPhase] = useState('bot')
  const [currentQ, setCurrentQ] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [displayedQuestion, setDisplayedQuestion] = useState('')
  const [answers, setAnswers] = useState([])
  const [transcript, setTranscript] = useState('')
  const [showSubmit, setShowSubmit] = useState(false)
  const [statusText, setStatusText] = useState('Interviewer is joining...')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [botSpeaking, setBotSpeaking] = useState(false)
  const recognitionRef = useRef(null)
  const typingRef = useRef(null)
  const questions = QUESTIONS[config.role][config.level]

  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @keyframes orbGlow {
        0%, 100% { 
          box-shadow: 0 0 40px rgba(124,106,255,0.5), 0 0 80px rgba(124,106,255,0.2);
          transform: scale(1);
        }
        50% { 
          box-shadow: 0 0 80px rgba(124,106,255,0.8), 0 0 140px rgba(168,85,247,0.4);
          transform: scale(1.04);
        }
      }
      @keyframes orbIdle {
        0%, 100% { box-shadow: 0 0 20px rgba(124,106,255,0.2); }
        50% { box-shadow: 0 0 30px rgba(124,106,255,0.3); }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  useEffect(() => {
    setTimeout(() => {
      const introText = "Hi! I'm your AI interviewer. I'll ask you 5 questions — take your time with each answer. Ready?"
      setStatusText('Interviewer is speaking...')
      setBotSpeaking(true)
      speakText(introText, () => {
        setBotSpeaking(false)
        setTimeout(() => askQuestion(0), 500)
      })
    }, 800)
  }, [])

  function typeQuestion(text) {
    if (typingRef.current) clearInterval(typingRef.current)
    setDisplayedQuestion('')
    let i = 0
    typingRef.current = setInterval(() => {
      i++
      setDisplayedQuestion(text.slice(0, i))
      if (i >= text.length) clearInterval(typingRef.current)
    }, 50)
  }

  function speakText(text, onDone) {
    if (!('speechSynthesis' in window)) {
      onDone && onDone()
      return
    }
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.92
    utt.pitch = 1.0
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
      || voices.find(v => v.lang.startsWith('en'))
    if (preferred) utt.voice = preferred
    utt.onend = () => { onDone && onDone() }
    window.speechSynthesis.speak(utt)
  }

  function askQuestion(index) {
    if (index >= questions.length) return
    setCurrentQ(index)
    setCurrentQuestion(questions[index])
    setDisplayedQuestion('') // ← pehle clear karo
    setPhase('bot')
    setStatusText('Interviewer is speaking...')
    setBotSpeaking(true)

    const q = questions[index]

    // Speech aur typing saath shuru
    speakText(q, () => {
      setBotSpeaking(false)
      setPhase('ready')
      setStatusText('Tap the mic to answer')
    })

    // Typing thodi der baad shuru — jab bot bolna start kare
    setTimeout(() => typeQuestion(q), 1500)
  }
  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setStatusText('Please use Chrome for voice support')
      return
    }

    let final = ''
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript
        else interim += e.results[i][0].transcript
      }
      setTranscript(final + interim)
      if (final.trim()) setShowSubmit(true)
    }

    recognition.onend = () => {
      if (recognitionRef.current) {
        recognitionRef.current = null
        const newRec = new SR()
        newRec.continuous = false
        newRec.interimResults = true
        newRec.lang = 'en-US'
        newRec.onresult = recognition.onresult
        newRec.onend = recognition.onend
        newRec.onerror = recognition.onerror
        newRec.start()
        recognitionRef.current = newRec
      }
    }

    recognition.onerror = (e) => {
      if (e.error === 'no-speech') return
      setStatusText('Mic error — try again')
      stopListening()
    }

    recognition.start()
    recognitionRef.current = recognition
    setPhase('listening')
    setStatusText('Listening... speak your answer')
  }

  function stopListening() {
    const rec = recognitionRef.current
    recognitionRef.current = null
    if (rec) rec.stop()
    setPhase('ready')
    setStatusText('Tap submit or speak again')
  }

  function submitAnswer() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    const ans = transcript.trim()
    if (!ans) { skipQuestion(); return }
    setTranscript('')
    setShowSubmit(false)
    const newAnswers = [...answers, ans]
    setAnswers(newAnswers)
    const next = currentQ + 1
    if (next < questions.length) {
      setPhase('bot')
      setStatusText('Interviewer is speaking...')
      setBotSpeaking(true)
      const acks = ['Got it. Next question.', 'Interesting. Moving on.', 'Thank you. Here is the next one.', 'Noted. Let us continue.']
      speakText(acks[Math.floor(Math.random() * acks.length)], () => {
        setBotSpeaking(false)
        setTimeout(() => askQuestion(next), 400)
      })
    } else {
      setPhase('evaluating')
      setStatusText('Evaluating your answers...')
      speakText('That is all 5 questions. Evaluating your answers now.', () => {
        finishInterview(newAnswers)
      })
    }
  }

  function skipQuestion() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setTranscript('')
    setShowSubmit(false)
    const newAnswers = [...answers, '[Skipped]']
    setAnswers(newAnswers)
    const next = currentQ + 1
    if (next < questions.length) {
      setTimeout(() => askQuestion(next), 400)
    } else {
      finishInterview(newAnswers)
    }
  }

  function endInterview() {
    const rec = recognitionRef.current
    recognitionRef.current = null
    if (rec) rec.stop()
    const finalAnswers = [...answers]
    while (finalAnswers.length < questions.length) {
      finalAnswers.push('[Skipped]')
    }
    finishInterview(finalAnswers)
  }

  async function finishInterview(finalAnswers) {
    window.speechSynthesis.cancel()
    setIsEvaluating(true)
    setPhase('evaluating')
    setBotSpeaking(false)
    setStatusText('AI is analyzing your answers...')

    const qa = questions.map((q, i) => ({ q, a: finalAnswers[i] }))
    const prompt = `You are a strict but fair interviewer evaluating a ${config.level} ${config.role} candidate. Rate each answer from 1-9. Questions and answers: ${qa.map((x, i) => `Q${i+1}: ${x.q}\nAnswer: ${x.a}`).join('\n\n')}. Respond ONLY with a JSON array like [7,4,8,3,6] nothing else.`

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 100,
          messages: [{ role: "user", content: prompt }]
        })
      })
      const data = await response.json()
      const scores = JSON.parse(data.content[0].text.trim())
      setTimeout(() => onFinish({ questions, answers: finalAnswers, scores }), 1000)
    } catch (err) {
      const keywordSets = KEYWORDS[config.role][config.level]
      const scores = finalAnswers.map((answer, i) => {
        if (answer === '[Skipped]') return 1
        const text = answer.toLowerCase()
        const keywords = keywordSets[i] || []
        const matched = keywords.filter(k => text.includes(k.toLowerCase())).length
        const keywordScore = Math.min((matched / Math.max(keywords.length * 0.4, 1)) * 5, 5)
        const hasPunctuation = (text.match(/[.!?]/g) || []).length >= 2
        const hasExample = /example|instance|like|such as|for instance|when i|i did|we used|in my/.test(text)
        return Math.min(Math.max(Math.round(keywordScore + (hasPunctuation ? 1 : 0) + (hasExample ? 1 : 0)), 1), 9)
      })
      setTimeout(() => onFinish({ questions, answers: finalAnswers, scores }), 1000)
    }
  }

  return (
    <div style={styles.container}>

      <div style={styles.topBar}>
        <div style={styles.roleTag}>{config.role} · {config.level}</div>
        <div style={styles.progressDots}>
          {questions.map((_, i) => (
            <div key={i} style={{
              ...styles.dot,
              ...(i < currentQ ? styles.dotDone : i === currentQ ? styles.dotActive : {})
            }} />
          ))}
        </div>
      </div>

      {/* ✅ Sirf ek bada orb — center mein */}
      <div style={styles.orbArea}>
        <div style={styles.orbWrapper}>
          <div style={{
            ...styles.orb,
            ...(botSpeaking ? styles.orbSpeaking : styles.orbIdle),
            ...(isEvaluating ? styles.orbEvaluating : {}),
          }}>
            {isEvaluating ? (
              <div style={styles.spinnerInner} />
            ) : (
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                  fill={botSpeaking ? '#fff' : '#a855f7'} />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                  fill={botSpeaking ? '#fff' : '#7c6aff'} />
              </svg>
            )}
          </div>
          <div style={styles.orbLabel}>AI Interviewer</div>
        </div>
      </div>

      <div style={{ ...styles.statusText, animation: 'fadeIn 0.3s ease' }}>
        {statusText}
      </div>

      <div style={styles.questionArea}>
        <div style={styles.questionLabel}>Question {currentQ + 1}</div>
        <div style={styles.questionText}>
          {displayedQuestion
            ? <>{displayedQuestion}<span style={{ animation: 'blink 1s infinite', marginLeft: '1px' }}>|</span></>
            : <span style={{ color: '#3a3a4a', fontStyle: 'italic' }}>Interviewer is preparing...</span>
          }
        </div>
      </div>

      <div style={styles.transcriptArea}>
        <div style={styles.transcriptInner}>
          {transcript || <span style={{ color: '#3a3a4a', fontStyle: 'italic' }}>Your answer will appear here...</span>}
        </div>
      </div>

      <div style={styles.actions}>
        {phase === 'ready' && (
          <button style={styles.micBtn} onClick={startListening}>
            🎤 Tap to Answer
          </button>
        )}
        {phase === 'listening' && (
          <button style={styles.stopBtn} onClick={stopListening}>
            ⏹ Stop
          </button>
        )}
        {showSubmit && (
          <button style={styles.submitBtn} onClick={submitAnswer}>
            Submit Answer →
          </button>
        )}
        {(phase === 'ready' || phase === 'listening') && (
          <button style={styles.skipBtn} onClick={skipQuestion}>
            Skip
          </button>
        )}
        {(phase === 'ready' || phase === 'listening') && answers.length > 0 && (
          <button style={styles.endBtn} onClick={endInterview}>
            End Interview
          </button>
        )}
      </div>

      <div style={styles.qHint}>
        Question {currentQ + 1} of {questions.length}
      </div>

    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#0a0a0f',
    padding: '0 24px 40px',
  },
  topBar: {
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 0 0',
  },
  roleTag: {
    fontSize: '12px',
    fontFamily: "'DM Mono', monospace",
    color: '#7c6aff',
    fontWeight: '700',
  },
  progressDots: { display: 'flex', gap: '6px' },
  dot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#1a1a24', border: '1px solid rgba(255,255,255,0.13)',
  },
  dotDone: { background: '#22c55e', border: '1px solid #22c55e' },
  dotActive: { background: '#7c6aff', border: '1px solid #7c6aff' },
  orbArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '50px',
    marginBottom: '40px',
  },
  orbWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    position: 'relative',
  },
  orb: {
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    border: '2px solid rgba(124,106,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
    transition: 'all 0.4s ease',
  },
  orbIdle: {
    animation: 'orbIdle 3s ease-in-out infinite',
  },
  orbSpeaking: {
    background: 'linear-gradient(135deg, #7c6aff, #a855f7)',
    border: '2px solid rgba(255,255,255,0.3)',
    animation: 'orbGlow 1.2s ease-in-out infinite',
  },
  orbEvaluating: {
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    border: '2px solid rgba(124,106,255,0.5)',
    animation: 'orbIdle 3s ease-in-out infinite',
  },
  spinnerInner: {
    width: '40px', height: '40px',
    border: '3px solid rgba(124,106,255,0.2)',
    borderTop: '3px solid #7c6aff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  orbLabel: {
    fontSize: '12px',
    color: '#6b6b80',
    fontFamily: "'DM Mono', monospace",
  },
  statusText: {
    fontSize: '15px',
    color: '#9999b0',
    fontFamily: "'DM Mono', monospace",
    marginBottom: '24px',
  },
  questionArea: {
    display: 'block',
    width: '100%',
    maxWidth: '460px',
    background: 'rgba(124,106,255,0.06)',
    border: '1px solid rgba(124,106,255,0.25)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '12px',
  },
  questionLabel: {
    fontSize: '11px',
    fontFamily: "'DM Mono', monospace",
    color: '#7c6aff',
    fontWeight: '700',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  questionText: {
    fontSize: '14px',
    color: '#f0f0f8',
    lineHeight: '1.6',
  },
  transcriptArea: {
    display: 'block',
    width: '100%',
    maxWidth: '460px',
    background: '#111118',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '24px',
    minHeight: '60px',
  },
  transcriptInner: {
    display: 'block',
    fontSize: '14px',
    color: '#f0f0f8',
    lineHeight: '1.6',
    minHeight: '24px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  micBtn: {
    padding: '14px 28px',
    background: '#7c6aff',
    border: 'none',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#fff',
    cursor: 'pointer',
    fontFamily: "'Syne', sans-serif",
  },
  stopBtn: {
    padding: '14px 28px',
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#ef4444',
    cursor: 'pointer',
    fontFamily: "'Syne', sans-serif",
  },
  submitBtn: {
    padding: '14px 24px',
    background: '#22c55e',
    border: 'none',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#fff',
    cursor: 'pointer',
    fontFamily: "'Syne', sans-serif",
  },
  skipBtn: {
    padding: '14px 20px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '100px',
    fontSize: '13px',
    color: '#6b6b80',
    cursor: 'pointer',
    fontFamily: "'Syne', sans-serif",
  },
  endBtn: {
    padding: '14px 20px',
    background: 'transparent',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '100px',
    fontSize: '13px',
    color: '#ef4444',
    cursor: 'pointer',
    fontFamily: "'Syne', sans-serif",
  },
  qHint: {
    fontSize: '11px',
    color: '#3a3a4a',
    fontFamily: "'DM Mono', monospace",
  },
}