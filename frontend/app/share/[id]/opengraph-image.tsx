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
          justifyContent: 'flex-end',
          backgroundColor: '#111',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Imagen de fondo (la foto del usuario) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt="Foto"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Gradiente oscuro abajo para que el texto sea legible */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 100%)',
            width: '100%',
            height: '50%',
            padding: '40px',
            paddingBottom: '60px',
            position: 'absolute',
            bottom: 0,
            left: 0,
          }}
        >
          <div style={{ fontSize: 36, color: '#fff', fontWeight: 'bold', marginBottom: '10px' }}>
            El veredicto de la comunidad es:
          </div>
          <div
            style={{
              fontSize: 110,
              fontWeight: '900',
              color: '#FF007F', // Un rosa/rojo vibrante
              textShadow: '4px 4px 10px rgba(0,0,0,0.8)',
            }}
          >
            {vibeScore}% GAY
          </div>
          <div style={{ fontSize: 30, color: '#aaa', marginTop: '20px' }}>
            Basado en {total} votos en GAYMOMETRO
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
