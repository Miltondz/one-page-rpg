import { useState } from 'react';
import './styles/animations.css';
import {
  SplashScreen,
  MainMenu,
  CharacterCreation,
} from './components';
import { PlayerAttributes } from './types';

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
        return (
          <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8 flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="text-8xl mb-4">🎮</div>
              <h1 className="text-purple-400 text-4xl font-bold">
                Juego en Desarrollo
              </h1>
              <div className="bg-black/40 p-6 border-2 border-gray-700 max-w-md mx-auto">
                <p className="text-gray-300 mb-4">
                  Personaje: <span className="text-yellow-400 font-bold">{playerName}</span>
                </p>
                <div className="grid grid-cols-2 gap-4 text-gray-400 text-sm">
                  <div className="bg-gray-800/50 p-3 border border-gray-600">
                    <p className="text-purple-400 font-bold">💪 FUE</p>
                    <p className="text-2xl">{playerAttributes?.FUE}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 border border-gray-600">
                    <p className="text-purple-400 font-bold">🏃 AGI</p>
                    <p className="text-2xl">{playerAttributes?.AGI}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 border border-gray-600">
                    <p className="text-purple-400 font-bold">📚 SAB</p>
                    <p className="text-2xl">{playerAttributes?.SAB}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 border border-gray-600">
                    <p className="text-purple-400 font-bold">🍀 SUE</p>
                    <p className="text-2xl">{playerAttributes?.SUE}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 text-gray-500 text-sm">
                <p>Próximamente: Motor narrativo, sistema de combate, gestión de inventario</p>
                <p className="text-xs text-gray-600">
                  Ver <code className="bg-gray-800 px-2 py-1">/public/preview.html</code> para una vista previa estática
                </p>
              </div>
              <button
                onClick={() => setCurrentScreen('menu')}
                className="mt-8 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-none border-4 border-purple-800 shadow-lg transition-all hover:scale-105"
              >
                ← Volver al Menú
              </button>
            </div>
          </div>
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
    <div className="min-h-screen bg-black">
      {renderScreen()}
    </div>
  );
}

export default App;
