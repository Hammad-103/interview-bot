import { useState, useRef } from 'react';
export function useSpeech() {
  const [displayedQuestion, setDisplayedQuestion] = useState('')
  const typingRef = useRef(null)

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
  return { displayedQuestion, typeQuestion, speakText }
}