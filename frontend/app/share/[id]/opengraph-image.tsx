import { ImageResponse } from 'next/og'
import { supabase } from "@/lib/supabaseClient";

// export const runtime = 'edge' // Dejaremos que use node por defecto para evitar problemas con Supabase client en edge

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const alt = 'GAYMOMETRO Resultado'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // 1. Obtener la foto
  const { data: photo } = await supabase
    .from("photos")
    .select("id, url")
    .eq("id", resolvedParams.id)
    .single();

  if (!photo) {
    return new ImageResponse(
      (
        <div style={{ fontSize: 80, background: '#000', color: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          GAYMOMETRO
        </div>
      ),
      { ...size }
    )
  }

  // 2. Contar votos
  const { count: superGayCount } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("photo_id", resolvedParams.id)
    .eq("is_super_gay", true);

  const { count: noGayCount } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("photo_id", resolvedParams.id)
    .eq("is_super_gay", false);

  const total = (superGayCount || 0) + (noGayCount || 0);
  const vibeScore = total > 0 ? Math.round(((superGayCount || 0) / total) * 100) : 0;

  // 3. Generar la imagen con Satori (Soporta flexbox y CSS básico)
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Unicorn Emoji */}
        <div
          style={{
            display: 'flex',
            fontSize: 160,
            marginBottom: '20px',
          }}
        >
          🦄
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 50,
            fontWeight: '900',
            letterSpacing: '0.1em',
            color: '#FF007F',
          }}
        >
          GAYMOMETRO
        </div>

        {/* Veredicto */}
        <div
          style={{
            display: 'flex',
            marginTop: '30px',
            fontSize: 40,
            color: '#ffffff',
            fontWeight: 'bold',
          }}
        >
          El veredicto de la comunidad es:
        </div>

        {/* Score */}
        <div
          style={{
            display: 'flex',
            fontSize: 120,
            fontWeight: '900',
            color: '#FF007F',
            marginTop: '10px',
          }}
        >
          {`${vibeScore}% GAY`}
        </div>

        <div style={{ display: 'flex', fontSize: 30, color: '#aaaaaa', marginTop: '10px' }}>
          {`Basado en ${total} votos`}
        </div>
      </div>
    ),
    { ...size }
  )
}
