/**
 * Quest Debug Panel - Componente de prueba para el sistema de quests
 * 
 * Panel de debug que permite probar todas las funcionalidades del QuestManager
 * integrado en el GameContext
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export const QuestDebugPanel: React.FC = () => {
  const {
    questManager,
    playerState,
    getActiveQuests,
    completeQuestObjective,
    progressQuestObjective,
    generateProceduralQuest,
    activateQuest,
    getQuestProgress,
    gainExperience,
    saveGame,
    loadGame,
    getSaveSlots,
    hasSavedGame,
  } = useGame();

  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);

  if (!questManager || !playerState) {
    return (
      <div className="bg-red-900/50 border-2 border-red-500 p-4 text-white">
        ⚠️ Quest Manager no inicializado
      </div>
    );
  }

  const activeQuests = getActiveQuests();

  const handleGenerateQuest = () => {
    const quest = generateProceduralQuest(playerState.level);
    activateQuest(quest.id);
  };

  const handleCompleteObjective = (questId: string, objectiveId: string) => {
    completeQuestObjective(questId, objectiveId);
  };

  const handleProgressObjective = (questId: string, objectiveId: string) => {
    progressQuestObjective(questId, objectiveId, 1);
  };

  const handleTestXP = () => {
    gainExperience(1);
  };

  const handleSaveGame = () => {
    const success = saveGame('manual-save');
    if (success) {
      alert('✅ Juego guardado exitosamente!');
    } else {
      alert('❌ Error al guardar el juego');
    }
  };

  const handleLoadGame = () => {
    const saves = getSaveSlots();
    if (saves.length === 0) {
      alert('⚠️ No hay guardados disponibles');
      return;
    }
    
    const slot = saves[0].slot;
    const success = loadGame(slot);
    if (success) {
      alert('✅ Juego cargado exitosamente!');
      // Recargar la página para refrescar el estado
      window.location.reload();
    } else {
      alert('❌ Error al cargar el juego');
    }
  };

  return (
    <div className="bg-gray-900 border-2 border-purple-500 p-6 text-white space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b-2 border-purple-500 pb-4">
        <h2 className="text-2xl font-bold text-purple-400">
          🎯 Quest Debug Panel
        </h2>
        <p className="text-gray-400 text-sm mt-2">
          Panel de prueba del sistema de quests integrado
        </p>
      </div>

      {/* Player Info */}
      <div className="bg-gray-800/50 p-4 border border-gray-700">
        <h3 className="text-yellow-400 font-bold mb-2">👤 Jugador</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Nombre:</span>
            <span className="ml-2 text-white">{playerState.name}</span>
          </div>
          <div>
            <span className="text-gray-400">Nivel:</span>
            <span className="ml-2 text-white">{playerState.level}</span>
          </div>
          <div>
            <span className="text-gray-400">XP:</span>
            <span className="ml-2 text-white">
              {playerState.experience} / {playerState.experienceToNextLevel}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Oro:</span>
            <span className="ml-2 text-yellow-400">{playerState.gold}</span>
          </div>
        </div>
        <button
          onClick={handleTestXP}
          className="mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          ⭐ +1 XP (Test)
        </button>
      </div>

      {/* Actions */}
      <div className="bg-gray-800/50 p-4 border border-gray-700">
        <h3 className="text-green-400 font-bold mb-3">⚡ Acciones</h3>
        <div className="space-y-2">
          <button
            onClick={handleGenerateQuest}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold"
          >
            🎲 Generar Quest Procedural
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSaveGame}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              💾 Guardar
            </button>
            <button
              onClick={handleLoadGame}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold"
              disabled={!hasSavedGame()}
            >
              📂 Cargar
            </button>
          </div>
        </div>
      </div>

      {/* Active Quests */}
      <div className="bg-gray-800/50 p-4 border border-gray-700">
        <h3 className="text-purple-400 font-bold mb-3">
          📋 Quests Activas ({activeQuests.length})
        </h3>

        {activeQuests.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay quests activas</p>
        ) : (
          <div className="space-y-3">
            {activeQuests.map((quest) => {
              const progress = getQuestProgress(quest.id);
              const isExpanded = expandedQuestId === quest.id;
              const objectives = questManager.getQuestObjectives(quest.id);

              return (
                <div
                  key={quest.id}
                  className="bg-gray-900/50 border border-gray-700 p-3"
                >
                  {/* Quest Header */}
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedQuestId(isExpanded ? null : quest.id)
                    }
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {quest.type === 'main_quest' ? '⭐' : '📌'}
                        </span>
                        <h4 className="text-white font-bold">{quest.title}</h4>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">
                        {quest.giver} • {quest.startingLocation}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">
                        {progress}%
                      </div>
                      <div className="text-gray-500 text-xs">
                        {isExpanded ? '▲' : '▼'}
                      </div>
                    </div>
                  </div>

                  {/* Quest Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-700 space-y-3">
                      <p className="text-gray-300 text-sm">
                        {quest.description}
                      </p>

                      {/* Objectives */}
                      <div className="space-y-2">
                        {objectives.map((obj) => (
                          <div
                            key={obj.id}
                            className="bg-gray-800/50 p-2 border border-gray-700"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span>
                                    {obj.completed ? '✅' : '⬜'}
                                  </span>
                                  <span
                                    className={
                                      obj.completed
                                        ? 'text-green-400 line-through'
                                        : 'text-white'
                                    }
                                  >
                                    {obj.description}
                                  </span>
                                  {!obj.required && (
                                    <span className="text-xs text-gray-500">
                                      [OPCIONAL]
                                    </span>
                                  )}
                                </div>

                                {/* Progress bar for countable objectives */}
                                {obj.count !== undefined && (
                                  <div className="mt-2">
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                      <span>
                                        {obj.currentCount} / {obj.count}
                                      </span>
                                      <div className="flex-1 h-2 bg-gray-700 rounded">
                                        <div
                                          className="h-full bg-green-500 rounded"
                                          style={{
                                            width: `${
                                              ((obj.currentCount || 0) /
                                                obj.count) *
                                              100
                                            }%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Rewards */}
                                {(obj.rewards.xp || obj.rewards.gold) && (
                                  <div className="mt-1 text-xs text-gray-500">
                                    Recompensa:{' '}
                                    {obj.rewards.xp && `${obj.rewards.xp} XP`}
                                    {obj.rewards.xp && obj.rewards.gold && ', '}
                                    {obj.rewards.gold &&
                                      `${obj.rewards.gold} oro`}
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              {!obj.completed && (
                                <div className="flex gap-1 ml-2">
                                  {obj.count !== undefined ? (
                                    <button
                                      onClick={() =>
                                        handleProgressObjective(
                                          quest.id,
                                          obj.id
                                        )
                                      }
                                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                      title="Progresar +1"
                                    >
                                      +1
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleCompleteObjective(
                                          quest.id,
                                          obj.id
                                        )
                                      }
                                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                                    >
                                      ✓
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Quest Rewards */}
                      <div className="bg-yellow-900/20 border border-yellow-700 p-2">
                        <div className="text-yellow-400 text-sm font-bold mb-1">
                          🎁 Recompensas Finales:
                        </div>
                        <div className="text-gray-300 text-xs">
                          {quest.rewards.xp} XP • {quest.rewards.gold} oro
                          {quest.rewards.items &&
                            quest.rewards.items.length > 0 &&
                            ` • ${quest.rewards.items.join(', ')}`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-gray-800/50 p-4 border border-gray-700">
        <h3 className="text-blue-400 font-bold mb-2">📊 Estadísticas</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Campaign Quests</div>
            <div className="text-white text-xl font-bold">
              {questManager.getActiveCampaignQuests().length}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Procedural Quests</div>
            <div className="text-white text-xl font-bold">
              {questManager.getActiveProceduralQuests().length}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Completed</div>
            <div className="text-white text-xl font-bold">
              {questManager.getCompletedQuests().length}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-700 p-3 text-xs text-gray-400">
        <strong className="text-blue-400">💡 Instrucciones:</strong>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Genera quests procedurales con el botón 🎲</li>
          <li>Haz click en una quest para ver sus objetivos</li>
          <li>Usa los botones +1 o ✓ para completar objetivos</li>
          <li>Las recompensas se aplican automáticamente</li>
          <li>El progreso se actualiza en tiempo real</li>
        </ul>
      </div>
    </div>
  );
};

export default QuestDebugPanel;
