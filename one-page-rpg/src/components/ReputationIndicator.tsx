/**
 * ReputationIndicator - Indicador visual de reputación con facciones
 * 
 * Muestra barras de progreso por facción con código de colores y tooltips informativos
 * Notifica cuando cambia el nivel de actitud
 */

import React, { useState } from 'react';
import type { FactionId } from '../types';
import { RPGUIContainer, RPGUIProgress } from '../ui';

interface ReputationIndicatorProps {
  /** Sistema de reputación para cálculos */
  reputationSystem?: any;
  
  /** Modo de visualización */
  mode?: 'compact' | 'full';
  
  /** Posición en pantalla */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'sidebar';
  
  /** Si se debe mostrar u ocultar */
  visible?: boolean;
}

interface FactionInfo {
  id: FactionId;
  name: string;
  icon: string;
  description: string;
}

/**
 * Información de facciones conocidas
 */
const FACTIONS: Record<FactionId, FactionInfo> = {
  casa_von_hess: {
    id: 'casa_von_hess',
    name: 'Casa Von Hess',
    icon: '🏰',
    description: 'Familia noble con influencia en la región',
  },
  circulo_eco: {
    id: 'circulo_eco',
    name: 'Círculo del Eco',
    icon: '🌿',
    description: 'Organización de sabios y naturalistas',
  },
  culto_silencio: {
    id: 'culto_silencio',
    name: 'Culto del Silencio',
    icon: '🌑',
    description: 'Secta misteriosa de adoradores oscuros',
  },
};

/**
 * Mapeo de actitud a colores y estilos
 */
const ATTITUDE_STYLES = {
  hostile: {
    color: 'red',
    bgColor: 'bg-red-900/50',
    borderColor: 'border-red-600',
    textColor: 'text-red-400',
    icon: '💀',
    label: 'Hostil',
  },
  unfriendly: {
    color: 'orange',
    bgColor: 'bg-orange-900/50',
    borderColor: 'border-orange-600',
    textColor: 'text-orange-400',
    icon: '😠',
    label: 'Desfavorable',
  },
  neutral: {
    color: 'gray',
    bgColor: 'bg-gray-900/50',
    borderColor: 'border-gray-600',
    textColor: 'text-gray-400',
    icon: '😐',
    label: 'Neutral',
  },
  friendly: {
    color: 'green',
    bgColor: 'bg-green-900/50',
    borderColor: 'border-green-600',
    textColor: 'text-green-400',
    icon: '😊',
    label: 'Amistosa',
  },
  devoted: {
    color: 'purple',
    bgColor: 'bg-purple-900/50',
    borderColor: 'border-purple-600',
    textColor: 'text-purple-400',
    icon: '✨',
    label: 'Devoto',
  },
};

/**
 * Componente de barra de reputación individual por facción
 */
const FactionReputationBar: React.FC<{
  faction: FactionInfo;
  value: number;
  attitude: string;
  benefits?: string[];
  penalties?: string[];
  compact?: boolean;
}> = ({ faction, value, attitude, benefits, penalties, compact = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const attitudeStyle = ATTITUDE_STYLES[attitude as keyof typeof ATTITUDE_STYLES] || ATTITUDE_STYLES.neutral;
  
  // Normalizar valor a 0-1 para la barra (-100 a +100 -> 0 a 1)
  const normalizedValue = (value + 100) / 200;
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Barra de reputación */}
      <div className={`${compact ? 'mb-2' : 'mb-3'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{faction.icon}</span>
            {!compact && (
              <span className="text-white font-bold text-sm">{faction.name}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${attitudeStyle.textColor}`}>
              {attitudeStyle.icon} {attitudeStyle.label}
            </span>
            <span className="text-gray-400 text-xs">({value})</span>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <RPGUIProgress
          value={normalizedValue}
          color={attitudeStyle.color === 'orange' || attitudeStyle.color === 'gray' ? 'blue' : attitudeStyle.color as 'red' | 'green' | 'blue' | 'purple'}
          className="h-3"
        />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className={`
          absolute z-50 ${compact ? 'left-0' : 'left-0'} top-full mt-2
          bg-black/95 border-2 ${attitudeStyle.borderColor}
          rounded-lg p-3 min-w-64 max-w-xs
          shadow-xl
        `}>
          <div className="space-y-2">
            {/* Nombre y descripción */}
            <div>
              <h4 className="text-white font-bold flex items-center gap-2 mb-1">
                {faction.icon} {faction.name}
              </h4>
              <p className="text-gray-300 text-xs">{faction.description}</p>
            </div>

            {/* Valor numérico */}
            <div className="pt-2 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Reputación:</span>
                <span className={`font-bold ${attitudeStyle.textColor}`}>
                  {value} / 100
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-400 text-xs">Actitud:</span>
                <span className={`font-bold ${attitudeStyle.textColor}`}>
                  {attitudeStyle.label}
                </span>
              </div>
            </div>

            {/* Beneficios */}
            {benefits && benefits.length > 0 && (
              <div className="pt-2 border-t border-gray-700">
                <p className="text-green-400 text-xs font-bold mb-1">✓ Beneficios:</p>
                <ul className="text-green-300 text-xs space-y-1">
                  {benefits.map((benefit, i) => (
                    <li key={i}>• {benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Penalizaciones */}
            {penalties && penalties.length > 0 && (
              <div className="pt-2 border-t border-gray-700">
                <p className="text-red-400 text-xs font-bold mb-1">✗ Penalizaciones:</p>
                <ul className="text-red-300 text-xs space-y-1">
                  {penalties.map((penalty, i) => (
                    <li key={i}>• {penalty}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente principal de indicador de reputación
 */
export const ReputationIndicator: React.FC<ReputationIndicatorProps> = ({
  mode = 'full',
  position = 'top-right',
  visible = true,
}) => {
  // Mock data para demostración
  // Mock data para demostración - usar las facciones que existen en el tipo
  const availableFactions = Object.keys(FACTIONS) as FactionId[];
  const mockReputations = availableFactions.slice(0, 2).map((factionId, index) => ({
    faction: FACTIONS[factionId],
    value: index === 0 ? 25 : -15,
    attitude: 'neutral',
    benefits: [],
    penalties: [],
  }));

  if (!visible) {
    return null;
  }

  // Posicionamiento
  const positionClasses = {
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'sidebar': 'relative',
  }[position];

  return (
    <>
      {/* Panel principal */}
      <RPGUIContainer
        frameType={mode === 'full' ? 'framed' : 'framed-grey'}
        className={`
          ${positionClasses}
          ${mode === 'compact' ? 'w-64' : 'w-80'}
          z-30
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
          <span className="text-2xl">⭐</span>
          <h3 className="text-yellow-400 font-bold text-lg">
            {mode === 'full' ? 'Reputación' : 'Rep.'}
          </h3>
        </div>

        {/* Lista de facciones */}
        <div className="space-y-3">
          {mockReputations.length > 0 ? (
            mockReputations.map(({ faction, value, attitude, benefits, penalties }) => (
              <FactionReputationBar
                key={faction.id}
                faction={faction}
                value={value}
                attitude={attitude}
                benefits={benefits}
                penalties={penalties}
                compact={mode === 'compact'}
              />
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              <p>😐</p>
              <p>Sin reputación establecida</p>
            </div>
          )}
        </div>
      </RPGUIContainer>
    </>
  );
};

export default ReputationIndicator;
