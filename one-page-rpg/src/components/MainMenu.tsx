import React from 'react';
import { RPGUIContainer, RPGUIButton, RPGUIContent, RPGUIHR } from '../ui';

interface MainMenuProps {
  onNewGame: () => void;
  onLoadGame: () => void;
  onOptions: () => void;
  hasSavedGame?: boolean;
}

/**
 * Menú principal del juego usando RPGUI
 */
export const MainMenu: React.FC<MainMenuProps> = ({
  onNewGame,
  onLoadGame,
  onOptions,
  hasSavedGame = false,
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #581c87 0%, #1f2937 50%, #000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px'
    }}>
      <RPGUIContent>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Logo y título */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '80px', marginBottom: '16px' }}>⚔️</div>
            <h1 style={{
              color: '#a855f7',
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '8px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}>
              ONE PAGE RPG
            </h1>
            <p style={{
              color: '#fbbf24',
              fontSize: '16px',
              letterSpacing: '0.1em',
              marginBottom: '8px'
            }}>
              GRISWALD CHRONICLES
            </p>
            <p style={{
              color: '#6b7280',
              fontSize: '12px'
            }}>
              La Deuda del Ladrón de Ecos
            </p>
          </div>

          {/* Main Menu Container */}
          <RPGUIContainer frameType="framed-golden">
            <div style={{ padding: '20px' }}>
              <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Menú Principal</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <RPGUIButton onClick={onNewGame} golden>
                  <span style={{ fontSize: '16px' }}>⚔️ Nueva Partida</span>
                </RPGUIButton>

                <RPGUIButton onClick={onLoadGame} disabled={!hasSavedGame}>
                  <span style={{ fontSize: '14px' }}>
                    📂 Continuar Partida
                    {!hasSavedGame && <span style={{ color: '#6b7280', fontSize: '10px' }}> (No disponible)</span>}
                  </span>
                </RPGUIButton>

                <RPGUIButton onClick={onOptions}>
                  <span style={{ fontSize: '14px' }}>⚙️ Opciones</span>
                </RPGUIButton>

                <RPGUIHR />

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '12px' 
                }}>
                  <RPGUIButton onClick={() => alert('Acerca de: One Page RPG v0.1.0')}>
                    <span style={{ fontSize: '12px' }}>ℹ️ Acerca de</span>
                  </RPGUIButton>
                  <RPGUIButton onClick={() => alert('Créditos: Desarrollado con React + RPGUI')}>
                    <span style={{ fontSize: '12px' }}>🎭 Créditos</span>
                  </RPGUIButton>
                </div>
              </div>
            </div>
          </RPGUIContainer>

          {/* Version info */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ color: '#4b5563', fontSize: '12px', marginBottom: '8px' }}>
              v0.1.0 - Prólogo Alpha
            </p>
            <p style={{ color: '#374151', fontSize: '10px' }}>
              Presiona <kbd style={{
                padding: '2px 8px',
                backgroundColor: '#1f2937',
                border: '1px solid #4b5563',
                borderRadius: '4px'
              }}>ESC</kbd> en cualquier momento para acceder al menú
            </p>
          </div>
        </div>
      </RPGUIContent>
    </div>
  );
};

export default MainMenu;
