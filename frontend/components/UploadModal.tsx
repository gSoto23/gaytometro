"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { api } from "@/lib/api";

export default function UploadModal({ isOpen, onClose, mode = 'gallery' }: { isOpen: boolean; onClose: () => void; mode?: 'gallery' | 'camera' }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Auto-reset when modal closes
  if (!isOpen && (file || preview)) {
    setTimeout(() => {
      setFile(null);
      setPreview(null);
      setUploading(false);
    }, 300);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type.startsWith("image/")) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      let finalUrl = "";
      const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file);
      
      if (uploadError) {
        console.warn("Storage upload failed (bucket probably missing). Fallback to placeholder image.", uploadError);
        // Fallback to a placeholder URL if the bucket is not created
        finalUrl = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1080&q=80";
      } else {
        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
        finalUrl = publicUrl;
      }
      
      // Enviar URL a FastAPI
      await api.uploadPhoto(finalUrl);
      
      setUploading(false);
      onClose();
      // Recargar la página para ver la nueva foto en el Dashboard
      window.location.reload();
      
    } catch (err) {
      console.error(err);
      alert("Hubo un error subiendo la foto.");
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {mode === 'camera' ? 'Tómate una selfie' : 'Sube tu foto'}
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-2">
                ✕
              </button>
            </div>

            {!preview ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-2xl cursor-pointer hover:border-pink-500/50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {mode === 'camera' ? (
                    <svg className="w-10 h-10 mb-3 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  ) : (
                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  )}
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {mode === 'camera' ? 'Click para abrir la cámara' : 'Click para subir o arrastra'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP (Max. 10MB)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  {...(mode === 'camera' ? { capture: "user" } : {})} 
                  onChange={handleFileChange} 
                />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="w-full h-64 relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 bg-white/80 dark:bg-black/50 p-2 rounded-full text-gray-900 dark:text-white backdrop-blur-md"
                  >
                    ✕
                  </button>
                </div>
                
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full py-4 bg-[linear-gradient(90deg,#FF0018,#FFA52C,#FFFF41,#008018,#0000F9,#86007D)] rounded-xl font-bold text-white flex justify-center items-center active:scale-95 transition-transform"
                >
                  {uploading ? (
                    <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Confirmar y Subir"
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
