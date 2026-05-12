"use client";

import { useEffect, useRef, useState } from "react";
import { Howl, Howler } from "howler";

export function useAudioPlayer() {
  const [isReady, setIsReady] = useState(false);
  const soundsRef = useRef<{ [key: string]: Howl }>({});

  useEffect(() => {
    // Add global native listeners to force-unlock Howler's context in Chrome/Android
    const unlock = () => {
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        Howler.ctx.resume();
      }
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("click", unlock);
    };
    document.addEventListener("touchstart", unlock, { passive: true });
    document.addEventListener("click", unlock, { passive: true });

    const superGaySound = new Howl({
      src: ["/sounds/super_gay.mp3"],
      preload: true,
      html5: false, // Forzar Web Audio API para latencia 0
      onload: () => {
        setIsReady(true);
      }
    });

    const noGaySound = new Howl({
      src: ["/sounds/no_gay.mp3"],
      preload: true,
      html5: false,
    });

    soundsRef.current = {
      super_gay: superGaySound,
      no_gay: noGaySound,
    };

    return () => {
      superGaySound.unload();
      noGaySound.unload();
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("click", unlock);
    };
  }, []);

  const playSound = (soundKey: "super_gay" | "no_gay", isMuted: boolean) => {
    if (isMuted) return;
    
    // Explicitly resume before playing (fixes strict Chrome policies)
    if (Howler.ctx && Howler.ctx.state === "suspended") {
      Howler.ctx.resume();
    }

    const sound = soundsRef.current[soundKey];
    if (sound) {
      sound.stop(); // Detener el anterior si arrastra muy rápido
      sound.play();
    }
  };

  const unlockAudio = () => {
    if (Howler.ctx && Howler.ctx.state === "suspended") {
      Howler.ctx.resume();
    }
  };

  return { playSound, isReady, unlockAudio };
}
