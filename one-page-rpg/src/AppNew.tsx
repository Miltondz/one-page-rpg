import { useState } from 'react';
import './styles/animations.css';
import {
  SplashScreen,
  MainMenu,
  CharacterCreation,
} from './components';
import type { PlayerAttributes } from './types';
import { GameProvider } from './context/GameContext';
import GameScreen from './components/GameScreen';

type GameScreen = 'splash' | 'menu' | 'character-creation' | 'game' | 'options';

/**
 * Componente principal con sistema de navegación completo
 */
function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('splash');
  const [playerName, setPlayerName] = useState('');
  const [playerAttributes, setPlayerAttributes] = useState<PlayerAttributes | null>(null);
  const [hasSavedGame] = useState(false); // TODO: Implementar lógica de guardado

  // Handlers
  const handleSplashComplete = () => {
    setCurrentScreen('menu');
  };

  const handleNewGame = () => {
    setCurrentScreen('character-creation');
  };

  const handleLoadGame = () => {
    // TODO: Implementar lógica de carga
    console.log('Load game');
  };

  const handleOptions = () => {
    setCurrentScreen('options');
  };

  const handleCharacterCreated = (name: string, attributes: PlayerAttributes) => {
    setPlayerName(name);
    setPlayerAttributes(attributes);
    setCurrentScreen('game');
    console.log('Character created:', { name, attributes });
  };

  // Render screens
  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return (
          <SplashScreen
            onComplete={handleSplashComplete}
            duration={3000}
          />
        );

      case 'menu':
        return (
          <MainMenu
            onNewGame={handleNewGame}
            onLoadGame={handleLoadGame}
            onOptions={handleOptions}
            hasSavedGame={hasSavedGame}
          />
        );

      case 'character-creation':
        return (
          <CharacterCreation
            onComplete={handleCharacterCreated}
            onBack={() => setCurrentScreen('menu')}
          />
        );

      case 'game':
        if (!playerName || !playerAttributes) {
          return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-400 text-xl mb-4">⚠️ Error: No hay datos del personaje</p>
                <button
                  onClick={() => setCurrentScreen('menu')}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white"
                >
                  Volver al Menú
                </button>
              </div>
            </div>
          );
        }
        
        return (
          <GameScreen
            playerName={playerName}
            playerAttributes={playerAttributes}
            onBack={() => setCurrentScreen('menu')}
          />
        );

      case 'options':
        return (
          <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8 flex items-center justify-center">
            <div className="text-center space-y-6 max-w-2xl">
              <div className="text-8xl mb-4">⚙️</div>
              <h1 className="text-purple-400 text-4xl font-bold">Opciones</h1>
              <div className="bg-black/40 p-8 border-2 border-gray-700">
                <p className="text-gray-400 text-lg mb-6">
                  Configuración en desarrollo
                </p>
                <div className="space-y-4 text-left">
                  <div className="bg-gray-800/50 p-4 border border-gray-600">
                    <p className="text-yellow-400 font-bold mb-2">🔊 Audio</p>
                    <p className="text-gray-500 text-sm">
                      Volumen de música, efectos de sonido, etc.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 p-4 border border-gray-600">
                    <p className="text-yellow-400 font-bold mb-2">🎨 Video</p>
                    <p className="text-gray-500 text-sm">
                      Efectos de scanline, brillo, contraste, etc.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 p-4 border border-gray-600">
                    <p className="text-yellow-400 font-bold mb-2">🎮 Gameplay</p>
                    <p className="text-gray-500 text-sm">
                      Dificultad, velocidad de texto, autoguardado, etc.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCurrentScreen('menu')}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-none border-4 border-purple-800 shadow-lg transition-all hover:scale-105"
              >
                ← Volver al Menú
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <GameProvider>
      <div className="min-h-screen bg-black">
        {renderScreen()}
      </div>
    </GameProvider>
  );
}

export default App;
