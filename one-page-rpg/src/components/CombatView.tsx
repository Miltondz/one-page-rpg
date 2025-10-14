/**
 * Combat View - UI del sistema de combate por turnos
 * 
 * Características:
 * - Muestra stats de jugador y enemigos
 * - Acciones de combate (atacar, defender, usar item, huir)
 * - Log de combate con historial
 * - Animaciones visuales de daño
 * - Resultado del combate (victoria/derrota)
 */

import React, { useState, useEffect, useRef } from 'react';
import { CombatEngine, type CombatState, type PlayerCombatAction, type CombatEnemy } from '../engine/CombatEngine';
import type { Player, Enemy } from '../types';

interface CombatViewProps {
  /** Jugador */
  player: Player;
  
  /** Enemigos a enfrentar */
  enemies: Enemy[];
  
  /** Callback cuando termina el combate */
  onCombatEnd: (result: {
    victory: boolean;
    rewards?: { xp: number; gold: number; items: string[] };
    playerState: Player;
  }) => void;
  
}

interface AnimatedDamage {
  id: string;
  target: 'player' | number;
  damage: number;
  isCritical: boolean;
}

export const CombatView: React.FC<CombatViewProps> = ({
  player,
  enemies,
  onCombatEnd,
}) => {
  const [combatEngine] = useState(() => new CombatEngine(
    {
      name: player.name,
      level: player.level,
      xp: player.xp,
      experience: player.xp,
      xpToNextLevel: player.xpToNextLevel,
      experienceToNextLevel: player.xpToNextLevel,
      attributes: {
        FUE: player.attributes.FUE || 0,
        AGI: player.attributes.AGI || 0,
        SAB: player.attributes.SAB || 0,
        SUE: player.attributes.SUE || 0,
      },
      wounds: player.wounds,
      maxWounds: player.maxWounds,
      fatigue: player.fatigue,
      maxFatigue: player.maxFatigue,
      gold: player.gold,
      inventory: player.inventory,
      inventorySlots: player.inventorySlots,
      equippedItems: player.equippedItems || {},
      statusEffects: player.statusEffects || [],
    },
    enemies
  ));

  const [combatState, setCombatState] = useState<CombatState>(combatEngine.getState());
  const [selectedAction, setSelectedAction] = useState<'attack' | 'defend' | 'item' | 'flee' | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number>(0);
  const [selectedAttribute, setSelectedAttribute] = useState<'FUE' | 'AGI'>('FUE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [animatedDamages, setAnimatedDamages] = useState<AnimatedDamage[]>([]);
  const [showVictory, setShowVictory] = useState(false);
  const [showDefeat, setShowDefeat] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll del log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatState.combatLog]);

  /**
   * Ejecuta una acción del jugador
   */
  const executePlayerAction = async (action: PlayerCombatAction) => {
    if (isProcessing || combatEngine.isCombatOver()) return;

    setIsProcessing(true);

    try {
      // Procesar acción del jugador
      const result = await combatEngine.processPlayerAction(action);
      
      // Mostrar animación de daño si aplica
      if (result.damage && action.type === 'attack') {
        addDamageAnimation(action.targetIndex, result.damage, result.critical || false);
      }

      // Actualizar estado
      let newState = combatEngine.getState();
      setCombatState(newState);

      // Si el combate terminó
      if (combatEngine.isCombatOver()) {
        handleCombatEnd(newState.phase === 'victory');
        return;
      }

      // Esperar un momento antes del turno enemigo
      await new Promise(resolve => setTimeout(resolve, 800));

      // Procesar turno enemigo
      const enemyResults = await combatEngine.processEnemyTurn();
      
      // Mostrar animaciones de daño enemigo
      enemyResults.forEach(result => {
        if (result.damage) {
          addDamageAnimation('player', result.damage, result.critical || false);
        }
      });

      // Actualizar estado final
      newState = combatEngine.getState();
      setCombatState(newState);

      // Verificar si el combate terminó
      if (combatEngine.isCombatOver()) {
        handleCombatEnd(newState.phase === 'victory');
      }
    } catch (error) {
      console.error('Error en combate:', error);
    } finally {
      setIsProcessing(false);
      setSelectedAction(null);
    }
  };

  /**
   * Añade una animación de daño
   */
  const addDamageAnimation = (target: 'player' | number, damage: number, isCritical: boolean) => {
    const id = `damage-${Date.now()}-${Math.random()}`;
    setAnimatedDamages(prev => [...prev, { id, target, damage, isCritical }]);
    
    // Remover después de la animación
    setTimeout(() => {
      setAnimatedDamages(prev => prev.filter(d => d.id !== id));
    }, 1500);
  };

  /**
   * Maneja el final del combate
   */
  const handleCombatEnd = (victory: boolean) => {
    setTimeout(() => {
      if (victory) {
        setShowVictory(true);
      } else {
        setShowDefeat(true);
      }

      // Callback después de mostrar el resultado
      setTimeout(() => {
        const finalState = combatEngine.getState();
        const rewards = victory ? combatEngine.getRewards() : undefined;
        
        // Convertir estado del jugador de vuelta al formato Player
        const updatedPlayer: Player = {
          ...player,
          wounds: finalState.player.wounds,
          fatigue: finalState.player.fatigue,
          gold: finalState.player.gold,
        };

        onCombatEnd({
          victory,
          rewards,
          playerState: updatedPlayer,
        });
      }, 2000);
    }, 500);
  };

  /**
   * Renderiza la barra de HP
   */
  const renderHealthBar = (current: number, max: number, color: string = 'green') => {
    const percentage = Math.max(0, (current / max) * 100);
    const colorClasses = {
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
    }[color] || 'bg-green-500';

    return (
      <div className="w-full h-4 bg-gray-700 border-2 border-gray-600">
        <div
          className={`h-full ${colorClasses} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  /**
   * Renderiza un enemigo
   */
  const renderEnemy = (enemy: CombatEnemy, index: number) => {
    const isSelected = selectedAction === 'attack' && selectedTarget === index;
    const damageAnim = animatedDamages.find(d => d.target === index);

    return (
      <div
        key={enemy.id + index}
        onClick={() => selectedAction === 'attack' && !enemy.isDead && setSelectedTarget(index)}
        className={`relative p-4 border-2 transition-all ${
          enemy.isDead
            ? 'opacity-50 border-gray-600 bg-gray-800'
            : isSelected
            ? 'border-yellow-400 bg-red-900 cursor-pointer'
            : 'border-red-600 bg-gray-800 hover:border-red-400 cursor-pointer'
        }`}
      >
        {/* Animación de daño */}
        {damageAnim && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className={`text-4xl font-bold animate-bounce ${damageAnim.isCritical ? 'text-yellow-400' : 'text-red-400'}`}>
              -{damageAnim.damage} {damageAnim.isCritical && '⚡'}
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="text-4xl">
            {enemy.isDead ? '💀' : '👹'}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-300">
              {enemy.name} {enemy.level && `(Nv.${enemy.level})`}
            </h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">HP:</span>
                <span className="text-red-300 font-bold">
                  {enemy.currentWounds}/{enemy.stats?.Heridas || 3}
                </span>
              </div>
              {renderHealthBar(enemy.currentWounds, enemy.stats?.Heridas || 3, 'red')}
              
              <div className="flex gap-4 text-xs text-gray-400 mt-2">
                <span>⚔️ FUE:{enemy.stats?.FUE || 0}</span>
                <span>🏃 AGI:{enemy.stats?.AGI || 0}</span>
                <span>🛡️ DEF:{enemy.stats?.DEF || 7}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-red-900 border-4 border-red-700 p-4 text-center">
          <h1 className="text-3xl font-bold text-yellow-300">
            ⚔️ COMBATE - Turno {combatState.turn}
          </h1>
          <p className="text-red-300 mt-1">
            {combatState.phase === 'player' ? '¡Tu turno!' : 'Turno del enemigo...'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Columna Izquierda: Jugador */}
          <div className="space-y-4">
            <div className="bg-blue-900 border-4 border-blue-700 p-4">
              <h2 className="text-2xl font-bold text-yellow-300 mb-3 text-center">
                🛡️ {combatState.player.name}
              </h2>
              
              {/* Animación de daño del jugador */}
              {animatedDamages.find(d => d.target === 'player') && (
                <div className="text-center mb-2">
                  <span className="text-4xl font-bold text-red-400 animate-bounce inline-block">
                    -{animatedDamages.find(d => d.target === 'player')?.damage}
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {/* HP */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">❤️ Heridas:</span>
                    <span className="text-green-300 font-bold">
                      {combatState.player.wounds}/{combatState.player.maxWounds}
                    </span>
                  </div>
                  {renderHealthBar(combatState.player.wounds, combatState.player.maxWounds, 'green')}
                </div>

                {/* Fatiga */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">💤 Fatiga:</span>
                    <span className="text-yellow-300 font-bold">
                      {combatState.player.fatigue}/{combatState.player.maxFatigue}
                    </span>
                  </div>
                  {renderHealthBar(combatState.player.fatigue, combatState.player.maxFatigue, 'yellow')}
                </div>

                {/* Atributos */}
                <div className="pt-2 border-t border-blue-700">
                  <p className="text-xs text-gray-400 mb-2">Atributos:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-800 p-2 border border-gray-700">
                      <span className="text-gray-400">⚔️ FUE:</span>
                      <span className="text-white font-bold ml-1">{combatState.player.attributes.FUE}</span>
                    </div>
                    <div className="bg-gray-800 p-2 border border-gray-700">
                      <span className="text-gray-400">🏃 AGI:</span>
                      <span className="text-white font-bold ml-1">{combatState.player.attributes.AGI}</span>
                    </div>
                    <div className="bg-gray-800 p-2 border border-gray-700">
                      <span className="text-gray-400">📖 SAB:</span>
                      <span className="text-white font-bold ml-1">{combatState.player.attributes.SAB}</span>
                    </div>
                    <div className="bg-gray-800 p-2 border border-gray-700">
                      <span className="text-gray-400">🍀 SUE:</span>
                      <span className="text-white font-bold ml-1">{combatState.player.attributes.SUE}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones de Combate */}
            {combatState.phase === 'player' && !combatEngine.isCombatOver() && (
              <div className="bg-gray-800 border-4 border-purple-700 p-4">
                <h3 className="text-xl font-bold text-purple-300 mb-3 text-center">
                  ⚡ Acciones
                </h3>
                <div className="space-y-2">
                  {/* Atacar */}
                  <button
                    onClick={() => setSelectedAction('attack')}
                    disabled={isProcessing}
                    className={`w-full p-3 font-bold border-2 transition-all ${
                      selectedAction === 'attack'
                        ? 'bg-red-700 border-red-900 text-white'
                        : 'bg-red-600 hover:bg-red-700 border-red-800 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    ⚔️ Atacar
                  </button>

                  {selectedAction === 'attack' && (
                    <div className="bg-gray-900 p-3 border-2 border-gray-700 space-y-2">
                      <p className="text-sm text-gray-400">Selecciona atributo:</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedAttribute('FUE')}
                          className={`flex-1 p-2 border-2 ${
                            selectedAttribute === 'FUE'
                              ? 'bg-purple-700 border-purple-900'
                              : 'bg-gray-700 border-gray-800'
                          }`}
                        >
                          ⚔️ FUE
                        </button>
                        <button
                          onClick={() => setSelectedAttribute('AGI')}
                          className={`flex-1 p-2 border-2 ${
                            selectedAttribute === 'AGI'
                              ? 'bg-purple-700 border-purple-900'
                              : 'bg-gray-700 border-gray-800'
                          }`}
                        >
                          🏃 AGI
                        </button>
                      </div>
                      <button
                        onClick={() => executePlayerAction({
                          type: 'attack',
                          targetIndex: selectedTarget,
                          attribute: selectedAttribute,
                        })}
                        disabled={combatState.enemies[selectedTarget]?.isDead}
                        className="w-full p-2 bg-green-700 hover:bg-green-600 border-2 border-green-900 font-bold disabled:opacity-50"
                      >
                        ✓ Confirmar Ataque
                      </button>
                    </div>
                  )}

                  {/* Defender */}
                  <button
                    onClick={() => executePlayerAction({ type: 'defend' })}
                    disabled={isProcessing}
                    className="w-full p-3 bg-blue-600 hover:bg-blue-700 border-2 border-blue-800 font-bold disabled:opacity-50"
                  >
                    🛡️ Defender
                  </button>

                  {/* Usar Item */}
                  <button
                    onClick={() => setSelectedAction('item')}
                    disabled={isProcessing || player.inventory.length === 0}
                    className="w-full p-3 bg-green-600 hover:bg-green-700 border-2 border-green-800 font-bold disabled:opacity-50"
                  >
                    💊 Usar Item
                  </button>

                  {/* Huir */}
                  <button
                    onClick={() => executePlayerAction({ type: 'flee' })}
                    disabled={isProcessing}
                    className="w-full p-3 bg-yellow-600 hover:bg-yellow-700 border-2 border-yellow-800 font-bold disabled:opacity-50"
                  >
                    🏃 Huir
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Columna Central: Log de Combate */}
          <div className="bg-gray-800 border-4 border-gray-700 p-4 flex flex-col max-h-[600px]">
            <h2 className="text-2xl font-bold text-yellow-300 mb-3 text-center">
              📜 Registro de Combate
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {combatState.combatLog.map((entry, index) => (
                <div
                  key={index}
                  className={`p-2 border-l-4 ${
                    entry.actor === 'Sistema'
                      ? 'border-yellow-500 bg-gray-900'
                      : entry.actor === combatState.player.name
                      ? 'border-blue-500 bg-blue-950'
                      : 'border-red-500 bg-red-950'
                  }`}
                >
                  <p className="text-sm">
                    <span className="font-bold text-yellow-300">[Turno {entry.turn}]</span>
                    {' '}
                    <span className="text-gray-300">{entry.result}</span>
                  </p>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* Columna Derecha: Enemigos */}
          <div className="space-y-3">
            <div className="bg-red-900 border-4 border-red-700 p-3 text-center">
              <h2 className="text-2xl font-bold text-yellow-300">
                👹 Enemigos
              </h2>
            </div>
            {combatState.enemies.map((enemy, index) => renderEnemy(enemy, index))}
          </div>
        </div>
      </div>

      {/* Victoria */}
      {showVictory && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-green-900 to-green-950 border-4 border-yellow-500 p-8 max-w-md text-center animate-pulse">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-4xl font-bold text-yellow-300 mb-4">
              ¡VICTORIA!
            </h2>
            <p className="text-green-300 text-xl">
              Has derrotado a todos los enemigos
            </p>
          </div>
        </div>
      )}

      {/* Derrota */}
      {showDefeat && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-red-900 to-red-950 border-4 border-red-700 p-8 max-w-md text-center">
            <div className="text-6xl mb-4">💀</div>
            <h2 className="text-4xl font-bold text-red-300 mb-4">
              DERROTA
            </h2>
            <p className="text-gray-300 text-xl">
              Has sido vencido en combate...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombatView;
