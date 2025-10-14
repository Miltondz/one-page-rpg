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
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      <div className="text-center space-y-8 px-8">
        {/* Logo/Icon */}
        <div className={`text-8xl transition-all duration-1000 ${showText ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          ⚔️
        </div>

        {/* Title */}
        <div className={`space-y-2 transition-all duration-1000 delay-300 ${showText ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h1 className="text-purple-400 text-4xl font-bold tracking-wider text-shadow-lg">
            ONE PAGE RPG
          </h1>
          <p className="text-gray-400 text-sm tracking-widest">
            GRISWALD CHRONICLES
          </p>
        </div>

        {/* Loading bar */}
        <div className={`w-80 mx-auto transition-all duration-1000 delay-500 ${showText ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="h-4 bg-gray-800 border-2 border-gray-600 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Cargando... {progress}%
          </p>
        </div>

        {/* Version */}
        <p className={`text-gray-600 text-xs transition-all duration-1000 delay-700 ${showText ? 'opacity-100' : 'opacity-0'}`}>
          v0.1.0 - Prólogo: La Deuda del Ladrón de Ecos
        </p>

        {/* Press any key hint (appears at the end) */}
        {progress >= 100 && (
          <p className="text-gray-500 text-xs animate-pulse">
            Presiona cualquier tecla para continuar...
          </p>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;
