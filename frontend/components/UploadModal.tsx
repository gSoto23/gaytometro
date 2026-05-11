"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
    // TODO: Integración con FastAPI backend
    // const formData = new FormData();
    // formData.append("file", file);
    // await fetch("API_URL/photos/upload", { method: "POST", body: formData });
    
    setTimeout(() => {
      setUploading(false);
      onClose();
      alert("Foto simulada subida con éxito (falta conexión al backend)");
    }, 1500);
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sube tu foto</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-2">
                ✕
              </button>
            </div>

            {!preview ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-2xl cursor-pointer hover:border-pink-500/50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold text-gray-900 dark:text-white">Click para subir</span> o arrastra</p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP (Max. 10MB)</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
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
