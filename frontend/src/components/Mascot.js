import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { speak, stopSpeaking } from '@/lib/tts';

const MASCOT_URL = "/mascot.svg";

export default function Mascot({ message, isJunior }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (message) {
      setShowBubble(true);
      const timer = setTimeout(() => setShowBubble(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speak(message);
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), message.length * 60);
    }
  };

  if (!isJunior) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-white border-2 border-[#1A1A2E] p-4 rounded-2xl shadow-xl max-w-[250px] relative"
          >
            <p className="text-[#1A1A2E] font-bold text-sm leading-tight">
              {message}
            </p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r-2 border-b-2 border-[#1A1A2E] rotate-45" />
            <button
              onClick={handleSpeak}
              className="mt-2 flex items-center gap-1 text-xs font-bold text-[#118AB2] hover:underline"
            >
              {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              {isSpeaking ? "Stop" : "Listen to Neura"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="cursor-pointer"
        onClick={() => setShowBubble(!showBubble)}
      >
        <img
          src={MASCOT_URL}
          alt="Neura Mascot"
          className="w-24 h-24 drop-shadow-2xl"
        />
      </motion.div>
    </div>
  );
}
