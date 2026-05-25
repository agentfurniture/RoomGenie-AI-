'use client'

import Image from 'next/image'

const IMGS = {
  hero:
    'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1400&q=85&auto=format&fit=crop',
  heroAfter:
    'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1400&q=85&auto=format&fit=crop',
}

export default function Home() {
  return (
    <main
      style={{
        background: '#06080f',
        color: 'white',
        minHeight: '100vh',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backdropFilter: 'blur(20px)',
          background: 'rgba(0,0,0,0.5)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '18px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              fontWeight: 900,
              fontSize: 22,
              letterSpacing: '-1px',
            }}
          >
            ✦ RoomGenie AI
          </h2>

          <button
            style={{
              background:
                'linear-gradient(135deg,#4f7cff,#8b5cf6)',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Start Free
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '140px 24px 80px',
        }}
      >
        {/* Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
          }}
        >
          <Image
            src={IMGS.hero}
            alt="Hero"
            fill
            priority
            style={{
              objectFit: 'cover',
              opacity: 0.12,
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom,#06080f,rgba(6,8,15,0.5),#06080f)',
            }}
          />
        </div>

        {/* CONTENT */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: 1000,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '8px 18px',
              borderRadius: 999,
              background: 'rgba(79,124,255,0.12)',
              border: '1px solid rgba(79,124,255,0.25)',
              marginBottom: 24,
              fontSize: 14,
            }}
          >
            ⚡ Powered by GPT-Image-1
          </div>

          <h1
            style={{
              fontSize: 'clamp(52px,7vw,92px)',
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: '-4px',
              marginBottom: 24,
            }}
          >
            Transform Any Room
            <br />
            Into A Designer Space
          </h1>

          <p
            style={{
              fontSize: 20,
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 700,
              margin: '0 auto 36px',
              lineHeight: 1.7,
            }}
          >
            Upload your room photo and get photorealistic
            AI interior redesigns in seconds.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 60,
            }}
          >
            <button
              style={{
                background:
                  'linear-gradient(135deg,#4f7cff,#8b5cf6)',
                border: 'none',
                color: 'white',
                padding: '18px 40px',
                borderRadius: 16,
                fontWeight: 800,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              ✦ Start Designing Free
            </button>

            <button
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'white',
                padding: '18px 34px',
                borderRadius: 16,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ▶ Watch Demo
            </button>
          </div>

          {/* BEFORE AFTER */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              borderRadius: 24,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow:
                '0 40px 100px rgba(0,0,0,0.6)',
            }}
          >
            <div
              style={{
                position: 'relative',
                aspectRatio: '16/10',
              }}
            >
              <Image
                src={IMGS.hero}
                alt="Before"
                fill
                style={{
                  objectFit: 'cover',
                  filter:
                    'brightness(0.6) saturate(0.5)',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  background: 'rgba(0,0,0,0.6)',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              >
                BEFORE
              </div>
            </div>

            <div
              style={{
                position: 'relative',
                aspectRatio: '16/10',
              }}
            >
              <Image
                src={IMGS.heroAfter}
                alt="After"
                fill
                style={{
                  objectFit: 'cover',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background:
                    'rgba(79,124,255,0.25)',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              >
                ✦ AI REDESIGN
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
