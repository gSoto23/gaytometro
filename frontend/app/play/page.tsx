"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SwipeCard from "@/components/SwipeCard";
import ShareModal from "@/components/ShareModal";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MOCK_PHOTOS = [
  { id: "1", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1080&q=80", super_gay_votes: 120, no_gay_votes: 40 },
  { id: "2", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1080&q=80", super_gay_votes: 5, no_gay_votes: 95 },
  { id: "3", url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1080&q=80", super_gay_votes: 50, no_gay_votes: 50 },
];

export default function Play() {
  const router = useRouter();
  const [photos, setPhotos] = useState<{ id: string; url: string; super_gay_votes: number; no_gay_votes: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [votesGiven, setVotesGiven] = useState(0);
  const [showGateModal, setShowGateModal] = useState(false);
  const [sharePhotoId, setSharePhotoId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // Mock auth bypass for local testing if needed
      setPhotos(MOCK_PHOTOS);
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleVote = async (photoId: string, isSuperGay: boolean) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setVotesGiven((prev) => prev + 1);
    console.log(`Voted on ${photoId}: ${isSuperGay ? "SUPER GAY" : "NO GAY"}`);
  };

  const handleUploadClick = () => {
    if (votesGiven < 10) {
      setShowGateModal(true);
    } else {
      router.push("/dashboard");
    }
  };

  const handleShare = (photoId: string) => {
    setSharePhotoId(photoId);
  };

  const handleReport = async (photoId: string) => {
    // TODO: Send report to backend
    alert("Foto reportada. Un moderador la revisará en breve.");
    // La quitamos de la vista localmente como si hubiera sido bloqueada
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
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
    <div className="flex flex-col items-center justify-between min-h-screen py-6 relative">
      {/* Header / Título */}
      <div className="w-full px-6 flex justify-between items-center z-20">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors active:scale-95">
          <svg className="w-7 h-7 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </Link>
        <h1 className="text-2xl font-black tracking-widest bg-[linear-gradient(90deg,#FF0018,#FFA52C,#FFFF41,#008018,#0000F9,#86007D)] bg-clip-text text-transparent text-center">
          GAYTOMETRO
        </h1>
        <div className="w-7 h-7"></div>
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
                <SwipeCard key={photo.id} photo={photo} onVote={handleVote} />
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

      {/* Botón Permanente de Subir Foto */}
      <div className="absolute bottom-4 w-full px-6 z-30">
        <button 
          onClick={handleUploadClick}
          className="w-full px-8 py-4 bg-[linear-gradient(90deg,#FF0018,#FFA52C,#FFFF41,#008018,#0000F9,#86007D)] rounded-2xl font-bold shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2 text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Subir mi foto
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
                Para mantener la comunidad activa, necesitas evaluar al menos <strong>10 fotos</strong> antes de poder subir la tuya. Llevas <strong>{votesGiven}</strong>.
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
        title="GAYTOMETRO"
        text="¡Mira lo que opina la gente de esta foto!"
      />
    </div>
  );
}
