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
          backgroundColor: '#050505',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background gradient blur effect */}
        <div
          style={{
            position: 'absolute',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(255,0,127,0.15) 0%, rgba(0,0,0,0) 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Unicorn Emoji */}
        <div
          style={{
            fontSize: 160,
            marginBottom: '20px',
            filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.5))',
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
            color: 'transparent',
            backgroundImage: 'linear-gradient(90deg, #FF0018, #FFA52C, #FFFF41, #008018, #0000F9, #86007D)',
            backgroundClip: 'text',
          }}
        >
          GAYMOMETRO
        </div>

        {/* Veredicto */}
        <div
          style={{
            marginTop: '30px',
            fontSize: 40,
            color: '#fff',
            fontWeight: 'bold',
          }}
        >
          El veredicto de la comunidad es:
        </div>

        {/* Score */}
        <div
          style={{
            fontSize: 120,
            fontWeight: '900',
            color: '#FF007F',
            textShadow: '4px 4px 10px rgba(0,0,0,0.8)',
            marginTop: '10px',
          }}
        >
          {vibeScore}% GAY
        </div>

        <div style={{ fontSize: 30, color: '#aaa', marginTop: '10px' }}>
          Basado en {total} votos
        </div>
      </div>
    ),
    { ...size }
  )
}
