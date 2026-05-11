"use client";

import { motion, useAnimation, PanInfo } from "framer-motion";
import { useState, useEffect } from "react";

interface SwipeCardProps {
  photo: { id: string; url: string };
  onVote: (photoId: string, isSuperGay: boolean) => void;
}

export default function SwipeCard({ photo, onVote }: SwipeCardProps) {
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
    } else if (info.offset.x < -50) {
      setLabel("NO GAY");
    } else {
      setLabel(null);
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
      animate={controls}
      initial={{ scale: 0.95, opacity: 0 }}
      exit={{ x: exitX, opacity: opacity, transition: { duration: 0.2 } }}
      style={{ x: exitX !== 0 ? exitX : undefined }}
      whileDrag={{ scale: 1.05, cursor: "grabbing" }}
      className="absolute w-full max-w-sm h-[60vh] bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl overflow-hidden cursor-grab touch-none"
    >
      {/* Indicador visual del voto */}
      {label === "SUPER GAY" && (
        <div className="absolute top-10 left-10 z-10 border-4 border-pink-500 text-pink-500 font-black text-3xl px-4 py-2 rounded-xl rotate-[-15deg] bg-black/40 backdrop-blur-sm">
          SUPER GAY
        </div>
      )}
      {label === "NO GAY" && (
        <div className="absolute top-10 right-10 z-10 border-4 border-blue-500 text-blue-500 font-black text-3xl px-4 py-2 rounded-xl rotate-[15deg] bg-black/40 backdrop-blur-sm">
          NO GAY
        </div>
      )}

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
