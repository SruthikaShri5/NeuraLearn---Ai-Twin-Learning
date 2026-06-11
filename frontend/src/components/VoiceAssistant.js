import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Mic, MicOff, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { speak, stopSpeaking } from '@/lib/tts';

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

const COMMANDS_LIST = [
  { say: '"next" / "continue"', does: 'Next question or section' },
  { say: '"back" / "previous"', does: 'Go to previous question' },
  { say: '"read" / "repeat"', does: 'Read current content aloud' },
  { say: '"quiz" / "start quiz"', does: 'Begin the quiz' },
  { say: '"option 1" / "first"', does: 'Select option A' },
  { say: '"option 2" / "second"', does: 'Select option B' },
  { say: '"option 3" / "third"', does: 'Select option C' },
  { say: '"option 4" / "fourth"', does: 'Select option D' },
];

export default function VoiceAssistant({ onCommand }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  const handleVoiceCommand = useCallback((text) => {
    let cmd = null;
    let fb = "";

    if (text.includes("next") || text.includes("continue") || text.includes("forward")) {
      cmd = 'next'; fb = "Going forward";
    } else if (text.includes("previous") || text.includes("back") || text.includes("go back")) {
      cmd = 'prev'; fb = "Going back";
    } else if (text.includes("read") || text.includes("repeat") || text.includes("speak")) {
      cmd = 'read'; fb = "Reading again";
    } else if (text.includes("quiz") || text.includes("start quiz") || text.includes("test")) {
      cmd = 'quiz'; fb = "Starting quiz";
    } else if (text.includes("option a") || text.includes("option 1") || text.includes("first")) {
      onCommand('select', 0); fb = "Selected option A";
    } else if (text.includes("option b") || text.includes("option 2") || text.includes("second")) {
      onCommand('select', 1); fb = "Selected option B";
    } else if (text.includes("option c") || text.includes("option 3") || text.includes("third")) {
      onCommand('select', 2); fb = "Selected option C";
    } else if (text.includes("option d") || text.includes("option 4") || text.includes("fourth")) {
      onCommand('select', 3); fb = "Selected option D";
    }

    if (cmd) onCommand(cmd);
    if (fb) {
      setFeedback(fb);
      speak(fb);
      setTimeout(() => setFeedback(""), 2500);
    }
  }, [onCommand]);

  const startListening = useCallback(() => {
    if (!SR) { setError("Voice not supported in this browser"); return; }
    setError("");
    try {
      const recog = new SR();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';
      recog.onresult = (event) => {
        const current = event.results[event.results.length - 1];
        const text = current[0].transcript.toLowerCase().trim();
        setTranscript(text);
        if (current.isFinal) {
          handleVoiceCommand(text);
          setTranscript("");
        }
      };
      recog.onerror = (e) => {
        if (e.error === 'not-allowed') {
          setError("Microphone permission denied. Please allow mic access.");
          speak("Microphone permission denied. Please allow microphone access in your browser settings.");
        } else if (e.error !== 'aborted') {
          setError("Voice error: " + e.error);
        }
        setIsListening(false);
        isListeningRef.current = false;
      };
      recog.onend = () => {
        // Auto-restart if still supposed to be listening
        if (isListeningRef.current) {
          try { recog.start(); } catch (_) {}
        } else {
          setIsListening(false);
        }
      };
      recognitionRef.current = recog;
      recog.start();
      isListeningRef.current = true;
      setIsListening(true);
      speak("Voice assistant active. Say a command. Say option 1, 2, 3 or 4 to answer questions.");
    } catch (err) {
      setError("Could not start voice recognition");
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [handleVoiceCommand]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
    setTranscript("");
    speak("Voice assistant paused.");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  if (!SR) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3">
      {/* Error */}
      {error && (
        <div className="bg-red-50 border-2 border-red-400 text-red-700 text-xs font-bold px-3 py-2 rounded-xl max-w-[220px] text-center">
          {error}
        </div>
      )}

      {/* Commands reference panel */}
      <AnimatePresence>
        {showCommands && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border-4 border-[#1A1A2E] shadow-[8px_8px_0px_#1A1A2E] w-64"
            role="region"
            aria-label="Voice commands list"
          >
            <p className="text-xs font-black uppercase text-[#118AB2] mb-2">Voice Commands</p>
            <ul className="space-y-1.5">
              {COMMANDS_LIST.map((c, i) => (
                <li key={i} className="text-xs text-[#1A1A2E]">
                  <span className="font-bold text-[#118AB2]">{c.say}</span>
                  <span className="text-[#64748B]"> — {c.does}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript / feedback bubble */}
      <AnimatePresence>
        {(transcript || feedback) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border-4 border-[#1A1A2E] shadow-[6px_6px_0px_#1A1A2E] max-w-[200px]"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-3 h-3 text-[#118AB2]" />
              <span className="text-xs font-black uppercase text-[#118AB2]">
                {feedback ? "Command" : "Heard"}
              </span>
            </div>
            <p className="text-[#1A1A2E] font-bold text-sm">{feedback || transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons row */}
      <div className="flex items-center gap-2">
        {/* Show/hide commands */}
        <button
          onClick={() => {
            setShowCommands(v => !v);
            speak(showCommands ? "Commands panel closed" : "Voice commands panel opened");
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center border-3 border-[#1A1A2E] bg-white text-[#118AB2] shadow-[3px_3px_0px_#1A1A2E] hover:bg-[#f0f9ff]"
          aria-label={showCommands ? "Hide voice commands" : "Show voice commands"}
          title={showCommands ? "Hide commands" : "Show commands"}
        >
          {showCommands ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>

        {/* Mic toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={isListening ? stopListening : startListening}
          className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-[#1A1A2E] shadow-[6px_6px_0px_#1A1A2E] transition-all ${
            isListening ? 'bg-[#EF476F] text-white animate-pulse' : 'bg-[#FFD166] text-[#1A1A2E]'
          }`}
          aria-label={isListening ? "Stop voice assistant" : "Start voice assistant"}
          aria-pressed={isListening}
        >
          {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
        </motion.button>
      </div>
    </div>
  );
}
