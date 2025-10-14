import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

/**
 * Splash Screen con animación retro
 * Se muestra al iniciar el juego
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = 3000,
}) => {
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Mostrar texto después de 500ms
    const textTimer = setTimeout(() => setShowText(true), 500);

    // Barra de progreso
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    // Completar splash screen
    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(completeTimer);
      clearInterval(interval);
    };
  }, [onComplete, duration]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Scanlines effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        opacity: 0.2,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
      }} />

      <div style={{ textAlign: 'center', padding: '0 32px' }}>
        {/* Logo/Icon */}
        <div style={{
          fontSize: '96px',
          marginBottom: '32px',
          transition: 'all 1s',
          transform: showText ? 'scale(1)' : 'scale(0.5)',
          opacity: showText ? 1 : 0
        }}>
          ⚔️
        </div>

        {/* Title */}
        <div style={{
          marginBottom: '32px',
          transition: 'all 1s',
          opacity: showText ? 1 : 0,
          transform: showText ? 'translateY(0)' : 'translateY(16px)'
        }}>
          <h1 style={{
            color: '#a855f7',
            fontSize: '36px',
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            marginBottom: '8px'
          }}>
            ONE PAGE RPG
          </h1>
          <p style={{
            color: '#9ca3af',
            fontSize: '14px',
            letterSpacing: '0.2em'
          }}>
            GRISWALD CHRONICLES
          </p>
        </div>

        {/* Loading bar */}
        <div style={{
          width: '320px',
          margin: '0 auto 32px',
          transition: 'all 1s',
          opacity: showText ? 1 : 0,
          transform: showText ? 'translateY(0)' : 'translateY(16px)'
        }}>
          <div style={{
            height: '16px',
            backgroundColor: '#1f2937',
            border: '2px solid #4b5563',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(to right, #9333ea, #a855f7)',
              width: `${progress}%`,
              transition: 'width 0.1s'
            }} />
          </div>
          <p style={{
            color: '#6b7280',
            fontSize: '12px',
            marginTop: '8px'
          }}>
            Cargando... {progress}%
          </p>
        </div>

        {/* Version */}
        <p style={{
          color: '#4b5563',
          fontSize: '12px',
          marginBottom: '16px',
          transition: 'opacity 1s',
          opacity: showText ? 1 : 0
        }}>
          v0.1.0 - Prólogo: La Deuda del Ladrón de Ecos
        </p>

        {/* Press any key hint */}
        {progress >= 100 && (
          <p style={{
            color: '#6b7280',
            fontSize: '12px',
            animation: 'pulse 2s infinite'
          }}>
            Presiona cualquier tecla para continuar...
          </p>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;
