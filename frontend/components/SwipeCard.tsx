"use client";

import { motion, useAnimation, PanInfo, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface SwipeCardProps {
  photo: { id: string; url: string };
  onVote: (photoId: string, isSuperGay: boolean) => void;
  isMuted?: boolean;
  playAudio: (soundKey: "super_gay" | "no_gay", isMuted: boolean) => void;
  unlockAudio: () => void;
}

export default function SwipeCard({ photo, onVote, isMuted = false, playAudio, unlockAudio }: SwipeCardProps) {
  const controls = useAnimation();
  const [exitX, setExitX] = useState<number | string>(0);
  const [opacity, setOpacity] = useState(1);
  const [label, setLabel] = useState<"SUPER GAY" | "NO GAY" | null>(null);
  useEffect(() => {
    controls.start({ scale: 1, opacity: 1, transition: { duration: 0.3 } });
  }, [controls]);

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 50) {
      setLabel("SUPER GAY");
      if (audioPlayedRef.current !== "SUPER GAY") {
        playAudio("super_gay", isMuted);
        audioPlayedRef.current = "SUPER GAY";
      }
    } else if (info.offset.x < -50) {
      setLabel("NO GAY");
      if (audioPlayedRef.current !== "NO GAY") {
        playAudio("no_gay", isMuted);
        audioPlayedRef.current = "NO GAY";
      }
    } else {
      setLabel(null);
      audioPlayedRef.current = null;
    }
  };

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;

    if (info.offset.x > threshold) {
      setExitX(1000);
      setOpacity(0);
      onVote(photo.id, true); // True = Super Gay
    } else if (info.offset.x < -threshold) {
      setExitX(-1000);
      setOpacity(0);
      onVote(photo.id, false); // False = No Gay
    } else {
      setLabel(null);
      controls.start({ x: 0, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onTouchStart={unlockAudio}
      onMouseDown={unlockAudio}
      animate={controls}
      initial={{ scale: 0.95, opacity: 0 }}
      exit={{ x: exitX, opacity: opacity, transition: { duration: 0.2 } }}
      style={{ x: exitX !== 0 ? exitX : undefined }}
      whileDrag={{ scale: 1.05, cursor: "grabbing" }}
      className="absolute w-full max-w-sm h-[60vh] bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl overflow-hidden cursor-grab touch-none"
    >
      {/* Indicador visual del voto */}
      <AnimatePresence>
        {label === "SUPER GAY" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-pink-500/20 backdrop-blur-sm pointer-events-none"
          >
            <motion.div 
               animate={{ rotate: [-10, 10, -10], scale: [1, 1.2, 1] }}
               transition={{ repeat: Infinity, duration: 0.5 }}
               className="text-8xl drop-shadow-2xl mb-4"
            >
               🦄✨
            </motion.div>
            <div className="border-4 border-pink-500 text-pink-500 font-black text-4xl px-6 py-2 rounded-2xl rotate-[-15deg] bg-white/90 dark:bg-black/80 shadow-2xl">
              SUPER GAY
            </div>
          </motion.div>
        )}
        {label === "NO GAY" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-blue-500/20 backdrop-blur-sm pointer-events-none"
          >
            <motion.div 
               animate={{ x: [-5, 5, -5], scale: [1, 1.1, 1] }}
               transition={{ repeat: Infinity, duration: 0.2 }}
               className="text-8xl drop-shadow-2xl mb-4"
            >
               🦍🔨
            </motion.div>
            <div className="border-4 border-blue-500 text-blue-500 font-black text-4xl px-6 py-2 rounded-2xl rotate-[15deg] bg-white/90 dark:bg-black/80 shadow-2xl">
              NO GAY
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt="User photo"
        className="w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />

      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
        <p className="text-white/80 text-sm text-center font-medium">Desliza para votar</p>
      </div>
    </motion.div>
  );
}
