import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { PlayerState, Enemy } from '../types';
import { CombatEngine, type CombatState, type PlayerCombatAction, type CombatActionResult } from '../engine/CombatEngine';

interface CombatContextType {
  isInCombat: boolean;
  combatState: CombatState | null;
  
  // Actions
  startCombat: (player: PlayerState, enemies: Enemy[]) => void;
  executePlayerAction: (action: PlayerCombatAction) => Promise<CombatActionResult>;
  executeEnemyTurn: () => Promise<CombatActionResult[]>;
  endCombat: () => { xp: number; gold: number; items: string[] } | null;
}

const CombatContext = createContext<CombatContextType | undefined>(undefined);

/**
 * Provider del contexto de combate
 */
export const CombatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [combatEngine, setCombatEngine] = useState<CombatEngine | null>(null);
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [isInCombat, setIsInCombat] = useState(false);

  /**
   * Iniciar un nuevo combate
   */
  const startCombat = (player: PlayerState, enemies: Enemy[]) => {
    const engine = new CombatEngine(player, enemies);
    setCombatEngine(engine);
    setCombatState(engine.getState());
    setIsInCombat(true);
    
    console.log('⚔️ Combat started!');
    console.log('👤 Player:', player.name, `(${player.wounds}/${player.maxWounds} HP)`);
    console.log('👹 Enemies:', enemies.map(e => e.definition.name).join(', '));
  };

  /**
   * Ejecutar acción del jugador
   */
  const executePlayerAction = async (action: PlayerCombatAction): Promise<CombatActionResult> => {
    if (!combatEngine) {
      throw new Error('No combat in progress');
    }

    const result = await combatEngine.processPlayerAction(action);
    setCombatState(combatEngine.getState());

    console.log('🎯 Player action:', action.type, '→', result.message);

    // Si el combate terminó (victoria o derrota), no ejecutar turno enemigo
    if (combatEngine.isCombatOver()) {
      return result;
    }

    // Auto-ejecutar turno enemigo después de un delay
    setTimeout(async () => {
      await executeEnemyTurn();
    }, 1000);

    return result;
  };

  /**
   * Ejecutar turno de los enemigos
   */
  const executeEnemyTurn = async (): Promise<CombatActionResult[]> => {
    if (!combatEngine) {
      throw new Error('No combat in progress');
    }

    const results = await combatEngine.processEnemyTurn();
    setCombatState(combatEngine.getState());

    console.log('👹 Enemy turn:', results.length, 'actions');
    results.forEach((result, i) => {
      console.log(`  ${i + 1}. ${result.message}`);
    });

    return results;
  };

  /**
   * Terminar combate y obtener recompensas
   */
  const endCombat = (): { xp: number; gold: number; items: string[] } | null => {
    if (!combatEngine) {
      return null;
    }

    const rewards = combatEngine.getRewards();
    
    setCombatEngine(null);
    setCombatState(null);
    setIsInCombat(false);

    console.log('🏆 Combat ended! Rewards:', rewards);

    return rewards;
  };

  const value: CombatContextType = {
    isInCombat,
    combatState,
    startCombat,
    executePlayerAction,
    executeEnemyTurn,
    endCombat,
  };

  return <CombatContext.Provider value={value}>{children}</CombatContext.Provider>;
};

/**
 * Hook para usar el contexto de combate
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useCombat = () => {
  const context = useContext(CombatContext);
  if (context === undefined) {
    throw new Error('useCombat must be used within a CombatProvider');
  }
  return context;
};

export default CombatContext;
