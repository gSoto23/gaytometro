import { ImageResponse } from 'next/og'

export const alt = 'GAYMOMETRO - ¿Cuál es tu porcentaje?'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function Image() {
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
            fontSize: 200,
            marginBottom: '40px',
            filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.5))',
          }}
        >
          🦄
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 80,
            fontWeight: '900',
            letterSpacing: '0.1em',
            color: 'transparent',
            backgroundImage: 'linear-gradient(90deg, #FF0018, #FFA52C, #FFFF41, #008018, #0000F9, #86007D)',
            backgroundClip: 'text',
          }}
        >
          GAYMOMETRO
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: '30px',
            fontSize: 40,
            fontWeight: 'bold',
            color: '#ffffff',
            opacity: 0.9,
          }}
        >
          Descubre tu porcentaje
        </div>
      </div>
    ),
    { ...size }
  )
}
