import { useState, useRef } from 'react';
export function useVoiceRecognition(onStateChange,onPhaseChange,onShowSubmit){
       
    const [transcript, setTranscript] = useState('')
      const recognitionRef = useRef(null)
    
    function startListening() {
         console.log('startListening called')
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  console.log('SR support:', SR)
        if (!SR) {
          onStateChange('USE CHROME')
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
          if (final.trim()) onShowSubmit(true)
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
  console.log('recognition error:', e.error)   // ye line add karo
  if (e.error === 'no-speech') return
  if (e.error === 'not-allowed') {
  alert('Microphone permission denied. Please allow microphone access to continue.')
}
  stopListening()
}

    
        recognition.start()
        recognitionRef.current = recognition
        onPhaseChange('listening')
        onStateChange('LISTENING')
      }
    
      function stopListening() {
        const rec = recognitionRef.current
        recognitionRef.current = null
        if (rec) rec.stop()
        onPhaseChange('ready')
        onStateChange('READY')
      }
  function resetTranscript() {
  setTranscript('')
}
    
    return { startListening, stopListening, transcript, resetTranscript }
}