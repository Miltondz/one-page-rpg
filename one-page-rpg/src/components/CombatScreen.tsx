import React, { useState, useEffect } from 'react';
import { useCombat } from '../context/CombatContext';
import { RPGUIContainer, RPGUIButton, RPGUIProgress } from '../ui';

/**
 * Pantalla de combate por turnos
 */
export const CombatScreen: React.FC = () => {
  const { combatState, executePlayerAction, isInCombat, endCombat } = useCombat();
  const [selectedEnemyIndex, setSelectedEnemyIndex] = useState(0);
  const [showRewards, setShowRewards] = useState(false);
  const [rewards, setRewards] = useState<{ xp: number; gold: number; items: string[] } | null>(null);

  // Efecto para detectar fin de combate
  useEffect(() => {
    if (combatState && (combatState.phase === 'victory' || combatState.phase === 'defeat')) {
      const combatRewards = endCombat();
      if (combatRewards && combatState.phase === 'victory') {
        setRewards(combatRewards);
        setShowRewards(true);
      }
    }
  }, [combatState, endCombat]);

  if (!isInCombat || !combatState) {
    return null;
  }

  const { player, enemies, phase, combatLog, turn } = combatState;
  const aliveEnemies = enemies.filter(e => !e.isDead);

  // Pantalla de victoria
  if (showRewards && rewards) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        <RPGUIContainer frameType="framed-golden" className="max-w-2xl w-full">
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4">🏆</div>
            <h2 className="text-yellow-400 text-3xl font-bold">¡VICTORIA!</h2>
            
            <div className="bg-black/40 p-6 border-2 border-yellow-600 space-y-4">
              <h3 className="text-yellow-400 text-xl mb-4">Recompensas</h3>
              
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-purple-900/30 p-4 border-2 border-purple-600">
                  <p className="text-purple-400 font-bold mb-2">✨ Experiencia</p>
                  <p className="text-white text-3xl">+{rewards.xp} XP</p>
                </div>
                
                <div className="bg-yellow-900/30 p-4 border-2 border-yellow-600">
                  <p className="text-yellow-400 font-bold mb-2">🪙 Oro</p>
                  <p className="text-white text-3xl">+{rewards.gold}</p>
                </div>
              </div>

              {rewards.items.length > 0 && (
                <div className="bg-blue-900/30 p-4 border-2 border-blue-600">
                  <p className="text-blue-400 font-bold mb-2">🎒 Items Obtenidos</p>
                  <div className="space-y-1">
                    {rewards.items.map((item, i) => (
                      <p key={i} className="text-gray-300 text-sm">• {item}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <RPGUIButton onClick={() => window.location.reload()} golden>
              Continuar →
            </RPGUIButton>
          </div>
        </RPGUIContainer>
      </div>
    );
  }

  // Pantalla de derrota
  if (phase === 'defeat') {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        <RPGUIContainer frameType="framed" className="max-w-2xl w-full">
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4">💀</div>
            <h2 className="text-red-400 text-3xl font-bold">Has sido derrotado...</h2>
            
            <p className="text-gray-400 text-sm">
              La oscuridad te consume. Tu aventura termina aquí.
            </p>

            <div className="flex gap-4 justify-center">
              <RPGUIButton onClick={() => window.location.reload()}>
                Volver al Menú
              </RPGUIButton>
            </div>
          </div>
        </RPGUIContainer>
      </div>
    );
  }

  // Pantalla principal de combate
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-red-900/20 via-gray-900 to-black flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-7xl w-full space-y-4">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-red-400 text-2xl font-bold mb-2">⚔️ COMBATE</h2>
          <p className="text-gray-400 text-sm">Turno {turn} - {phase === 'player' ? 'Tu Turno' : 'Turno Enemigo'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Panel del Jugador */}
          <div className="lg:col-span-1">
            <RPGUIContainer frameType="framed-golden">
              <h3 className="text-yellow-400 text-lg mb-4 border-b-2 border-yellow-600 pb-2">
                👤 {player.name}
              </h3>
              
              {/* HP Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">HP</span>
                  <span className="text-white">{player.wounds} / {player.maxWounds}</span>
                </div>
                <RPGUIProgress
                  value={player.wounds / player.maxWounds}
                  color="red"
                />
              </div>

              {/* Fatigue Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">MP</span>
                  <span className="text-white">{player.fatigue} / {player.maxFatigue}</span>
                </div>
                <RPGUIProgress
                  value={player.fatigue / player.maxFatigue}
                  color="blue"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-black/30 p-2 border border-gray-700">
                  <p className="text-gray-400">💪 FUE</p>
                  <p className="text-purple-400 font-bold text-lg">{player.attributes.FUE}</p>
                </div>
                <div className="bg-black/30 p-2 border border-gray-700">
                  <p className="text-gray-400">🏃 AGI</p>
                  <p className="text-purple-400 font-bold text-lg">{player.attributes.AGI}</p>
                </div>
                <div className="bg-black/30 p-2 border border-gray-700">
                  <p className="text-gray-400">📚 SAB</p>
                  <p className="text-purple-400 font-bold text-lg">{player.attributes.SAB}</p>
                </div>
                <div className="bg-black/30 p-2 border border-gray-700">
                  <p className="text-gray-400">🍀 SUE</p>
                  <p className="text-purple-400 font-bold text-lg">{player.attributes.SUE}</p>
                </div>
              </div>
            </RPGUIContainer>
          </div>

          {/* Panel Central - Enemigos y Acciones */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Enemigos */}
            <RPGUIContainer frameType="framed">
              <h3 className="text-red-400 text-lg mb-4 border-b-2 border-red-600 pb-2">
                👹 Enemigos
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enemies.map((enemy, index) => (
                  <div
                    key={index}
                    className={`p-4 border-2 transition-all cursor-pointer ${
                      enemy.isDead
                        ? 'bg-gray-900/50 border-gray-700 opacity-50'
                        : selectedEnemyIndex === index
                        ? 'bg-red-900/30 border-red-500'
                        : 'bg-black/30 border-gray-700 hover:border-red-600'
                    }`}
                    onClick={() => !enemy.isDead && setSelectedEnemyIndex(index)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{enemy.isDead ? '💀' : '👹'}</span>
                        <div>
                          <p className="text-white font-bold">{enemy.name}</p>
                          <p className="text-gray-500 text-xs">Nivel {enemy.level}</p>
                        </div>
                      </div>
                      {selectedEnemyIndex === index && !enemy.isDead && (
                        <span className="text-yellow-400 text-xl">🎯</span>
                      )}
                    </div>
                    
                    {!enemy.isDead && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">HP</span>
                          <span className="text-white">
                            {enemy.currentWounds} / {enemy.stats?.Heridas || 3}
                          </span>
                        </div>
                        <div className="h-2 bg-black/50 border border-gray-600">
                          <div
                            className="h-full bg-red-600"
                            style={{
                              width: `${(enemy.currentWounds / (enemy.stats?.Heridas || 3)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </RPGUIContainer>

            {/* Acciones del Jugador */}
            {phase === 'player' && (
              <RPGUIContainer frameType="framed-golden">
                <h3 className="text-yellow-400 text-lg mb-4 border-b-2 border-yellow-600 pb-2">
                  ⚔️ Tus Acciones
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <RPGUIButton
                    onClick={() =>
                      executePlayerAction({
                        type: 'attack',
                        targetIndex: selectedEnemyIndex,
                        attribute: 'FUE',
                      })
                    }
                    disabled={aliveEnemies.length === 0}
                  >
                    💪 Ataque FUE
                  </RPGUIButton>

                  <RPGUIButton
                    onClick={() =>
                      executePlayerAction({
                        type: 'attack',
                        targetIndex: selectedEnemyIndex,
                        attribute: 'AGI',
                      })
                    }
                    disabled={aliveEnemies.length === 0}
                  >
                    🏹 Ataque AGI
                  </RPGUIButton>

                  <RPGUIButton
                    onClick={() => executePlayerAction({ type: 'defend' })}
                  >
                    🛡️ Defender
                  </RPGUIButton>

                  <RPGUIButton
                    onClick={() => executePlayerAction({ type: 'flee' })}
                  >
                    🏃 Huir
                  </RPGUIButton>
                </div>

                <p className="text-gray-500 text-xs mt-3 text-center">
                  Selecciona un enemigo y elige tu acción
                </p>
              </RPGUIContainer>
            )}

            {phase === 'enemy' && (
              <div className="text-center py-4">
                <p className="text-red-400 text-xl animate-pulse">
                  ⚔️ Turno de los enemigos...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Combat Log */}
        <RPGUIContainer frameType="framed" className="max-h-48 overflow-y-auto custom-scrollbar">
          <h3 className="text-gray-400 text-sm mb-2 border-b border-gray-700 pb-1">
            📋 Log de Combate
          </h3>
          <div className="space-y-1 text-xs">
            {combatLog.slice(-10).reverse().map((entry, i) => (
              <p
                key={combatLog.length - i}
                className={`${
                  entry.actor === player.name
                    ? 'text-green-400'
                    : entry.actor === 'Sistema'
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}
              >
                <span className="text-gray-500">[T{entry.turn}]</span> {entry.result}
              </p>
            ))}
          </div>
        </RPGUIContainer>
      </div>
    </div>
  );
};

export default CombatScreen;
