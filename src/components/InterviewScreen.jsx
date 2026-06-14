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
          box-shadow: 0 0 60px rgba(124,106,255,0.6), 0 0 120px rgba(124,106,255,0.2);
          transform: scale(1);
        }
        50% { 
          box-shadow: 0 0 100px rgba(124,106,255,0.9), 0 0 180px rgba(168,85,247,0.5);
          transform: scale(1.05);
        }
      }
      @keyframes orbIdle {
        0%, 100% { box-shadow: 0 0 30px rgba(124,106,255,0.25); }
        50% { box-shadow: 0 0 50px rgba(124,106,255,0.35); }
      }
      @keyframes ringRotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
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
      @keyframes listeningPulse {
        0%, 100% { box-shadow: 0 0 30px rgba(124,106,255,0.3); }
        50% { box-shadow: 0 0 60px rgba(124,106,255,0.5); }
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
    setDisplayedQuestion('')
    setPhase('bot')
    setStatusText('SPEAKING')
    setBotSpeaking(true)
    const q = questions[index]
    speakText(q, () => {
      setBotSpeaking(false)
      setPhase('ready')
      setStatusText('READY')
    })
    setTimeout(() => typeQuestion(q), 1500)
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setStatusText('USE CHROME')
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
      stopListening()
    }

    recognition.start()
    recognitionRef.current = recognition
    setPhase('listening')
    setStatusText('LISTENING')
  }

  function stopListening() {
    const rec = recognitionRef.current
    recognitionRef.current = null
    if (rec) rec.stop()
    setPhase('ready')
    setStatusText('READY')
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
      setStatusText('SPEAKING')
      setBotSpeaking(true)
      const acks = ['Got it. Next question.', 'Interesting. Moving on.', 'Thank you. Here is the next one.', 'Noted. Let us continue.']
      speakText(acks[Math.floor(Math.random() * acks.length)], () => {
        setBotSpeaking(false)
        setTimeout(() => askQuestion(next), 400)
      })
    } else {
      setPhase('evaluating')
      setStatusText('EVALUATING')
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
    setStatusText('EVALUATING')

    const qa = questions.map((q, i) => ({ q, a: finalAnswers[i] }))
    const prompt = `You are a strict but fair interviewer evaluating a ${config.level} ${config.role} candidate. Rate each answer from 1-9. If the answer is '[Skipped]' or empty, give it 0. Questions and answers: ${qa.map((x, i) => `Q${i+1}: ${x.q}\nAnswer: ${x.a}`).join('\n\n')}. Respond ONLY with a JSON array like [7,4,8,3,6] nothing else.`

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
        if (answer === '[Skipped]') return 0
        const text = answer.toLowerCase()
        const keywords = keywordSets[i] || []
        const matched = keywords.filter(k => text.includes(k.toLowerCase())).length
        const keywordScore = Math.min((matched / Math.max(keywords.length * 0.4, 1)) * 5, 5)
        const hasPunctuation = (text.match(/[.!?]/g) || []).length >= 2
        const hasExample = /example|instance|like|such as|for instance|when i|i did|we used|in my/.test(text)
        return Math.min(Math.max(Math.round(keywordScore + (hasPunctuation ? 1 : 0) + (hasExample ? 1 : 0)), 0), 9)
      })
      setTimeout(() => onFinish({ questions, answers: finalAnswers, scores }), 1000)
    }
  }

  return (
    <div style={styles.container}>

      {/* Top bar */}
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

      {/* Orb area */}
      <div style={styles.orbArea}>
        <div style={styles.orbWrapper}>

          {/* Outer decorative ring */}
          <div style={{
            ...styles.outerRing,
            ...(botSpeaking ? styles.outerRingSpeaking : {}),
          }} />

          {/* Orb */}
          <div style={{
            ...styles.orb,
            ...(botSpeaking ? styles.orbSpeaking : styles.orbIdle),
            ...(phase === 'listening' ? styles.orbListening : {}),
            ...(isEvaluating ? styles.orbEvaluating : {}),
          }}>
            {isEvaluating ? (
              <div style={styles.spinnerInner} />
            ) : (
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                  fill="#fff" opacity={botSpeaking || phase === 'listening' ? 1 : 0.6} />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                  fill="#fff" opacity={botSpeaking || phase === 'listening' ? 1 : 0.6} />
              </svg>
            )}
          </div>

          {/* Status label under orb */}
          <div style={styles.statusBadge}>
            {statusText}
          </div>
        </div>
      </div>

      {/* Question box */}
      <div style={styles.questionArea}>
        <div style={styles.questionLabel}>Question {currentQ + 1} of {questions.length}</div>
        <div style={styles.questionText}>
          {displayedQuestion
            ? <>{displayedQuestion}<span style={{ animation: 'blink 1s infinite', marginLeft: '1px', color: '#7c6aff' }}>|</span></>
            : <span style={{ color: '#3a3a4a', fontStyle: 'italic' }}>Interviewer is preparing...</span>
          }
        </div>
      </div>

      {/* Answer transcript box */}
      <div style={styles.transcriptArea}>
        <div style={styles.transcriptLabel}>Your Answer</div>
        <div style={styles.transcriptInner}>
          {transcript || <span style={{ color: '#3a3a4a', fontStyle: 'italic' }}>Your answer will appear here as you speak...</span>}
        </div>
      </div>

      {/* Buttons — RECORD / PAUSE / SUBMIT / END */}
      <div style={styles.actions}>
        {phase === 'ready' && (
          <button style={styles.recordBtn} onClick={startListening}>
            RECORD
          </button>
        )}
        {phase === 'listening' && (
          <button style={styles.pauseBtn} onClick={stopListening}>
            PAUSE
          </button>
        )}
        {showSubmit && (
          <button style={styles.submitBtn} onClick={submitAnswer}>
            SUBMIT
          </button>
        )}
        {(phase === 'ready' || phase === 'listening') && (
          <button style={styles.skipBtn} onClick={skipQuestion}>
            SKIP
          </button>
        )}
        {(phase === 'ready' || phase === 'listening') && answers.length > 0 && (
          <button style={styles.endBtn} onClick={endInterview}>
            END
          </button>
        )}
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
    background: 'radial-gradient(ellipse at top, #0d0d1a 0%, #0a0a0f 60%)',
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
    letterSpacing: '1px',
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
    marginTop: '40px',
    marginBottom: '36px',
  },
  orbWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    border: '1px solid rgba(124,106,255,0.2)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -58%)',
    pointerEvents: 'none',
    transition: 'all 0.4s ease',
  },
  outerRingSpeaking: {
    border: '1px solid rgba(124,106,255,0.5)',
    boxShadow: '0 0 30px rgba(124,106,255,0.15)',
  },
  orb: {
    width: '170px',
    height: '170px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
    transition: 'all 0.4s ease',
  },
  orbIdle: {
    background: 'radial-gradient(circle at 35% 35%, #2a1f6e, #1a1240)',
    boxShadow: '0 0 30px rgba(124,106,255,0.25)',
    animation: 'orbIdle 3s ease-in-out infinite',
  },
  orbSpeaking: {
    background: 'radial-gradient(circle at 35% 35%, #7c6aff, #4c35cc)',
    animation: 'orbGlow 1.2s ease-in-out infinite',
  },
  orbListening: {
    background: 'radial-gradient(circle at 35% 35%, #5a4fd4, #3a2db0)',
    animation: 'listeningPulse 1.5s ease-in-out infinite',
  },
  orbEvaluating: {
    background: 'radial-gradient(circle at 35% 35%, #2a1f6e, #1a1240)',
    animation: 'orbIdle 3s ease-in-out infinite',
  },
  spinnerInner: {
    width: '40px', height: '40px',
    border: '3px solid rgba(255,255,255,0.2)',
    borderTop: '3px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  statusBadge: {
    fontSize: '11px',
    fontFamily: "'DM Mono', monospace",
    color: '#7c6aff',
    letterSpacing: '3px',
    fontWeight: '700',
  },

  questionArea: {
    width: '100%',
    maxWidth: '500px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(124,106,255,0.15)',
    borderRadius: '16px',
    padding: '18px 20px',
    marginBottom: '12px',
  },
  questionLabel: {
    fontSize: '10px',
    fontFamily: "'DM Mono', monospace",
    color: '#7c6aff',
    fontWeight: '700',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  questionText: {
    fontSize: '15px',
    color: '#f0f0f8',
    lineHeight: '1.6',
    fontWeight: '500',
  },

  transcriptArea: {
    width: '100%',
    maxWidth: '500px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '18px 20px',
    marginBottom: '28px',
    minHeight: '80px',
  },
  transcriptLabel: {
    fontSize: '10px',
    fontFamily: "'DM Mono', monospace",
    color: '#4a4a5a',
    fontWeight: '700',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  transcriptInner: {
    fontSize: '14px',
    color: '#c0c0d8',
    lineHeight: '1.6',
    minHeight: '24px',
  },

  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  recordBtn: {
    padding: '14px 32px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#fff',
    cursor: 'pointer',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '2px',
  },
  pauseBtn: {
    padding: '14px 32px',
    background: '#7c6aff',
    border: 'none',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#fff',
    cursor: 'pointer',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '2px',
  },
  submitBtn: {
    padding: '14px 32px',
    background: '#22c55e',
    border: 'none',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#fff',
    cursor: 'pointer',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '2px',
  },
  skipBtn: {
    padding: '14px 24px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '100px',
    fontSize: '12px',
    color: '#6b6b80',
    cursor: 'pointer',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '2px',
  },
  endBtn: {
    padding: '14px 24px',
    background: 'transparent',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '100px',
    fontSize: '12px',
    color: '#ef4444',
    cursor: 'pointer',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '2px',
  },
}