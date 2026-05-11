"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TermsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya aceptó los términos
    const hasAccepted = localStorage.getItem("gaymometro_terms_accepted");
    if (!hasAccepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("gaymometro_terms_accepted", "true");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl text-gray-900 dark:text-white"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 bg-[linear-gradient(90deg,#FF0018,#FFA52C,#FFFF41,#008018,#0000F9,#86007D)] bg-clip-text text-transparent">
                ¡Bienvenido a Gaymometro!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Antes de empezar, debes aceptar nuestros términos.
              </p>
            </div>

            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-black/50 p-4 rounded-xl border border-gray-200 dark:border-white/5 max-h-60 overflow-y-auto">
              <p>
                <strong>1. Fines de Entretenimiento:</strong> Esta plataforma está diseñada exclusivamente para fines lúdicos y de entretenimiento. Los votos y percepciones no representan ninguna realidad objetiva ni deben ser tomados en serio.
              </p>
              <p>
                <strong>2. Descarga de Responsabilidad:</strong> Los desarrolladores y creadores de Gaymometro no se hacen responsables por daños emocionales, disputas o consecuencias derivadas del uso de la plataforma. Úsala bajo tu propio riesgo y con sentido del humor.
              </p>
              <p>
                <strong>3. Privacidad y Moderación:</strong> Al subir una foto, aceptas que sea pública para votación. Tienes derecho a eliminar tus fotos de forma permanente en cualquier momento. La comunidad puede reportar contenido inapropiado, resultando en la ocultación automática de tu foto.
              </p>
              <p>
                <strong>4. Respeto Mutuo:</strong> No se permite la subida de contenido explícito, desnudez, odio o acoso. El incumplimiento resultará en la eliminación permanente (ban).
              </p>
            </div>

            <button
              onClick={handleAccept}
              className="mt-6 w-full py-3 px-4 bg-gray-900 text-white dark:bg-white dark:text-black font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors active:scale-95"
            >
              Acepto los Términos y Condiciones
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
