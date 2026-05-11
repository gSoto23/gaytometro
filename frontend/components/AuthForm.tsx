"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Intentamos login instantáneo (si el usuario ya validó su correo antes)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: 'GaymometroUniversal2026!'
    });

    if (!signInError && signInData.session) {
      // Login exitoso e instantáneo
      window.location.href = '/dashboard';
      return;
    }

    // Si falló, significa que es su primera vez o no tiene la contraseña seteada
    // Enviamos el Magic Link normal
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "¡Revisa tu correo para validar tu identidad por primera vez!" });
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto mt-20 p-6 bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-[linear-gradient(90deg,#FF0018,#FFA52C,#FFFF41,#008018,#0000F9,#86007D)] bg-clip-text text-transparent">
          GAYMOMETRO
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Ingresa con tu correo, sin contraseñas.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-800 rounded-xl focus:outline-none focus:border-pink-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gray-900 text-white dark:bg-white dark:text-black font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 active:scale-95 flex justify-center items-center"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent dark:border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Enviar Magic Link"
          )}
        </button>

        {message && (
          <div className={`p-3 rounded-lg text-sm text-center ${message.type === "success" ? "bg-green-900/30 text-green-400 border border-green-800/50" : "bg-red-900/30 text-red-400 border border-red-800/50"}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
