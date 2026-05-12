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
          backgroundColor: '#0a0a0a',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Unicorn Emoji */}
        <div
          style={{
            display: 'flex',
            fontSize: 200,
            marginBottom: '40px',
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
            color: '#FF007F',
          }}
        >
          GAYMOMETRO
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            marginTop: '30px',
            fontSize: 40,
            fontWeight: 'bold',
            color: '#ffffff',
          }}
        >
          Descubre tu porcentaje
        </div>
      </div>
    ),
    { ...size }
  )
}
