import { useState } from 'react';
import { RetroGameScreen } from './components/retro/RetroGameScreen';
import SplashScreen from './components/SplashScreen';
import MainMenu from './components/MainMenu';

type AppScreen = 'splash' | 'menu' | 'game';

/**
 * Componente principal de la aplicación
 * Flujo: Splash Screen → Main Menu → Game
 */
function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  
  // Renderizar la pantalla actual
  if (currentScreen === 'splash') {
    return <SplashScreen onComplete={() => setCurrentScreen('menu')} duration={3000} />;
  }
  
  if (currentScreen === 'menu') {
    return (
      <MainMenu
        onNewGame={() => setCurrentScreen('game')}
        onLoadGame={() => {
          // TODO: Implementar carga de partida guardada
          console.log('Load game...');
          setCurrentScreen('game');
        }}
        onOptions={() => {
          // TODO: Implementar pantalla de opciones
          console.log('Options...');
        }}
        hasSavedGame={false}
      />
    );
  }
  
  if (currentScreen === 'game') {
    return <RetroGameScreen />;
  }
  
  return null;
}

export default App;
