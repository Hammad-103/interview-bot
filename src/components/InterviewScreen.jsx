import { useState, useEffect, useRef } from 'react'
import { QUESTIONS, KEYWORDS } from '../data/questions'

export default function InterviewScreen({ config, onFinish }) {
  const [messages, setMessages] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceLabel, setVoiceLabel] = useState('waiting for interviewer...')
  const [showSubmit, setShowSubmit] = useState(false)
  const [phase, setPhase] = useState('bot')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const chatRef = useRef(null)
  const recognitionRef = useRef(null)
  const questions = QUESTIONS[config.role][config.level]

  useEffect(() => {
    setTimeout(() => {
      addBotMessage("Hi! I'm your AI interviewer. I'll ask you 5 questions — take your time with each answer. Ready?")
      setTimeout(() => askQuestion(0), 2000)
    }, 600)
  }, [])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  function addBotMessage(text) {
    setMessages(prev => [...prev, { type: 'bot', text }])
    speakText(text)
  }

  function addUserMessage(text) {
    setMessages(prev => [...prev, { type: 'user', text }])
  }

  function askQuestion(index) {
    if (index >= questions.length) return
    setCurrentQ(index)
    setTimeout(() => {
      addBotMessage(`Question ${index + 1}: ${questions[index]}`)
      setVoiceLabel('tap mic to answer')
      setPhase('ready')
    }, 800)
  }

  function speakText(text) {
    if (!('speechSynthesis' in window)) return
    setPhase('bot')
    setVoiceLabel('interviewer speaking...')
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.92
    utt.pitch = 1.0
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
      || voices.find(v => v.lang.startsWith('en'))
    if (preferred) utt.voice = preferred
    utt.onend = () => {
      setVoiceLabel('tap mic to answer')
      setPhase('ready')
    }
    window.speechSynthesis.speak(utt)
  }

  function toggleMic() {
    if (isListening) stopListening()
    else startListening()
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setTranscript('Speech not supported. Please use Chrome.')
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
    setIsListening(true)
    setPhase('listening')
    setVoiceLabel('listening...')
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    setPhase('ready')
    setVoiceLabel('tap mic to answer')
  }

  function submitAnswer() {
    stopListening()
    const ans = transcript.trim()
    if (!ans) { skipQuestion(); return }
    addUserMessage(ans)
    setTranscript('')
    setShowSubmit(false)
    const newAnswers = [...answers, ans]
    setAnswers(newAnswers)
    const next = currentQ + 1
    if (next < questions.length) {
      setTimeout(() => {
        const acks = ['Got it. Next question.', 'Interesting. Moving on.', 'Thanks. Here is the next one.', 'Noted. Let us continue.']
        addBotMessage(acks[Math.floor(Math.random() * acks.length)])
        setTimeout(() => askQuestion(next), 1400)
      }, 600)
    } else {
      setTimeout(() => {
        addBotMessage("That is all 5 questions! Evaluating your answers now...")
        setTimeout(() => finishInterview(newAnswers), 1200)
      }, 600)
    }
  }

  function skipQuestion() {
    stopListening()
    setTranscript('')
    setShowSubmit(false)
    const newAnswers = [...answers, '[Skipped]']
    setAnswers(newAnswers)
    const next = currentQ + 1
    if (next < questions.length) {
      setTimeout(() => askQuestion(next), 400)
    } else {
      setTimeout(() => finishInterview(newAnswers), 600)
    }
  }

  function finishInterview(finalAnswers) {
    setIsEvaluating(true)
    window.speechSynthesis.cancel()
    setPhase('bot')
    setVoiceLabel('evaluating your answers...')

    const keywordSets = KEYWORDS[config.role][config.level]

    const scores = finalAnswers.map((answer, i) => {
      if (answer === '[Skipped]') return 1

      const text = answer.toLowerCase()
      const words = text.split(/\s+/).length
      const keywords = keywordSets[i] || []

      // Keyword score (0-5)
      const matched = keywords.filter(k => text.includes(k.toLowerCase())).length
      const keywordScore = Math.min((matched / Math.max(keywords.length * 0.4, 1)) * 5, 5)

      // Length score (0-2)
      const lengthScore =
        words < 5 ? 0 :
        words < 20 ? 0.5 :
        words < 40 ? 1 :
        words < 80 ? 1.5 : 2

      // Structure score (0-2)
      const hasPunctuation = (text.match(/[.!?]/g) || []).length >= 2
      const hasExample = /example|instance|like|such as|for instance|when i|i did|we used|in my/.test(text)
      const structureScore = (hasPunctuation ? 1 : 0) + (hasExample ? 1 : 0)

      const total = Math.round(keywordScore + lengthScore + structureScore)
      return Math.min(Math.max(total, 1), 9)
    })

    onFinish({ questions, answers: finalAnswers, scores })
  }

  return (
    <div style={styles.container}>
      {isEvaluating && (
  <div style={styles.evaluatingOverlay}>
    <div style={styles.evaluatingBox}>
      <div style={styles.spinner}></div>
      <div style={styles.evalText}>Evaluating your answers...</div>
      <div style={styles.evalSub}>AI is analyzing your responses</div>
    </div>
  </div>
)}
      <div style={styles.header}>
        <div>
          <div style={styles.role}>{config.role}</div>
          <div style={styles.level}>{config.level} Level</div>
        </div>
        <div style={styles.progressWrap}>
          <div style={styles.dots}>
            {questions.map((_, i) => (
              <div key={i} style={{
                ...styles.dot,
                ...(i < currentQ ? styles.dotDone : i === currentQ ? styles.dotActive : {})
              }} />
            ))}
          </div>
          <div style={styles.qCount}>{currentQ + 1}/{questions.length}</div>
        </div>
      </div>

      <div style={styles.chat} ref={chatRef}>
        {messages.map((m, i) => (
          <div key={i} style={{ ...styles.msgRow, ...(m.type === 'user' ? styles.msgRowUser : {}) }}>
            <div style={{ ...styles.avatar, ...(m.type === 'user' ? styles.avatarUser : styles.avatarBot) }}>
              {m.type === 'bot' ? '🤖' : '👤'}
            </div>
            <div style={{ ...styles.bubble, ...(m.type === 'user' ? styles.bubbleUser : {}) }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.voicePanel}>
        <div style={styles.voiceStatus}>
          <div style={styles.barsWrap}>
            {[6, 14, 20, 12, 8, 18, 10].map((h, i) => (
              <div key={i} style={{
                ...styles.bar,
                height: `${phase === 'listening' ? Math.random() * 16 + 4 : h}px`,
                background: phase === 'listening' ? '#7c6aff' : '#6b6b80',
              }} />
            ))}
          </div>
          <div style={styles.voiceLabel}>{voiceLabel}</div>
        </div>

        <div style={styles.transcriptBox}>
          {transcript || 'Your answer will appear here as you speak...'}
        </div>

        <div style={styles.actions}>
          <button
            style={{ ...styles.micBtn, ...(isListening ? styles.micListening : styles.micIdle) }}
            onClick={toggleMic}
          >
            {isListening ? '🔴 Listening...' : '🎤 Tap to Speak'}
          </button>
          {showSubmit && (
            <button style={styles.submitBtn} onClick={submitAnswer}>Submit →</button>
          )}
          <button style={styles.skipBtn} onClick={skipQuestion}>Skip</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0f' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  evaluatingOverlay: {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(10,10,15,0.95)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 100,
},
evaluatingBox: {
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', gap: '16px',
},
spinner: {
  width: '40px', height: '40px',
  border: '3px solid rgba(124,106,255,0.2)',
  borderTop: '3px solid #7c6aff',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
},
evalText: {
  fontSize: '16px', fontWeight: '700', color: '#f0f0f8',
},
evalSub: {
  fontSize: '13px', color: '#6b6b80',
  fontFamily: "'DM Mono', monospace",
},
  role: { fontSize: '13px', fontWeight: '700', color: '#7c6aff', fontFamily: "'DM Mono', monospace" },
  level: { fontSize: '11px', color: '#6b6b80', fontFamily: "'DM Mono', monospace" },
  progressWrap: { display: 'flex', alignItems: 'center', gap: '10px' },
  dots: { display: 'flex', gap: '6px' },
  dot: { width: '8px', height: '8px', borderRadius: '50%', background: '#1a1a24', border: '1px solid rgba(255,255,255,0.13)' },
  dotDone: { background: '#22c55e', border: '1px solid #22c55e' },
  dotActive: { background: '#7c6aff', border: '1px solid #7c6aff' },
  qCount: { fontSize: '12px', color: '#6b6b80', fontFamily: "'DM Mono', monospace" },
  chat: { flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', minHeight: '320px' },
  msgRow: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  msgRowUser: { flexDirection: 'row-reverse' },
  avatar: { width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, marginTop: '2px' },
  avatarBot: { background: 'linear-gradient(135deg, #7c6aff, #a855f7)' },
  avatarUser: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.13)' },
  bubble: { background: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', borderTopLeftRadius: '4px', padding: '12px 14px', fontSize: '14px', lineHeight: '1.6', color: '#f0f0f8', maxWidth: '85%' },
  bubbleUser: { background: 'rgba(124,106,255,0.12)', border: '1px solid rgba(124,106,255,0.25)', borderRadius: '14px', borderTopRightRadius: '4px' },
  voicePanel: { padding: '16px 24px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: '12px' },
  voiceStatus: { display: 'flex', alignItems: 'center', gap: '10px' },
  barsWrap: { display: 'flex', gap: '3px', alignItems: 'center', height: '24px' },
  bar: { width: '3px', borderRadius: '2px', transition: 'height 0.15s' },
  voiceLabel: { fontSize: '12px', color: '#9999b0', fontFamily: "'DM Mono', monospace" },
  transcriptBox: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', color: '#9999b0', minHeight: '36px', fontStyle: 'italic', fontFamily: "'DM Mono', monospace", lineHeight: '1.5' },
  actions: { display: 'flex', gap: '8px' },
  micBtn: { flex: 1, padding: '12px', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '700', transition: 'all 0.2s', cursor: 'pointer' },
  micIdle: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.13)', color: '#9999b0' },
  micListening: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' },
  submitBtn: { padding: '12px 20px', background: '#7c6aff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '700', color: '#fff', cursor: 'pointer' },
  skipBtn: { padding: '12px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', fontSize: '12px', color: '#6b6b80', cursor: 'pointer' },
}