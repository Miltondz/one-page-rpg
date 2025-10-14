/**
 * Save Game Manager - UI para gestionar slots de guardado
 * 
 * Permite:
 * - Ver lista de saves disponibles
 * - Cargar saves existentes
 * - Guardar en slots específicos
 * - Eliminar saves
 * - Ver información de cada save (fecha, nivel del personaje, etc.)
 */

import React, { useState, useEffect } from 'react';
import { SaveSystem } from '../utils/SaveSystem';
import type { GameState } from '../types';
import { SeededRandom } from '../utils/SeededRandom';

interface SaveSlot {
  slot: string;
  timestamp: number;
  playerName?: string;
  playerLevel?: number;
  playtime?: number;
  isEmpty: boolean;
}

interface SaveGameManagerProps {
  /** Estado actual del juego para guardar */
  currentGameState?: GameState;
  
  /** RNG actual para guardar */
  currentRng?: SeededRandom;
  
  /** Callback cuando se carga un save exitoso */
  onLoadSave?: (gameState: GameState, rng: SeededRandom) => void;
  
  /** Callback cuando se cierra el manager */
  onClose?: () => void;
  
  /** Número de slots disponibles */
  maxSlots?: number;
  
  /** Modo: 'save' (solo guardar) | 'load' (solo cargar) | 'manage' (ambos) */
  mode?: 'save' | 'load' | 'manage';
}

export const SaveGameManager: React.FC<SaveGameManagerProps> = ({
  currentGameState,
  currentRng,
  onLoadSave,
  onClose,
  maxSlots = 10,
  mode = 'manage',
}) => {
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'save' | 'load' | 'delete' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cargar lista de saves
  useEffect(() => {
    loadSaveSlots();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Carga todos los slots de guardado
   */
  const loadSaveSlots = () => {
    const existingSaves = SaveSystem.listSaves();
    const slots: SaveSlot[] = [];

    // Crear array de slots (vacíos y ocupados)
    for (let i = 1; i <= maxSlots; i++) {
      const slotName = `slot_${i}`;
      const existingSave = existingSaves.find(s => s.slot === slotName);

      if (existingSave) {
        // Intentar obtener info del save
        const loadResult = SaveSystem.loadFromLocalStorage(slotName);
        
        slots.push({
          slot: slotName,
          timestamp: existingSave.timestamp,
          playerName: loadResult.success ? loadResult.gameState?.player?.name : undefined,
          playerLevel: loadResult.success ? loadResult.gameState?.player?.level : undefined,
          playtime: loadResult.success ? loadResult.gameState?.world?.playTime : undefined,
          isEmpty: false,
        });
      } else {
        slots.push({
          slot: slotName,
          timestamp: 0,
          isEmpty: true,
        });
      }
    }

    // Añadir slot de autosave al principio si existe
    const autoSave = existingSaves.find(s => s.slot === 'autosave');
    if (autoSave) {
      const loadResult = SaveSystem.loadFromLocalStorage('autosave');
      slots.unshift({
        slot: 'autosave',
        timestamp: autoSave.timestamp,
        playerName: loadResult.success ? loadResult.gameState?.player?.name : undefined,
        playerLevel: loadResult.success ? loadResult.gameState?.player?.level : undefined,
        playtime: loadResult.success ? loadResult.gameState?.world?.playTime : undefined,
        isEmpty: false,
      });
    }

    setSaveSlots(slots);
  };

  /**
   * Maneja el clic en un slot
   */
  const handleSlotClick = (slot: SaveSlot) => {
    setSelectedSlot(slot.slot);
    setMessage(null);
  };

  /**
   * Muestra diálogo de confirmación
   */
  const showConfirm = (action: 'save' | 'load' | 'delete') => {
    if (!selectedSlot) return;
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  /**
   * Guarda en el slot seleccionado
   */
  const handleSave = () => {
    if (!selectedSlot || !currentGameState || !currentRng) {
      setMessage({ type: 'error', text: 'No hay juego activo para guardar' });
      return;
    }

    try {
      const success = SaveSystem.saveToLocalStorage(currentGameState, currentRng, selectedSlot);
      
      if (success) {
        setMessage({ type: 'success', text: `Partida guardada en ${selectedSlot}` });
        loadSaveSlots(); // Recargar lista
      } else {
        setMessage({ type: 'error', text: 'Error al guardar la partida' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error instanceof Error ? error.message : 'Desconocido'}` });
    }

    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  /**
   * Carga el slot seleccionado
   */
  const handleLoad = () => {
    if (!selectedSlot) return;

    try {
      const loadResult = SaveSystem.loadFromLocalStorage(selectedSlot);
      
      if (loadResult.success && loadResult.gameState) {
        // Reconstruir RNG
        const rng = new SeededRandom(loadResult.gameState.world?.seed || `fallback-${Date.now()}`);
        
        setMessage({ type: 'success', text: `Partida cargada desde ${selectedSlot}` });
        
        // Callback con el estado cargado
        if (onLoadSave) {
          onLoadSave(loadResult.gameState, rng);
        }
      } else {
        setMessage({ type: 'error', text: loadResult.error || 'Error al cargar la partida' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error instanceof Error ? error.message : 'Desconocido'}` });
    }

    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  /**
   * Elimina el slot seleccionado
   */
  const handleDelete = () => {
    if (!selectedSlot) return;

    try {
      const success = SaveSystem.deleteSave(selectedSlot);
      
      if (success) {
        setMessage({ type: 'success', text: `Partida eliminada: ${selectedSlot}` });
        setSelectedSlot(null);
        loadSaveSlots(); // Recargar lista
      } else {
        setMessage({ type: 'error', text: 'Error al eliminar la partida' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error instanceof Error ? error.message : 'Desconocido'}` });
    }

    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  /**
   * Formatea el timestamp a fecha legible
   */
  const formatDate = (timestamp: number): string => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Formatea el tiempo de juego
   */
  const formatPlaytime = (minutes?: number): string => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const canSave = mode !== 'load' && currentGameState && currentRng;
  const canLoad = mode !== 'save';
  const canDelete = mode === 'manage';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-4 border-purple-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-purple-800 p-6 border-b-4 border-purple-700">
          <h2 className="text-3xl font-bold text-yellow-300 text-center">
            💾 Gestión de Partidas Guardadas
          </h2>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 ${message.type === 'success' ? 'bg-green-900' : 'bg-red-900'} border-b-2 border-gray-700`}>
            <p className={`text-center font-bold ${message.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Save Slots List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {saveSlots.map((slot) => (
            <div
              key={slot.slot}
              onClick={() => handleSlotClick(slot)}
              className={`p-4 border-2 cursor-pointer transition-all ${
                selectedSlot === slot.slot
                  ? 'border-yellow-400 bg-purple-900'
                  : 'border-gray-600 bg-gray-800 hover:border-purple-500'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Slot Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {slot.slot === 'autosave' ? '🔄' : slot.isEmpty ? '📭' : '💾'}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-yellow-300">
                        {slot.slot === 'autosave' ? 'Autoguardado' : `Slot ${slot.slot.split('_')[1]}`}
                      </h3>
                      {!slot.isEmpty && (
                        <div className="text-sm text-gray-400 space-y-1">
                          <p>
                            <span className="text-purple-400">Personaje:</span> {slot.playerName || 'Desconocido'} 
                            <span className="text-green-400 ml-2">Nv.{slot.playerLevel || '?'}</span>
                          </p>
                          <p>
                            <span className="text-purple-400">Guardado:</span> {formatDate(slot.timestamp)}
                          </p>
                          <p>
                            <span className="text-purple-400">Tiempo jugado:</span> {formatPlaytime(slot.playtime)}
                          </p>
                        </div>
                      )}
                      {slot.isEmpty && (
                        <p className="text-sm text-gray-500">Slot vacío</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Indicator */}
                {selectedSlot === slot.slot && (
                  <div className="text-yellow-400 text-2xl">
                    ✓
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-800 border-t-4 border-purple-700 flex gap-3 justify-center flex-wrap">
          {canSave && (
            <button
              onClick={() => showConfirm('save')}
              disabled={!selectedSlot}
              className={`px-6 py-3 font-bold border-2 transition-all ${
                selectedSlot
                  ? 'bg-green-700 hover:bg-green-600 border-green-900 text-white'
                  : 'bg-gray-700 border-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              💾 Guardar
            </button>
          )}

          {canLoad && (
            <button
              onClick={() => showConfirm('load')}
              disabled={!selectedSlot || saveSlots.find(s => s.slot === selectedSlot)?.isEmpty}
              className={`px-6 py-3 font-bold border-2 transition-all ${
                selectedSlot && !saveSlots.find(s => s.slot === selectedSlot)?.isEmpty
                  ? 'bg-blue-700 hover:bg-blue-600 border-blue-900 text-white'
                  : 'bg-gray-700 border-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              📂 Cargar
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => showConfirm('delete')}
              disabled={!selectedSlot || saveSlots.find(s => s.slot === selectedSlot)?.isEmpty}
              className={`px-6 py-3 font-bold border-2 transition-all ${
                selectedSlot && !saveSlots.find(s => s.slot === selectedSlot)?.isEmpty
                  ? 'bg-red-700 hover:bg-red-600 border-red-900 text-white'
                  : 'bg-gray-700 border-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              🗑️ Eliminar
            </button>
          )}

          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 border-2 border-gray-800 text-white font-bold transition-all"
          >
            ← Cerrar
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-gray-900 border-4 border-yellow-600 p-8 max-w-md">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
              ⚠️ Confirmar Acción
            </h3>
            <p className="text-gray-300 mb-6 text-center">
              {confirmAction === 'save' && `¿Guardar la partida en ${selectedSlot}?`}
              {confirmAction === 'load' && `¿Cargar la partida desde ${selectedSlot}? Se perderá el progreso no guardado.`}
              {confirmAction === 'delete' && `¿Eliminar permanentemente la partida de ${selectedSlot}?`}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  if (confirmAction === 'save') handleSave();
                  if (confirmAction === 'load') handleLoad();
                  if (confirmAction === 'delete') handleDelete();
                }}
                className="px-6 py-3 bg-green-700 hover:bg-green-600 border-2 border-green-900 text-white font-bold"
              >
                ✓ Confirmar
              </button>
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmAction(null);
                }}
                className="px-6 py-3 bg-red-700 hover:bg-red-600 border-2 border-red-900 text-white font-bold"
              >
                ✗ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveGameManager;
