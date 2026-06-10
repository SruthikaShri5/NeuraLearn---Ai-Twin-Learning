import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, AlertCircle, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideoPlayer({ topic, videoUrl, disability, lessonContent }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);

  // If it's a placeholder or invalid URL, we show a helpful message
  const isPlaceholder = !videoUrl || videoUrl.includes('placeholder');

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="neura-card overflow-hidden bg-black aspect-video relative group border-4 border-[#0F172A] shadow-[8px_8px_0px_#0F172A]">
      {isPlaceholder ? (
        /* Lesson Content View when no video URL */
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#118AB2]/10 to-[#C8B6FF]/10">
          <div className="text-center text-[#0F172A] p-8 z-10 max-w-2xl overflow-auto max-h-full">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-[#118AB2]/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#118AB2]"
            >
              <BookOpen className="w-10 h-10 text-[#118AB2]" />
            </motion.div>
            <h3 className="text-2xl font-black mb-3" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {topic}
            </h3>
            {lessonContent ? (
              <div className="text-left bg-white/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E]">
                <p className="text-base leading-relaxed text-[#1A1A2E] whitespace-pre-line">
                  {lessonContent}
                </p>
              </div>
            ) : (
              <div className="text-left bg-white/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E]">
                <p className="text-base leading-relaxed text-[#6B7280]">
                  This lesson doesn't have a video yet. Head down to start reading the material and take the quiz!
                </p>
              </div>
            )}
            <div className="flex justify-center gap-3 mt-4">
              <span className="px-3 py-1 rounded-full bg-[#118AB2]/20 text-xs font-bold border-2 border-[#118AB2] text-[#118AB2]">
                {disability === 'visual' ? '🔊 Audio-Descriptive' :
                 disability === 'hearing' ? '💬 Full Captions' :
                 '✨ Adaptive AI Lesson'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Real YouTube Embed */
        <iframe
          src={`${videoUrl}${videoUrl.includes('?') ? '&' : '?'}autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}`}
          title={topic}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={() => setHasError(true)}
        />
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
        {/* Progress Bar */}
        <div 
          className="w-full h-2 bg-white/20 rounded-full mb-5 overflow-hidden cursor-pointer hover:h-3 transition-all"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setProgress((x / rect.width) * 100);
          }}
        >
          <div
            className="h-full bg-[#06D6A0] transition-all duration-300"
            style={{ width: `${isPlaying ? 45 : progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-6">
            <button 
              onClick={togglePlay} 
              className="p-2 rounded-full hover:bg-white/20 transition-all transform hover:scale-110"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
            <button className="p-2 rounded-full hover:bg-white/20 transition-all">
              <RotateCcw className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleMute} 
                className="p-2 rounded-full hover:bg-white/20 transition-all"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
              <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className={`h-full bg-white transition-all ${isMuted ? 'w-0' : 'w-2/3'}`} />
              </div>
            </div>
            <span className="text-sm font-bold tracking-tighter tabular-nums bg-black/40 px-3 py-1 rounded-lg">
              {isPlaying ? 'Playing...' : 'Paused'}
            </span>
          </div>
          <button className="p-2 rounded-full hover:bg-white/20 transition-all">
            <Maximize className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white p-6">
          <AlertCircle className="w-12 h-12 text-[#EF476F] mb-4" />
          <h3 className="text-xl font-bold mb-2">Video Unavailable</h3>
          <p className="text-sm opacity-70 text-center">We're having trouble loading this video. Please try again later or use the interactive lesson below.</p>
        </div>
      )}

      {/* Caption Box for Hearing Disability */}
      {disability === 'hearing' && isPlaying && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4/5 text-center z-20">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/80 backdrop-blur-md p-4 rounded-2xl border-2 border-white/30 shadow-2xl"
          >
            <p className="text-white font-bold text-lg leading-tight">
              {"In this lesson, we are going to master "}
              <span className="text-[#06D6A0]">{String(topic || "").toLowerCase()}</span>
              {" together! Let's start with the basics..."}
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
