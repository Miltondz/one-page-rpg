import React from 'react';
import { RPGUIProgress } from '../../ui';

interface RetroHeaderProps {
  playerName: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  exp: number;
  level: number;
  onBack?: () => void;
}

/**
 * RetroHeader - Header con logo, título y barras de HP/MP/EXP
 * Basado en el header del HTML de referencia
 */
export const RetroHeader: React.FC<RetroHeaderProps> = ({
  playerName,
  hp,
  maxHp,
  mp,
  maxMp,
  exp,
  level,
  onBack,
}) => {
  // Calcular valores normalizados (0-1) para RPGUI
  const hpValue = hp / maxHp;
  const mpValue = mp / maxMp;
  
  // Calcular EXP para siguiente nivel (ejemplo: cada nivel requiere 100 * nivel puntos)
  const expForNextLevel = level * 100;
  const expValue = (exp % expForNextLevel) / expForNextLevel;

  return (
    <header
      style={{
        backgroundColor: '#3a3536',
        borderBottom: '4px solid #554c4d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        whiteSpace: 'nowrap'
      }}
    >
      {/* Logo y título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Logo SVG (triángulo púrpura) */}
        <div style={{ width: '32px', height: '32px', color: '#a855f7' }}>
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z"
              fill="currentColor"
            />
          </svg>
        </div>
        
        <h2 style={{ color: '#e5e0e1', fontSize: '14px', textShadow: '1px 1px 0px #1a1718' }}>
          Retro RPG
        </h2>

        {onBack && (
          <button
            onClick={onBack}
            style={{
              backgroundColor: '#554c4d',
              color: '#e5e0e1',
              marginLeft: '16px',
              padding: '4px 12px',
              fontSize: '10px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ← Menu
          </button>
        )}
      </div>

      {/* Barras de stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '10px' }}>
        {/* HP Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: '#e5e0e1', fontSize: '10px', minWidth: '30px' }}>HP:</label>
          <div style={{ width: '100px' }}>
            <RPGUIProgress value={hpValue} color="red" />
          </div>
        </div>

        {/* MP Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: '#e5e0e1', fontSize: '10px', minWidth: '30px' }}>MP:</label>
          <div style={{ width: '100px' }}>
            <RPGUIProgress value={mpValue} color="blue" />
          </div>
        </div>

        {/* EXP Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: '#e5e0e1', fontSize: '10px', minWidth: '30px' }}>EXP:</label>
          <div style={{ width: '100px' }}>
            <RPGUIProgress value={expValue} color="green" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default RetroHeader;
