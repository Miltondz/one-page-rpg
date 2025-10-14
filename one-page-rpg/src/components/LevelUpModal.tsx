/**
 * Level Up Modal - Modal de Subida de Nivel
 * 
 * Muestra recompensas y permite distribuir puntos de atributo
 */

import React, { useState } from 'react';
import Modal from './Modal';
import type { Player } from '../types/player';
import type { Attributes } from '../types/attributes';
import type { LevelUpReward } from '../systems/ProgressionSystem';
import './LevelUpModal.css';

interface LevelUpModalProps {
  /** Si el modal está visible */
  isOpen: boolean;
  
  /** Nivel alcanzado */
  newLevel: number;
  
  /** Recompensas obtenidas */
  rewards: LevelUpReward;
  
  /** Player actual (para aplicar puntos) */
  player: Player;
  
  /** Callback cuando se cierra el modal */
  onClose: () => void;
  
  /** Callback cuando se aplican los cambios */
  onApply?: (attributesApplied: Partial<Attributes>) => void;
}

/**
 * Modal de level-up con estilo retro
 */
const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  newLevel,
  rewards,
  player,
  onClose,
  onApply,
}) => {
  const [pointsRemaining, setPointsRemaining] = useState(rewards.attributePoints);
  const [tempAttributes, setTempAttributes] = useState<Attributes>({ ...player.attributes });
  const [appliedAttributes, setAppliedAttributes] = useState<Partial<Attributes>>({});

  /**
   * Aplica un punto a un atributo
   */
  const applyPoint = (attribute: keyof Attributes) => {
    if (pointsRemaining <= 0) return;
    if (tempAttributes[attribute] >= 3) return; // Max 3
    
    const newValue = tempAttributes[attribute] + 1;
    
    setTempAttributes(prev => ({
      ...prev,
      [attribute]: newValue,
    }));
    
    setAppliedAttributes(prev => ({
      ...prev,
      [attribute]: (prev[attribute] || player.attributes[attribute]) + 1,
    }));
    
    setPointsRemaining(prev => prev - 1);
  };

  /**
   * Quita un punto de un atributo
   */
  const removePoint = (attribute: keyof Attributes) => {
    // Solo puede quitar puntos que añadió en este level-up
    const currentValue = tempAttributes[attribute];
    const originalValue = player.attributes[attribute];
    
    if (currentValue <= originalValue) return;
    
    setTempAttributes(prev => ({
      ...prev,
      [attribute]: currentValue - 1,
    }));
    
    setAppliedAttributes(prev => {
      const newApplied = { ...prev };
      if (newApplied[attribute]) {
        newApplied[attribute]! -= 1;
        if (newApplied[attribute] === originalValue) {
          delete newApplied[attribute];
        }
      }
      return newApplied;
    });
    
    setPointsRemaining(prev => prev + 1);
  };

  /**
   * Confirma y aplica los cambios
   */
  const handleConfirm = () => {
    // Aplicar puntos de atributo al player
    Object.entries(appliedAttributes).forEach(([attr, value]) => {
      if (value !== undefined) {
        player.attributes[attr as keyof Attributes] = value;
      }
    });
    
    if (onApply) {
      onApply(appliedAttributes);
    }
    
    onClose();
  };

  /**
   * Obtiene el nombre legible del atributo
   */
  const getAttributeName = (attr: keyof Attributes): string => {
    const names: Record<keyof Attributes, string> = {
      FUE: 'FUERZA',
      AGI: 'AGILIDAD',
      SAB: 'SABIDURÍA',
      SUE: 'SUERTE',
    };
    return names[attr];
  };

  /**
   * Obtiene el icono del atributo
   */
  const getAttributeIcon = (attr: keyof Attributes): string => {
    const icons: Record<keyof Attributes, string> = {
      FUE: '⚔️',
      AGI: '⚡',
      SAB: '📖',
      SUE: '🍀',
    };
    return icons[attr];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`¡NIVEL ${newLevel}!`}>
      <div className="level-up-modal">
        {/* Mensaje de felicitaciones */}
        <div className="level-up-message">
          <div className="level-up-title">¡SUBISTE DE NIVEL!</div>
          <div className="level-up-subtitle">Nivel {newLevel} alcanzado</div>
        </div>

        {/* Recompensas automáticas */}
        <div className="rewards-section">
          <div className="section-title">RECOMPENSAS:</div>
          <div className="rewards-list">
            <div className="reward-item">
              <span className="reward-icon">❤️</span>
              <span className="reward-text">Curación completa</span>
            </div>
            <div className="reward-item">
              <span className="reward-icon">💰</span>
              <span className="reward-text">+{rewards.goldBonus} Oro</span>
            </div>
            {rewards.inventorySlots > 0 && (
              <div className="reward-item">
                <span className="reward-icon">🎒</span>
                <span className="reward-text">+{rewards.inventorySlots} Slots de inventario</span>
              </div>
            )}
            {rewards.newItem && (
              <div className="reward-item highlight">
                <span className="reward-icon">✨</span>
                <span className="reward-text">Nuevo item: {rewards.newItem}</span>
              </div>
            )}
          </div>
        </div>

        {/* Selección de atributos */}
        <div className="attributes-section">
          <div className="section-title">
            DISTRIBUIR PUNTOS: {pointsRemaining}/{rewards.attributePoints}
          </div>
          
          <div className="attributes-grid">
            {(Object.keys(player.attributes) as Array<keyof Attributes>).map((attr) => {
              const currentValue = tempAttributes[attr];
              const originalValue = player.attributes[attr];
              const isMaxed = currentValue >= 3;
              const hasChanged = currentValue !== originalValue;
              
              return (
                <div 
                  key={attr} 
                  className={`attribute-row ${isMaxed ? 'maxed' : ''} ${hasChanged ? 'changed' : ''}`}
                >
                  <div className="attribute-info">
                    <span className="attribute-icon">{getAttributeIcon(attr)}</span>
                    <span className="attribute-name">{getAttributeName(attr)}</span>
                  </div>
                  
                  <div className="attribute-controls">
                    <button
                      className="attribute-button"
                      onClick={() => removePoint(attr)}
                      disabled={currentValue <= originalValue}
                      aria-label={`Quitar punto de ${attr}`}
                    >
                      -
                    </button>
                    
                    <div className="attribute-value">
                      {/* Mostrar puntos como bloques */}
                      {[0, 1, 2].map((i) => (
                        <span 
                          key={i} 
                          className={`attribute-dot ${i < currentValue ? 'filled' : 'empty'} ${i < originalValue ? 'original' : i < currentValue ? 'new' : ''}`}
                        >
                          ▪
                        </span>
                      ))}
                      <span className="attribute-number">{currentValue}</span>
                    </div>
                    
                    <button
                      className="attribute-button"
                      onClick={() => applyPoint(attr)}
                      disabled={pointsRemaining <= 0 || isMaxed}
                      aria-label={`Añadir punto a ${attr}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hint si quedan puntos */}
        {pointsRemaining > 0 && (
          <div className="warning-text">
            ⚠️ Tienes {pointsRemaining} punto(s) sin distribuir
          </div>
        )}

        {/* Botón de confirmación */}
        <div className="modal-actions">
          <button
            className="btn-primary"
            onClick={handleConfirm}
            disabled={pointsRemaining > 0}
          >
            {pointsRemaining > 0 ? 'Distribuye todos los puntos' : 'CONTINUAR'}
          </button>
        </div>

        {/* Stats derivados info */}
        <div className="derived-stats-info">
          <div className="info-text">
            💪 Max Heridas: {player.maxWounds}
          </div>
          <div className="info-text">
            ⚡ Max Fatiga: {player.maxFatigue}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LevelUpModal;
