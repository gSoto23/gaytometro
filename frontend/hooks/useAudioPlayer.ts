"use client";

import { useState, useEffect, useRef } from "react";

export function useAudioPlayer() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<{ [key: string]: AudioBuffer }>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initAudio = async () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Unlock audio context natively via global event listeners
        const unlock = () => {
          if (ctx.state === "suspended") {
            ctx.resume();
          }
          try {
            const buffer = ctx.createBuffer(1, 1, 22050);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
          } catch(e) {}

          document.removeEventListener("touchstart", unlock);
          document.removeEventListener("touchend", unlock);
          document.removeEventListener("click", unlock);
        };

        document.addEventListener("touchstart", unlock, { passive: true });
        document.addEventListener("touchend", unlock, { passive: true });
        document.addEventListener("click", unlock, { passive: true });

        // Fetch and decode sounds
        const loadSound = async (url: string, key: string) => {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          if (isMounted) {
            buffersRef.current[key] = audioBuffer;
          }
        };

        await Promise.all([
          loadSound("/sounds/super_gay.mp3", "super_gay"),
          loadSound("/sounds/no_gay.mp3", "no_gay")
        ]);

        if (isMounted) setIsReady(true);
      } catch (e) {
        console.error("Audio initialization failed:", e);
      }
    };

    initAudio();

    return () => {
      isMounted = false;
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSound = (soundKey: "super_gay" | "no_gay", isMuted: boolean) => {
    if (isMuted || !audioContextRef.current || !buffersRef.current[soundKey]) return;

    try {
      const ctx = audioContextRef.current;
      // Resume context if suspended (iOS requirement)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const source = ctx.createBufferSource();
      source.buffer = buffersRef.current[soundKey];
      source.connect(ctx.destination);
      source.start(0);
    } catch (e) {
      console.error("Error playing sound", e);
    }
  };

  const unlockAudio = () => {
    // This is now handled globally via native listeners, but we keep this as a fallback
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }
  };

  return { playSound, isReady, unlockAudio };
}
