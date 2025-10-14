/**
 * Inventory View - UI de gestión de inventario y equipamiento
 * 
 * Características:
 * - Lista de items en el inventario
 * - Equipar/desequipar items
 * - Usar consumibles
 * - Ver stats de equipo
 * - Filtrar por tipo de item
 * - Organizar inventario
 */

import React, { useState, useMemo } from 'react';
import type { Player, Item, InventoryItem, ItemType } from '../types';

interface InventoryViewProps {
  /** Jugador con su inventario */
  player: Player;
  
  /** Catálogo completo de items */
  itemCatalog: Record<string, Item>;
  
  /** Callback cuando se equipa un item */
  onEquipItem?: (itemId: string) => void;
  
  /** Callback cuando se desequipa un item */
  onUnequipItem?: (itemId: string) => void;
  
  /** Callback cuando se usa un consumible */
  onUseItem?: (itemId: string) => void;
  
  /** Callback cuando se descarta un item */
  onDiscardItem?: (itemId: string) => void;
  
  /** Callback para cerrar el inventario */
  onClose?: () => void;
}

type FilterType = 'ALL' | ItemType;

export const InventoryView: React.FC<InventoryViewProps> = ({
  player,
  itemCatalog,
  onEquipItem,
  onUnequipItem,
  onUseItem,
  onDiscardItem,
  onClose,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);

  /**
   * Obtiene la información completa del inventario
   */
  const inventoryItems = useMemo(() => {
    return player.inventory.map(itemId => {
      const itemDef = itemCatalog[itemId];
      return {
        id: itemId,
        definition: itemDef,
        isEquipped: false, // TODO: Implementar lógica de equipamiento
      };
    }).filter(item => item.definition); // Filtrar items no encontrados
  }, [player.inventory, itemCatalog]);

  /**
   * Items filtrados por tipo
   */
  const filteredItems = useMemo(() => {
    if (filter === 'ALL') return inventoryItems;
    return inventoryItems.filter(item => item.definition?.type === filter);
  }, [inventoryItems, filter]);

  /**
   * Item seleccionado actualmente
   */
  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return inventoryItems.find(item => item.id === selectedItemId);
  }, [selectedItemId, inventoryItems]);

  /**
   * Estadísticas del jugador calculadas con equipo
   */
  const calculatedStats = useMemo(() => {
    // TODO: Calcular bonos de equipo
    return {
      baseStr: player.attributes.strength || 0,
      baseAgi: player.attributes.agility || 0,
      baseInt: player.attributes.intelligence || 0,
      baseLuck: player.attributes.luck || 0,
      bonusStr: 0,
      bonusAgi: 0,
      bonusInt: 0,
      bonusLuck: 0,
    };
  }, [player]);

  /**
   * Maneja el uso de un item
   */
  const handleUseItem = (itemId: string) => {
    if (onUseItem) {
      onUseItem(itemId);
      setSelectedItemId(null);
    }
  };

  /**
   * Maneja equipar/desequipar
   */
  const handleToggleEquip = (itemId: string, isEquipped: boolean) => {
    if (isEquipped && onUnequipItem) {
      onUnequipItem(itemId);
    } else if (!isEquipped && onEquipItem) {
      onEquipItem(itemId);
    }
    setSelectedItemId(null);
  };

  /**
   * Maneja el descarte de un item
   */
  const handleDiscardItem = () => {
    if (selectedItemId && onDiscardItem) {
      onDiscardItem(selectedItemId);
      setSelectedItemId(null);
      setShowConfirmDiscard(false);
    }
  };

  /**
   * Renderiza el icono de rareza
   */
  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'legendary': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  /**
   * Renderiza el icono del tipo de item
   */
  const getItemTypeIcon = (type?: ItemType) => {
    switch (type) {
      case 'WEAPON': return '⚔️';
      case 'ARMOR': return '🛡️';
      case 'CONSUMABLE': return '💊';
      case 'QUEST_ITEM': return '📜';
      case 'MISC': return '📦';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-purple-900 border-4 border-purple-700 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-yellow-300">
              🎒 Inventario de {player.name}
            </h1>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 border-2 border-red-900 font-bold"
              >
                ✗ Cerrar
              </button>
            )}
          </div>
          <div className="mt-2 flex items-center gap-4 text-gray-300">
            <span>💰 Oro: <span className="text-yellow-400 font-bold">{player.gold}</span></span>
            <span>📦 Slots: <span className="text-blue-400 font-bold">{player.inventory.length}/{player.inventorySlots}</span></span>
            <span>⚖️ Peso: <span className="text-green-400 font-bold">{player.inventory.length}</span></span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Columna Izquierda: Estadísticas y Equipo */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="bg-blue-900 border-4 border-blue-700 p-4">
              <h2 className="text-2xl font-bold text-yellow-300 mb-3 text-center">
                📊 Estadísticas
              </h2>
              <div className="space-y-2">
                {[
                  { name: 'Fuerza', icon: '⚔️', base: calculatedStats.baseStr, bonus: calculatedStats.bonusStr },
                  { name: 'Agilidad', icon: '🏃', base: calculatedStats.baseAgi, bonus: calculatedStats.bonusAgi },
                  { name: 'Inteligencia', icon: '📖', base: calculatedStats.baseInt, bonus: calculatedStats.bonusInt },
                  { name: 'Suerte', icon: '🍀', base: calculatedStats.baseLuck, bonus: calculatedStats.bonusLuck },
                ].map(stat => (
                  <div key={stat.name} className="bg-gray-800 p-3 border-2 border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">
                        {stat.icon} {stat.name}
                      </span>
                      <span className="font-bold">
                        <span className="text-white">{stat.base}</span>
                        {stat.bonus > 0 && (
                          <span className="text-green-400"> +{stat.bonus}</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipo Actual */}
            <div className="bg-gray-800 border-4 border-gray-700 p-4">
              <h2 className="text-2xl font-bold text-yellow-300 mb-3 text-center">
                ⚔️ Equipo Actual
              </h2>
              <div className="space-y-2">
                {['Arma', 'Armadura', 'Accesorio'].map(slot => (
                  <div key={slot} className="bg-gray-900 p-3 border-2 border-gray-700">
                    <p className="text-sm text-gray-400">{slot}</p>
                    <p className="text-gray-500 italic">Sin equipar</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Central: Lista de Items */}
          <div className="space-y-4">
            {/* Filtros */}
            <div className="bg-gray-800 border-2 border-gray-700 p-3">
              <div className="flex gap-2 flex-wrap">
                {(['ALL', 'WEAPON', 'ARMOR', 'CONSUMABLE', 'QUEST_ITEM', 'MISC'] as const).map(filterType => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-3 py-2 text-sm font-bold border-2 transition-all ${
                      filter === filterType
                        ? 'bg-purple-700 border-purple-900 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 border-gray-800 text-gray-300'
                    }`}
                  >
                    {filterType === 'ALL' ? '📋 Todo' : getItemTypeIcon(filterType) + ' ' + filterType}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Items */}
            <div className="bg-gray-800 border-4 border-gray-700 p-4 max-h-[600px] overflow-y-auto">
              <h2 className="text-2xl font-bold text-yellow-300 mb-3 text-center">
                📦 Items ({filteredItems.length})
              </h2>
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">📭</p>
                  <p>No hay items en esta categoría</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map(item => {
                    const def = item.definition;
                    if (!def) return null;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`p-3 border-2 cursor-pointer transition-all ${
                          selectedItemId === item.id
                            ? 'border-yellow-400 bg-purple-900'
                            : 'border-gray-600 bg-gray-900 hover:border-purple-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{getItemTypeIcon(def.type)}</span>
                          <div className="flex-1">
                            <h3 className={`font-bold ${getRarityColor(def.rarity)}`}>
                              {def.name}
                              {item.isEquipped && <span className="ml-2 text-green-400">✓ Equipado</span>}
                            </h3>
                            <p className="text-xs text-gray-400">{def.type}</p>
                            <p className="text-sm text-gray-300 mt-1">{def.description}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs">
                              <span className="text-yellow-400">💰 {def.value}g</span>
                              {def.rarity && (
                                <span className={getRarityColor(def.rarity)}>
                                  ✦ {def.rarity}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Detalles del Item Seleccionado */}
          <div className="bg-gray-800 border-4 border-gray-700 p-4">
            <h2 className="text-2xl font-bold text-yellow-300 mb-3 text-center">
              🔍 Detalles
            </h2>
            {selectedItem && selectedItem.definition ? (
              <div className="space-y-4">
                {/* Icono y Nombre */}
                <div className="text-center">
                  <div className="text-6xl mb-2">
                    {getItemTypeIcon(selectedItem.definition.type)}
                  </div>
                  <h3 className={`text-2xl font-bold ${getRarityColor(selectedItem.definition.rarity)}`}>
                    {selectedItem.definition.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{selectedItem.definition.type}</p>
                </div>

                {/* Descripción */}
                <div className="bg-gray-900 p-3 border-2 border-gray-700">
                  <p className="text-gray-300 text-sm">{selectedItem.definition.description}</p>
                </div>

                {/* Propiedades */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Valor:</span>
                    <span className="text-yellow-400 font-bold">{selectedItem.definition.value} oro</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Rareza:</span>
                    <span className={`font-bold ${getRarityColor(selectedItem.definition.rarity)}`}>
                      {selectedItem.definition.rarity || 'common'}
                    </span>
                  </div>
                  {selectedItem.definition.isEquippable && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Estado:</span>
                      <span className={`font-bold ${selectedItem.isEquipped ? 'text-green-400' : 'text-gray-500'}`}>
                        {selectedItem.isEquipped ? '✓ Equipado' : 'Sin equipar'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Mecánicas */}
                {selectedItem.definition.mechanic && (
                  <div className="bg-blue-900 p-3 border-2 border-blue-700">
                    <p className="text-sm text-blue-300 font-bold mb-1">⚡ Efectos:</p>
                    <div className="text-xs text-gray-300 space-y-1">
                      {selectedItem.definition.mechanic.type === 'EQUIPMENT_BONUS' && (
                        <p>
                          +{selectedItem.definition.mechanic.value} a {selectedItem.definition.mechanic.attribute}
                        </p>
                      )}
                      {selectedItem.definition.mechanic.type === 'CONSUMABLE_EFFECT' && (
                        <p>
                          {selectedItem.definition.mechanic.effect}
                          {selectedItem.definition.mechanic.value && ` (${selectedItem.definition.mechanic.value})`}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="space-y-2 pt-3 border-t-2 border-gray-700">
                  {selectedItem.definition.isEquippable && (
                    <button
                      onClick={() => handleToggleEquip(selectedItem.id, selectedItem.isEquipped)}
                      className={`w-full p-3 font-bold border-2 ${
                        selectedItem.isEquipped
                          ? 'bg-red-700 hover:bg-red-600 border-red-900'
                          : 'bg-green-700 hover:bg-green-600 border-green-900'
                      }`}
                    >
                      {selectedItem.isEquipped ? '⬇️ Desequipar' : '⬆️ Equipar'}
                    </button>
                  )}

                  {selectedItem.definition.isConsumable && (
                    <button
                      onClick={() => handleUseItem(selectedItem.id)}
                      className="w-full p-3 bg-blue-700 hover:bg-blue-600 border-2 border-blue-900 font-bold"
                    >
                      💊 Usar
                    </button>
                  )}

                  {!selectedItem.definition.isQuestItem && (
                    <button
                      onClick={() => setShowConfirmDiscard(true)}
                      className="w-full p-3 bg-gray-700 hover:bg-gray-600 border-2 border-gray-800 font-bold text-red-300"
                    >
                      🗑️ Descartar
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-2">👆</p>
                <p>Selecciona un item<br />para ver sus detalles</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDiscard && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-gray-900 border-4 border-red-600 p-8 max-w-md">
            <h3 className="text-2xl font-bold text-red-400 mb-4 text-center">
              ⚠️ Descartar Item
            </h3>
            <p className="text-gray-300 mb-6 text-center">
              ¿Estás seguro de que quieres descartar{' '}
              <span className="text-yellow-400 font-bold">{selectedItem.definition?.name}</span>?
              <br />
              <span className="text-sm text-gray-500">Esta acción no se puede deshacer.</span>
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDiscardItem}
                className="px-6 py-3 bg-red-700 hover:bg-red-600 border-2 border-red-900 text-white font-bold"
              >
                ✓ Descartar
              </button>
              <button
                onClick={() => setShowConfirmDiscard(false)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 border-2 border-gray-800 text-white font-bold"
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

export default InventoryView;
