import React, { useEffect, useState, useCallback } from 'react';
import { Mic, MicOff, Volume2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { speak, stopSpeaking } from '@/lib/tts';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceAssistant({ onCommand, active = false, context = "" }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event) => {
        const current = event.results[event.results.length - 1];
        const text = current[0].transcript.toLowerCase().trim();
        setTranscript(text);

        if (current.isFinal) {
          handleVoiceCommand(text);
        }
      };

      recog.onend = () => {
        if (isListening) recog.start();
      };

      setRecognition(recog);
    }
  }, [isListening]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVoiceCommand = useCallback((text) => {
    console.log("Voice Command:", text);
    
    let recognized = false;

    if (text.includes("next") || text.includes("continue") || text.includes("forward")) {
      onCommand('next');
      setFeedback("Going forward");
      recognized = true;
    } else if (text.includes("previous") || text.includes("back") || text.includes("go back")) {
      onCommand('previous');
      setFeedback("Going back");
      recognized = true;
    } else if (text.includes("read") || text.includes("repeat") || text.includes("speak")) {
      onCommand('read');
      setFeedback("Reading again");
      recognized = true;
    } else if (text.includes("quiz") || text.includes("start quiz") || text.includes("test")) {
      onCommand('quiz');
      setFeedback("Starting quiz");
      recognized = true;
    } else if (text.includes("option a") || text.includes("option 1") || text.includes("first")) {
      onCommand('select', 0);
      setFeedback("Selected first option");
      recognized = true;
    } else if (text.includes("option b") || text.includes("option 2") || text.includes("second")) {
      onCommand('select', 1);
      setFeedback("Selected second option");
      recognized = true;
    } else if (text.includes("option c") || text.includes("option 3") || text.includes("third")) {
      onCommand('select', 2);
      setFeedback("Selected third option");
      recognized = true;
    } else if (text.includes("option d") || text.includes("option 4") || text.includes("fourth")) {
      onCommand('select', 3);
      setFeedback("Selected fourth option");
      recognized = true;
    }

    if (recognized) {
      setTimeout(() => setFeedback(""), 2000);
    }
  }, [onCommand]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
      stopSpeaking();
      speak("Voice assistant paused.");
    } else {
      recognition?.start();
      setIsListening(true);
      speak("Voice assistant active. You can say next, back, or select options.");
    }
  };

  if (!SpeechRecognition) return null;

  return (
    <div className={`fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4`}>
      <AnimatePresence>
        {(transcript || feedback) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border-4 border-[#1A1A2E] shadow-[8px_8px_0px_#1A1A2E] max-w-xs"
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-[#118AB2]" />
              <span className="text-xs font-black uppercase text-[#118AB2]">Voice Assistant</span>
            </div>
            <p className="text-[#1A1A2E] font-bold text-sm">
              {feedback || transcript}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleListening}
        className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-[#1A1A2E] shadow-[6px_6px_0px_#1A1A2E] transition-all ${
          isListening ? 'bg-[#EF476F] text-white animate-pulse' : 'bg-[#FFD166] text-[#1A1A2E]'
        }`}
      >
        {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
      </motion.button>
    </div>
  );
}
