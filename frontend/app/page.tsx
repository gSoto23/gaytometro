"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthForm from "@/components/AuthForm";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/play");
      } else {
        setLoading(false);
      }
    };

    checkSession();

    // Setup listener for auth state changes (e.g. clicking Magic Link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/play");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 relative z-10">
      <AuthForm />
      <div className="mt-8 text-center px-6">
        <p className="text-gray-500 text-xs mt-4">
          Gaytometro utiliza tecnología sin contraseñas (Magic Links) para garantizar la seguridad de tu cuenta.
        </p>
      </div>
    </div>
  );
}
