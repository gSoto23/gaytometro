"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SwipeCard from "@/components/SwipeCard";
import ShareModal from "@/components/ShareModal";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

import { api } from "@/lib/api";

export default function Play() {
  const router = useRouter();
  const [photos, setPhotos] = useState<{ id: string; url: string; super_gay_votes: number; no_gay_votes: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [votesGiven, setVotesGiven] = useState(0);
  const [showGateModal, setShowGateModal] = useState(false);
  const [sharePhotoId, setSharePhotoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  
  const { playSound, unlockAudio } = useAudioPlayer();

  // Track globally seen photos in this session to prevent race conditions during fetch
  const seenPhotoIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const savedMute = localStorage.getItem("gaymometro_muted");
    if (savedMute === "true") setIsMuted(true);
    
    const savedVotes = localStorage.getItem("gaymometro_votes_given");
    if (savedVotes) setVotesGiven(parseInt(savedVotes, 10));
    
    const isUnlocked = localStorage.getItem("gaymometro_unlocked");
    if (isUnlocked === "true") setUnlocked(true);
  }, []);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      let { data: { session } } = await supabase.auth.getSession();
      
      // Auto-login anónimo para que puedan jugar sin registrarse
      if (!session) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("Error signing in anonymously:", error);
          alert("Por favor habilita 'Anonymous Sign-ins' en tu dashboard de Supabase (Authentication -> Providers) para que los usuarios puedan jugar sin cuenta.");
          setLoading(false);
          return;
        }
        session = data.session;
      }
      
      try {
        const apiPhotos = await api.getUnvotedPhotos();
        if (apiPhotos) {
          apiPhotos.forEach((p: any) => seenPhotoIds.current.add(p.id));
          setPhotos(apiPhotos);
        } else {
          setPhotos([]);
        }
      } catch (err) {
        console.error("Error fetching photos:", err);
      }
      setLoading(false);
    };
    checkAuthAndFetch();
  }, [router]);

  const fetchMorePhotos = async () => {
    try {
      const apiPhotos = await api.getUnvotedPhotos();
      if (apiPhotos && apiPhotos.length > 0) {
        setPhotos(prev => {
          const newPhotos = apiPhotos.filter((p: any) => !seenPhotoIds.current.has(p.id));
          newPhotos.forEach((p: any) => seenPhotoIds.current.add(p.id));
          return [...prev, ...newPhotos];
        });
      }
    } catch (err) {
      console.error("Error fetching more photos:", err);
    }
  };

  useEffect(() => {
    if (photos.length < 3 && !loading) {
      fetchMorePhotos();
    }
  }, [photos.length, loading]);

  const handleVote = async (photoId: string, isSuperGay: boolean) => {
    // Optimistic UI update
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setVotesGiven((prev) => {
      const next = prev + 1;
      localStorage.setItem("gaymometro_votes_given", next.toString());
      if (next >= 3 && !unlocked) {
        localStorage.setItem("gaymometro_unlocked", "true");
        setUnlocked(true);
      }
      return next;
    });
    
    try {
      await api.castVote(photoId, isSuperGay);
    } catch (err) {
      console.error("Error casting vote:", err);
    }
  };

  const handleUploadClick = (mode: 'gallery' | 'camera') => {
    if (!unlocked && votesGiven < 3) {
      setShowGateModal(true);
    } else {
      router.push(`/dashboard?upload=${mode}`);
    }
  };

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    localStorage.setItem("gaymometro_muted", String(newMute));
  };

  const handleShare = (photoId: string) => {
    setSharePhotoId(photoId);
  };

  const handleReport = async (photoId: string) => {
    try {
      await api.reportPhoto(photoId);
      alert("Foto reportada. Un moderador la revisará en breve.");
      // La quitamos de la vista
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err) {
      console.error("Error reporting photo:", err);
      alert("Hubo un error al reportar la foto.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white rounded-full animate-spin"></span>
      </div>
    );
  }

  // Current photo stats
  const currentPhoto = photos.length > 0 ? photos[0] : null;
  const totalVotes = currentPhoto ? currentPhoto.super_gay_votes + currentPhoto.no_gay_votes : 0;
  const vibeScore = totalVotes > 0 ? Math.round((currentPhoto!.super_gay_votes / totalVotes) * 100) : 0;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between h-[100dvh] w-full overflow-hidden py-4 bg-white dark:bg-[#0a0a0a]">
      {/* Header / Título */}
      <div className="w-full px-6 flex justify-between items-center z-20">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors active:scale-95">
          <svg className="w-7 h-7 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </Link>
        <h1 className="text-2xl font-black tracking-widest bg-[linear-gradient(90deg,#FF0018,#FFA52C,#FFFF41,#008018,#0000F9,#86007D)] bg-clip-text text-transparent text-center">
          GAYMOMETRO
        </h1>
        <div className="w-7 h-7 flex items-center justify-center">
          <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
            {isMuted ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* Gráfica de Unicornio */}
      <div className="w-full px-8 mt-4 z-20">
        {currentPhoto && (
          <div className="w-full max-w-sm mx-auto">
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
              <span>0%</span>
              <span className="text-pink-500 font-black">GAY {vibeScore}%</span>
              <span>100%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-[#222] rounded-full relative mt-2">
              <div 
                className="absolute top-0 left-0 h-full bg-[linear-gradient(90deg,#FF0018,#FFA52C,#FFFF41,#008018,#0000F9,#86007D)] rounded-full transition-all duration-500"
                style={{ width: `${vibeScore}%` }}
              ></div>
              <div 
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500 text-3xl drop-shadow-md z-10"
                style={{ left: `${vibeScore}%` }}
              >
                🦄
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Área de Tarjetas */}
      <div className="flex-1 w-full flex items-center justify-center relative mt-4 mb-24 px-4">
        <AnimatePresence>
          {photos.length > 0 ? (
            photos.map((photo, index) => (
              index === 0 && (
                <SwipeCard key={photo.id} photo={photo} onVote={handleVote} isMuted={isMuted} playAudio={playSound} unlockAudio={unlockAudio} />
              )
            ))
          ) : (
            <div className="text-center p-8 bg-white dark:bg-[#111] shadow-lg dark:shadow-none rounded-3xl border border-gray-200 dark:border-white/5">
              <span className="text-4xl mb-4 block">👻</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¡No hay más fotos!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Has evaluado a todos por ahora. Vuelve más tarde.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Botones Secundarios (Compartir y Reportar) */}
      {photos.length > 0 && (
        <div className="absolute bottom-24 w-full px-8 flex justify-between z-20 max-w-sm mx-auto">
          <button 
            onClick={() => handleReport(photos[0].id)}
            className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors active:scale-95"
          >
            <div className="w-12 h-12 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Reportar</span>
          </button>
          
          <button 
            onClick={() => handleShare(photos[0].id)}
            className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors active:scale-95"
          >
            <div className="w-12 h-12 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-5.368m0 5.368l8.947 5.368m-8.947-5.368l8.947-5.368m0 0a3 3 0 100 5.368m0-5.368a3 3 0 110 5.368"></path></svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Compartir</span>
          </button>
        </div>
      )}

      {/* Botones de Subir/Tomar Foto */}
      <div className="absolute bottom-4 w-full px-6 z-30 flex gap-3 max-w-sm mx-auto left-0 right-0">
        <button 
          onClick={() => handleUploadClick('camera')}
          className="flex-1 py-4 bg-[linear-gradient(90deg,#FF0018,#FFA52C,#FFFF41,#008018,#0000F9,#86007D)] rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform text-black"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          Tomar foto
        </button>
        <button 
          onClick={() => handleUploadClick('gallery')}
          className="flex-1 py-4 bg-[linear-gradient(90deg,#FF0018,#FFA52C,#FFFF41,#008018,#0000F9,#86007D)] rounded-2xl font-black shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2 text-black"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          Subir foto
        </button>
      </div>

      {/* Modal de "Gate" de los 10 votos */}
      <AnimatePresence>
        {showGateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl text-center"
            >
              <div className="text-4xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Aún no puedes subir fotos</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Para mantener la comunidad activa, necesitas evaluar al menos <strong>3 fotos</strong> antes de poder subir la tuya. Llevas <strong>{votesGiven}</strong>.
              </p>
              <button
                onClick={() => setShowGateModal(false)}
                className="w-full py-3 bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black font-bold rounded-xl dark:hover:bg-gray-200 transition-colors"
              >
                ¡A seguir votando!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ShareModal 
        isOpen={!!sharePhotoId} 
        onClose={() => setSharePhotoId(null)} 
        url={sharePhotoId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${sharePhotoId}` : ''}
        title="GAYMOMETRO"
        text="¡Mira lo que opina la gente de esta foto!"
      />
    </div>
  );
}
