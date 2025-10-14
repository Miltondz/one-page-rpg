/**
 * DiceOutcomeDisplay - Visualización de resultados de tiradas de dados
 * 
 * Muestra los dados en 2D con animación y efectos visuales según el outcome
 * Puede usarse como panel siempre visible o como modal emergente
 */

import React, { useState, useEffect } from 'react';
import type { RollResult } from '../utils/DiceSystem';
import { RPGUIContainer } from '../ui';

interface DiceOutcomeDisplayProps {
  /** Resultado de la tirada */
  result: RollResult | null;
  
  /** Modo de visualización */
  mode?: 'persistent' | 'modal';
  
  /** Si está visible (para modo modal) */
  isVisible?: boolean;
  
  /** Callback al cerrar (modo modal) */
  onClose?: () => void;
  
  /** Posición en pantalla (modo persistent) */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  
  /** Si debe mostrar animación de rolling */
  animate?: boolean;
}

/**
 * Mapeo de outcome a colores y efectos
 */
const OUTCOME_STYLES = {
  critical_success: {
    color: '#FFD700',
    glow: '#FFA500',
    icon: '⭐',
    label: '¡CRÍTICO!',
    bgClass: 'from-yellow-600 to-orange-600',
    borderColor: 'border-yellow-400',
  },
  success: {
    color: '#4ADE80',
    glow: '#22C55E',
    icon: '✓',
    label: 'Éxito',
    bgClass: 'from-green-600 to-green-700',
    borderColor: 'border-green-400',
  },
  partial_success: {
    color: '#FBBF24',
    glow: '#F59E0B',
    icon: '⚠',
    label: 'Éxito Parcial',
    bgClass: 'from-yellow-500 to-amber-600',
    borderColor: 'border-yellow-400',
  },
  critical_failure: {
    color: '#EF4444',
    glow: '#DC2626',
    icon: '✗',
    label: 'FALLO CRÍTICO',
    bgClass: 'from-red-600 to-red-800',
    borderColor: 'border-red-400',
  },
};

/**
 * Componente de dado individual con animación
 */
const AnimatedDie: React.FC<{ 
  value: number; 
  isRolling: boolean; 
  outcome: keyof typeof OUTCOME_STYLES;
  delay?: number;
}> = ({ value, isRolling, outcome, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const style = OUTCOME_STYLES[outcome];

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        setDisplayValue(value);
      }, 1000 + delay);

      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
    }
  }, [isRolling, value, delay]);

  return (
    <div
      className={`
        relative w-16 h-16 rounded-lg flex items-center justify-center
        font-bold text-3xl transform transition-all duration-300
        ${isRolling ? 'animate-bounce' : 'hover:scale-110'}
      `}
      style={{
        backgroundColor: style.color,
        boxShadow: `0 0 20px ${style.glow}, inset 0 0 10px rgba(255,255,255,0.3)`,
        border: '3px solid rgba(255,255,255,0.4)',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Valor del dado */}
      <span className="text-white relative z-10">{displayValue}</span>
      
      {/* Puntos decorativos (estilo dado tradicional) */}
      {!isRolling && (
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: displayValue }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-black"
              style={{
                top: `${20 + (i % 3) * 25}%`,
                left: `${20 + Math.floor(i / 3) * 25}%`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Componente principal de visualización
 */
export const DiceOutcomeDisplay: React.FC<DiceOutcomeDisplayProps> = ({
  result,
  mode = 'persistent',
  isVisible = true,
  onClose,
  position = 'top-right',
  animate = true,
}) => {
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (result && animate) {
      setIsRolling(true);
      setTimeout(() => setIsRolling(false), 1500);
    }
  }, [result, animate]);

  if (!result || (mode === 'modal' && !isVisible)) {
    return null;
  }

  const style = OUTCOME_STYLES[result.outcome];

  // Posicionamiento para modo persistent
  const positionClasses = mode === 'persistent' ? {
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'center': 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  }[position] : '';

  // Contenedor modal
  const ModalWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="animate-scale-in">
        {children}
      </div>
    </div>
  );

  const content = (
    <RPGUIContainer
      frameType="framed-golden"
      className={`
        ${mode === 'persistent' ? positionClasses : ''}
        ${mode === 'persistent' ? 'w-80' : 'w-96'}
        z-40 transition-all duration-300
      `}
      style={{
        boxShadow: `0 0 30px ${style.glow}`,
      }}
    >
      {/* Header con outcome */}
      <div
        className={`
          bg-gradient-to-r ${style.bgClass} 
          px-4 py-3 -mx-4 -mt-4 mb-4
          border-b-4 ${style.borderColor}
          flex items-center justify-between
        `}
      >
        <div className="flex items-center gap-2">
          <span className="text-3xl" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' }}>
            {style.icon}
          </span>
          <h3 className="text-white font-bold text-xl drop-shadow-lg">
            {style.label}
          </h3>
        </div>
        
        {mode === 'modal' && onClose && (
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dados */}
      <div className="flex justify-center gap-3 mb-4">
        {result.dice.map((die, index) => (
          <AnimatedDie
            key={index}
            value={die}
            isRolling={isRolling}
            outcome={result.outcome}
            delay={index * 200}
          />
        ))}
      </div>

      {/* Información de la tirada */}
      <div className="bg-black/40 rounded p-3 space-y-2 text-sm">
        {/* Total de dados */}
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Dados:</span>
          <span className="text-white font-bold">
            {result.dice.join(' + ')} = {result.diceTotal}
          </span>
        </div>

        {/* Modificador */}
        {result.modifier !== 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Modificador:</span>
            <span className={`font-bold ${result.modifier > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {result.modifier > 0 ? '+' : ''}{result.modifier}
            </span>
          </div>
        )}

        {/* Total final */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-600">
          <span className="text-yellow-400 font-bold">Total:</span>
          <span className="text-white font-bold text-xl">{result.total}</span>
        </div>

        {/* Dificultad */}
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Dificultad:</span>
          <span className="text-purple-400 font-bold">{result.difficulty}+</span>
        </div>

        {/* Resultado */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-600">
          <span className="text-gray-300">Resultado:</span>
          <span className={`font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
            {result.success ? 'ÉXITO' : 'FALLO'}
          </span>
        </div>

        {/* Ventaja/Desventaja */}
        {result.advantageType !== 'none' && (
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Tipo:</span>
            <span className={`font-bold ${
              result.advantageType === 'advantage' ? 'text-blue-400' : 'text-orange-400'
            }`}>
              {result.advantageType === 'advantage' ? '↑ Ventaja' : '↓ Desventaja'}
            </span>
          </div>
        )}

        {/* Bonus (críticos) */}
        {result.bonus && (
          <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-600 rounded">
            <p className="text-yellow-300 text-xs font-bold mb-1">✨ Bonus:</p>
            <p className="text-yellow-100 text-xs">{result.bonus}</p>
          </div>
        )}

        {/* Consecuencia (fallos parciales) */}
        {result.consequence && (
          <div className="mt-2 p-2 bg-orange-900/30 border border-orange-600 rounded">
            <p className="text-orange-300 text-xs font-bold mb-1">⚠ Consecuencia:</p>
            <p className="text-orange-100 text-xs">{result.consequence}</p>
          </div>
        )}
      </div>
    </RPGUIContainer>
  );

  return mode === 'modal' ? <ModalWrapper>{content}</ModalWrapper> : content;
};

export default DiceOutcomeDisplay;
