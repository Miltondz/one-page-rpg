import React, { useState } from 'react';
import { RPGUIContainer, RPGUIButton } from '../ui';
import { Modal } from './Modal';

interface MainMenuProps {
  onNewGame: () => void;
  onLoadGame: () => void;
  onOptions: () => void;
  hasSavedGame?: boolean;
}

/**
 * Menú principal del juego
 */
export const MainMenu: React.FC<MainMenuProps> = ({
  onNewGame,
  onLoadGame,
  onOptions,
  hasSavedGame = false,
}) => {
  const [showAbout, setShowAbout] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-gray-900 to-black flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 text-9xl animate-float">⚔️</div>
        <div className="absolute bottom-20 right-20 text-9xl animate-float-delay">🛡️</div>
        <div className="absolute top-1/2 left-1/4 text-6xl animate-float-slow">✨</div>
        <div className="absolute bottom-1/3 right-1/4 text-6xl animate-float-slow">🌙</div>
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-12 space-y-4">
          <div className="text-8xl mb-4 animate-pulse-slow">⚔️</div>
          <h1 className="text-purple-400 text-5xl font-bold tracking-wider text-shadow-lg mb-2">
            ONE PAGE RPG
          </h1>
          <p className="text-yellow-400 text-lg tracking-widest animate-fade-in">
            GRISWALD CHRONICLES
          </p>
          <p className="text-gray-500 text-sm mt-4">
            La Deuda del Ladrón de Ecos
          </p>
        </div>

        {/* Main Menu */}
        <RPGUIContainer frameType="framed-golden">
          <div className="space-y-4">
            <RPGUIButton
              onClick={onNewGame}
              golden
              className="w-full text-lg py-4"
            >
              ⚔️ Nueva Partida
            </RPGUIButton>

            <RPGUIButton
              onClick={onLoadGame}
              disabled={!hasSavedGame}
              className="w-full"
            >
              📂 Continuar Partida
              {!hasSavedGame && (
                <span className="text-gray-600 text-xs ml-2">(No disponible)</span>
              )}
            </RPGUIButton>

            <RPGUIButton
              onClick={onOptions}
              className="w-full"
            >
              ⚙️ Opciones
            </RPGUIButton>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-gray-700">
              <RPGUIButton
                onClick={() => setShowAbout(true)}
                className="text-sm"
              >
                ℹ️ Acerca de
              </RPGUIButton>
              <RPGUIButton
                onClick={() => setShowCredits(true)}
                className="text-sm"
              >
                🎭 Créditos
              </RPGUIButton>
            </div>
          </div>
        </RPGUIContainer>

        {/* Version info */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-gray-600 text-xs">v0.1.0 - Prólogo Alpha</p>
          <p className="text-gray-700 text-xs">
            Presiona <kbd className="px-2 py-1 bg-gray-800 border border-gray-600">ESC</kbd> en cualquier momento para acceder al menú
          </p>
        </div>
      </div>

      {/* About Modal */}
      <Modal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        title="📜 Acerca del Juego"
        size="medium"
      >
        <div className="space-y-4 text-sm">
          <div className="bg-black/30 p-4 border-2 border-gray-700">
            <h3 className="text-yellow-400 font-bold mb-2">🎮 One Page RPG</h3>
            <p className="text-gray-300 leading-relaxed">
              Un RPG narrativo inspirado en el sistema 2d6, donde tus decisiones
              importan. Ambientado en Griswald, una tierra moribunda donde la
              Plaga del Silencio consume voces y voluntades.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-purple-400 font-bold">⚡ Características:</h4>
            <ul className="text-gray-400 space-y-1 list-disc list-inside">
              <li>Sistema 2d6 con modificadores de atributos</li>
              <li>Narrativa ramificada con consecuencias reales</li>
              <li>Combate estratégico por turnos</li>
              <li>Gestión de inventario y recursos</li>
              <li>Múltiples finales basados en tus decisiones</li>
            </ul>
          </div>

          <div className="bg-red-900/20 p-4 border-2 border-red-700">
            <p className="text-red-400 text-xs font-bold mb-1">⚠️ Estado Actual:</p>
            <p className="text-gray-400 text-xs">
              Este es el prólogo "La Deuda del Ladrón de Ecos". El juego está
              en desarrollo activo. Espera bugs, contenido incompleto y cambios
              frecuentes.
            </p>
          </div>
        </div>
      </Modal>

      {/* Credits Modal */}
      <Modal
        isOpen={showCredits}
        onClose={() => setShowCredits(false)}
        title="🎭 Créditos"
        size="small"
      >
        <div className="space-y-4 text-sm text-center">
          <div>
            <p className="text-yellow-400 font-bold mb-2">Desarrollado por</p>
            <p className="text-gray-300">Tu Equipo de Desarrollo</p>
          </div>

          <div className="border-t-2 border-gray-700 pt-4">
            <p className="text-purple-400 font-bold mb-2">Tecnologías</p>
            <p className="text-gray-400 text-xs space-y-1">
              React + TypeScript + Vite
              <br />
              RPGUI Framework
              <br />
              Tailwind CSS
            </p>
          </div>

          <div className="border-t-2 border-gray-700 pt-4">
            <p className="text-gray-500 text-xs">
              Sistema de Juego inspirado en Powered by the Apocalypse
              <br />
              Press Start 2P font by Google Fonts
            </p>
          </div>

          <div className="pt-4">
            <p className="text-gray-600 text-xs">
              © 2025 - MIT License
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MainMenu;
