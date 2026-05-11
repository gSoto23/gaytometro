"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import UploadModal from "@/components/UploadModal";
import ShareModal from "@/components/ShareModal";

// Mock para desarrollo
const MOCK_MY_PHOTOS = [
  {
    id: "uuid-foto-1",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1080&q=80",
    super_gay_votes: 45,
    no_gay_votes: 15,
  },
  {
    id: "uuid-foto-2",
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1080&q=80",
    super_gay_votes: 10,
    no_gay_votes: 90,
  }
];

export default function Dashboard() {
  const router = useRouter();
  const [photos, setPhotos] = useState(MOCK_MY_PHOTOS);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [sharePhotoId, setSharePhotoId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // if (!session) router.replace("/");
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleShare = (photoId: string) => {
    setSharePhotoId(photoId);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="flex items-center justify-center h-full"><span className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white rounded-full animate-spin"></span></div>;

  return (
    <div className="min-h-screen p-6 pb-24 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold bg-[linear-gradient(90deg,#FF0018,#FFA52C,#FFFF41,#008018,#0000F9,#86007D)] bg-clip-text text-transparent">
          Mi Galería
        </h1>
        <div className="flex gap-4 items-center">
          <Link href="/play" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            Volver a Votar
          </Link>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-400 transition-colors">
            Salir
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {photos.map((photo) => {
          const totalVotes = photo.super_gay_votes + photo.no_gay_votes;
          const vibeScore = totalVotes > 0 ? Math.round((photo.super_gay_votes / totalVotes) * 100) : 0;
          return (
            <div key={photo.id} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-lg dark:shadow-2xl">
              <div className="w-full h-64 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="My uploaded photo" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-white/80 dark:bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10">
                  <span className="font-bold text-2xl text-pink-500">{vibeScore}%</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300 ml-1 block text-center">GAY</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Total de votos: <strong className="text-gray-900 dark:text-white">{totalVotes}</strong></span>
                  <div className="flex gap-3">
                    <span className="text-pink-500">🔥 {photo.super_gay_votes}</span>
                    <span className="text-blue-500">🧊 {photo.no_gay_votes}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleShare(photo.id)} className="flex-1 bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition-colors py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-5.368m0 5.368l8.947 5.368m-8.947-5.368l8.947-5.368m0 0a3 3 0 100 5.368m0-5.368a3 3 0 110 5.368"></path></svg>
                    Compartir
                  </button>
                  <button onClick={() => alert("Función de borrar en construcción")} className="px-4 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 transition-colors rounded-xl font-semibold flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-6 w-full max-w-md mx-auto left-0 right-0 px-6 z-30">
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="w-full px-8 py-4 bg-[linear-gradient(90deg,#FF0018,#FFA52C,#FFFF41,#008018,#0000F9,#86007D)] rounded-2xl font-bold shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2 text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          Subir otra foto
        </button>
      </div>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      
      <ShareModal 
        isOpen={!!sharePhotoId} 
        onClose={() => setSharePhotoId(null)} 
        url={sharePhotoId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${sharePhotoId}` : ''}
        title="Mi porcentaje GAY en GAYTOMETRO"
        text="¡Mira lo que opina la gente de mi foto!"
      />
    </div>
  );
}
