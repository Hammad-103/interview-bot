import { useState, useEffect, useRef } from 'react'
import { QUESTIONS, KEYWORDS } from '../data/questions'

export default function InterviewScreen({ config, onFinish }) {
  const [phase, setPhase] = useState('bot') // bot | ready | listening | evaluating
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([])
  const [transcript, setTranscript] = useState('')
  const [showSubmit, setShowSubmit] = useState(false)
  const [statusText, setStatusText] = useState('Interviewer is joining...')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const recognitionRef = useRef(null)
  const questions = QUESTIONS[config.role][config.level]

  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @keyframes ripple {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2.2); opacity: 0; }
      }
      @keyframes ripple2 {
        0% { transform: scale(1); opacity: 0.4; }
        100% { transform: scale(1.8); opacity: 0; }
      }
      @keyframes ripple3 {
        0% { transform: scale(1); opacity: 0.3; }
        100% { transform: scale(2.6); opacity: 0; }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.06); }
      }
      @keyframes userPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
        50% { transform: scale(1.04); box-shadow: 0 0 0 20px rgba(239,68,68,0); }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  useEffect(() => {
    setTimeout(() => {
      const introText = "Hi! I'm your AI interviewer. I'll ask you 5 questions — take your time with each answer. Ready?"
      setStatusText('Interviewer is speaking...')
      setPhase('bot')
      speakText(introText, () => {
        setTimeout(() => askQuestion(0), 500)
      })
    }, 800)
  }, [])

  function speakText(text, onDone) {
    if (!('speechSynthesis' in window)) {
      onDone && onDone()
      return
    }
    setPhase('bot')
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.92
    utt.pitch = 1.0
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
      || voices.find(v => v.lang.startsWith('en'))
    if (preferred) utt.voice = preferred
    utt.onend = () => {
      onDone && onDone()
    }
    window.speechSynthesis.speak(utt)
  }

  function askQuestion(index) {
    if (index >= questions.length) return
    setCurrentQ(index)
    setPhase('bot')
    setStatusText('Interviewer is speaking...')
    speakText(`Question ${index + 1}. ${questions[index]}`, () => {
      setPhase('ready')
      setStatusText('Tap the mic to answer')
    })
  }

  function toggleMic() {
    if (phase === 'listening') stopListening()
    else if (phase === 'ready') startListening()
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setStatusText('Use Chrome for voice support')
      return
    }
    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    let final = ''

    recognition.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript
        else interim += e.results[i][0].transcript
      }
      setTranscript(final + interim)
      if (final.trim()) setShowSubmit(true)
    }

    recognition.onerror = () => stopListening()
    recognition.start()
    recognitionRef.current = recognition
    setPhase('listening')
    setStatusText('Listening...')
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setPhase('ready')
    setStatusText('Tap submit or continue speaking')
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
      const acks = ['Got it. Next question.', 'Interesting. Moving on.', 'Thank you. Here is the next one.', 'Noted. Let us continue.']
      speakText(acks[Math.floor(Math.random() * acks.length)], () => {
        setTimeout(() => askQuestion(next), 400)
      })
    } else {
      setPhase('bot')
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

  async function finishInterview(finalAnswers) {
    window.speechSynthesis.cancel()
    setIsEvaluating(true)
    setPhase('evaluating')
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
      onFinish({ questions, answers: finalAnswers, scores })
    } catch (err) {
      // Fallback to keyword scoring
      const keywordSets = KEYWORDS[config.role][config.level]
      const scores = finalAnswers.map((answer, i) => {
        if (answer === '[Skipped]') return 1
        const text = answer.toLowerCase()
        const words = text.split(/\s+/).length
        const keywords = keywordSets[i] || []
        const matched = keywords.filter(k => text.includes(k.toLowerCase())).length
        const keywordScore = Math.min((matched / Math.max(keywords.length * 0.4, 1)) * 5, 5)
        const lengthScore = words < 5 ? 0 : words < 20 ? 0.5 : words < 40 ? 1 : words < 80 ? 1.5 : 2
        const hasPunctuation = (text.match(/[.!?]/g) || []).length >= 2
        const hasExample = /example|instance|like|such as|for instance|when i|i did|we used|in my/.test(text)
        return Math.min(Math.max(Math.round(keywordScore + lengthScore + (hasPunctuation ? 1 : 0) + (hasExample ? 1 : 0)), 1), 9)
      })
      onFinish({ questions, answers: finalAnswers, scores })
    }
  }

  const botSpeaking = phase === 'bot'
  const userListening = phase === 'listening'

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

      {/* Main orb area */}
      <div style={styles.orbArea}>

        {/* Bot orb */}
        <div style={styles.orbWrapper}>
          {botSpeaking && (
            <>
              <div style={{ ...styles.ring, animation: 'ripple 1.6s ease-out infinite' }} />
              <div style={{ ...styles.ring, animation: 'ripple2 1.6s ease-out infinite 0.4s' }} />
              <div style={{ ...styles.ring, animation: 'ripple3 1.6s ease-out infinite 0.8s' }} />
            </>
          )}
          <div style={{
            ...styles.orb,
            ...(botSpeaking ? styles.orbSpeaking : {}),
            ...(isEvaluating ? styles.orbEvaluating : {}),
          }}>
            {isEvaluating ? (
              <div style={styles.spinnerInner} />
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill={botSpeaking ? '#fff' : '#7c6aff'} opacity={botSpeaking ? 1 : 0.7} />
                <circle cx="12" cy="12" r="10" stroke={botSpeaking ? 'rgba(255,255,255,0.3)' : 'rgba(124,106,255,0.3)'} strokeWidth="1" fill="none" />
                {/* mic icon */}
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill={botSpeaking ? '#fff' : '#a855f7'} />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill={botSpeaking ? '#fff' : '#7c6aff'} />
              </svg>
            )}
          </div>
          <div style={styles.orbLabel}>AI Interviewer</div>
        </div>

        {/* VS divider */}
        <div style={styles.vsDivider}>
          <div style={styles.vsLine} />
          <div style={styles.vsText}>vs</div>
          <div style={styles.vsLine} />
        </div>

        {/* User orb */}
        <div style={styles.orbWrapper}>
          {userListening && (
            <>
              <div style={{ ...styles.ringRed, animation: 'ripple 1.2s ease-out infinite' }} />
              <div style={{ ...styles.ringRed, animation: 'ripple2 1.2s ease-out infinite 0.3s' }} />
            </>
          )}
          <div
            style={{
              ...styles.orbUser,
              ...(userListening ? styles.orbUserListening : {}),
              ...(phase === 'ready' ? { cursor: 'pointer' } : {}),
            }}
            onClick={toggleMic}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                fill={userListening ? '#fff' : '#9999b0'} />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                fill={userListening ? '#fff' : '#6b6b80'} />
            </svg>
          </div>
          <div style={styles.orbLabel}>You</div>
        </div>
      </div>

      {/* Status text */}
      <div style={styles.statusText}>{statusText}</div>

      {/* Transcript */}
      {(transcript || phase === 'listening') && (
        <div style={styles.transcriptArea}>
          <div style={styles.transcriptInner}>
            {transcript || 'Listening...'}
          </div>
        </div>
      )}

      {/* Action buttons */}
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
      </div>

      {/* Question number hint */}
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
    gap: '32px',
    marginTop: '60px',
    marginBottom: '40px',
  },
  orbWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    border: '2px solid rgba(124,106,255,0.5)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 0,
  },
  ringRed: {
    position: 'absolute',
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    border: '2px solid rgba(239,68,68,0.5)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 0,
  },
  orb: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    border: '2px solid rgba(124,106,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
    transition: 'all 0.3s',
  },
  orbSpeaking: {
    background: 'linear-gradient(135deg, #7c6aff, #a855f7)',
    border: '2px solid rgba(255,255,255,0.2)',
    animation: 'pulse 1.5s ease-in-out infinite',
    boxShadow: '0 0 40px rgba(124,106,255,0.4)',
  },
  orbEvaluating: {
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    border: '2px solid rgba(124,106,255,0.5)',
  },
  spinnerInner: {
    width: '32px', height: '32px',
    border: '3px solid rgba(124,106,255,0.2)',
    borderTop: '3px solid #7c6aff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  orbUser: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    background: '#111118',
    border: '2px solid rgba(255,255,255,0.07)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
    transition: 'all 0.3s',
  },
  orbUserListening: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    border: '2px solid rgba(255,255,255,0.2)',
    animation: 'userPulse 1s ease-in-out infinite',
    boxShadow: '0 0 40px rgba(239,68,68,0.4)',
  },
  orbLabel: {
    fontSize: '12px',
    color: '#6b6b80',
    fontFamily: "'DM Mono', monospace",
    marginTop: '4px',
  },
  vsDivider: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  vsLine: {
    width: '1px',
    height: '30px',
    background: 'rgba(255,255,255,0.07)',
  },
  vsText: {
    fontSize: '11px',
    color: '#3a3a4a',
    fontFamily: "'DM Mono', monospace",
    fontWeight: '700',
  },

  statusText: {
    fontSize: '15px',
    color: '#9999b0',
    fontFamily: "'DM Mono', monospace",
    marginBottom: '24px',
    animation: 'fadeIn 0.3s ease',
  },

  transcriptArea: {
    width: '100%',
    maxWidth: '460px',
    background: '#111118',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '24px',
    animation: 'fadeIn 0.3s ease',
  },
  transcriptInner: {
    fontSize: '14px',
    color: '#f0f0f8',
    lineHeight: '1.6',
    fontStyle: 'italic',
  },

  actions: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
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

  qHint: {
    fontSize: '11px',
    color: '#3a3a4a',
    fontFamily: "'DM Mono', monospace",
  },
}