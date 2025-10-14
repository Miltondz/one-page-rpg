/**
 * Game Screen - Pantalla principal del juego
 * 
 * Sistema de navegación por tabs:
 * - Quest Panel (debug/desarrollo)
 * - Save Manager (guardar/cargar partidas)
 * - Inventory (gestión de items)
 * - Combat (simulación de combate)
 */

import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import QuestDebugPanel from './QuestDebugPanel';
import SaveGameManager from './SaveGameManager';
import InventoryView from './InventoryView';
import CombatView from './CombatView';
import type { PlayerAttributes } from '../types';

interface GameScreenProps {
  playerName: string;
  playerAttributes: PlayerAttributes;
  onBack: () => void;
}

type TabType = 'quests' | 'save' | 'inventory' | 'combat';

export const GameScreen: React.FC<GameScreenProps> = ({
  playerName,
  playerAttributes,
  onBack,
}) => {
  const { gameState, initializeGame, loading } = useGame();
  const [activeTab, setActiveTab] = useState<TabType>('quests');

  // Inicializar el juego cuando se monta el componente
  useEffect(() => {
    if (!gameState) {
      console.log('Initializing game...', { playerName, playerAttributes });
      initializeGame(playerName, playerAttributes);
    }
  }, [playerName, playerAttributes, gameState, initializeGame]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⚙️</div>
          <p className="text-gray-400 text-xl">Cargando sistemas del juego...</p>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-400 text-xl">Error inicializando el juego</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white"
          >
            Volver al Menú
          </button>
        </div>
      </div>
    );
  }

  // Mock data para demo
  const mockItemCatalog = {}; // TODO: Cargar desde gameData
  const mockEnemies: any[] = []; // TODO: Obtener desde gameState

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header with Tabs */}
        <div className="bg-purple-900 border-4 border-purple-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-purple-400 text-3xl font-bold">
              🎮 {playerName}
            </h1>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-bold border-2 border-red-900"
            >
              ← Menú
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'quests' as const, icon: '📜', label: 'Misiones' },
              { id: 'save' as const, icon: '💾', label: 'Guardar' },
              { id: 'inventory' as const, icon: '🎒', label: 'Inventario' },
              { id: 'combat' as const, icon: '⚔️', label: 'Combate' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-bold border-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-yellow-600 border-yellow-800 text-white'
                    : 'bg-purple-700 hover:bg-purple-600 border-purple-900 text-purple-200'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'quests' && (
            <div className="bg-gray-800 border-4 border-gray-700 p-6">
              <QuestDebugPanel />
            </div>
          )}

          {activeTab === 'save' && gameState && (
            <SaveGameManager
              currentGameState={gameState}
              onClose={() => setActiveTab('quests')}
              mode="manage"
            />
          )}

          {activeTab === 'inventory' && gameState && (
            <InventoryView
              player={gameState.player}
              itemCatalog={mockItemCatalog}
              onClose={() => setActiveTab('quests')}
            />
          )}

          {activeTab === 'combat' && gameState && (
            <div>
              {mockEnemies.length > 0 ? (
                <CombatView
                  player={gameState.player}
                  enemies={mockEnemies}
                  onCombatEnd={(result) => {
                    console.log('Combat ended:', result);
                    setActiveTab('quests');
                  }}
                />
              ) : (
                <div className="bg-gray-800 border-4 border-gray-700 p-12 text-center">
                  <div className="text-6xl mb-4">⚔️</div>
                  <h2 className="text-3xl font-bold text-yellow-300 mb-4">
                    Sistema de Combate
                  </h2>
                  <p className="text-gray-400 mb-6">
                    No hay combate activo en este momento.
                  </p>
                  <p className="text-sm text-gray-500">
                    El combate se activará automáticamente durante la aventura.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
