/**
 * DialogueView - Vista de diálogos interactivos con NPCs
 * 
 * Sistema completo de diálogo con:
 * - Visualización del NPC con portrait y emoción
 * - Texto de diálogo con animación de escritura
 * - Opciones de respuesta del jugador
 * - Historial de conversación
 * - Integración con NPCDialogueGenerator y NPCMemorySystem
 */

import React, { useState, useEffect, useRef } from 'react';
import type { NPC } from '../types';
import { RPGUIContainer, RPGUIButton } from '../ui';
import type { GeneratedDialogue } from '../systems/NPCDialogueGenerator';
import { NPCMemorySystem } from '../systems/NPCMemorySystem';

interface DialogueViewProps {
  /** NPC con quien se dialoga */
  npc: NPC;
  
  
  /** Sistema de memoria de NPCs */
  memorySystem?: NPCMemorySystem;
  
  /** Contexto de la escena actual */
  sceneContext?: string;
  
  /** Si el diálogo está activo */
  isActive: boolean;
  
  /** Callback al seleccionar una opción de diálogo */
  onSelectOption?: (option: string, npc: NPC) => void;
  
  /** Callback al cerrar el diálogo */
  onClose: () => void;
  
  /** Modo de visualización */
  mode?: 'fullscreen' | 'modal' | 'bottom-panel';
}

interface DialogueEntry {
  speaker: 'npc' | 'player';
  text: string;
  emotion?: string;
  timestamp: number;
}

/**
 * Emociones de NPC con sus estilos visuales
 */
const EMOTION_STYLES = {
  neutral: {
    icon: '😐',
    color: 'text-gray-400',
    borderColor: 'border-gray-500',
    bgGradient: 'from-gray-700 to-gray-800',
  },
  happy: {
    icon: '😊',
    color: 'text-green-400',
    borderColor: 'border-green-500',
    bgGradient: 'from-green-700 to-green-800',
  },
  angry: {
    icon: '😠',
    color: 'text-red-400',
    borderColor: 'border-red-500',
    bgGradient: 'from-red-700 to-red-800',
  },
  sad: {
    icon: '😢',
    color: 'text-blue-400',
    borderColor: 'border-blue-500',
    bgGradient: 'from-blue-700 to-blue-800',
  },
  curious: {
    icon: '🤔',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500',
    bgGradient: 'from-yellow-700 to-yellow-800',
  },
  amused: {
    icon: '😏',
    color: 'text-purple-400',
    borderColor: 'border-purple-500',
    bgGradient: 'from-purple-700 to-purple-800',
  },
  mysterious: {
    icon: '🌑',
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500',
    bgGradient: 'from-indigo-700 to-indigo-800',
  },
  desperate: {
    icon: '😰',
    color: 'text-orange-400',
    borderColor: 'border-orange-500',
    bgGradient: 'from-orange-700 to-orange-800',
  },
};

/**
 * Componente de texto con animación typewriter
 */
const TypewriterText: React.FC<{
  text: string;
  speed?: number;
  onComplete?: () => void;
}> = ({ text, speed = 30, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <p className="text-white text-base leading-relaxed">
      {displayedText}
      {!isComplete && <span className="animate-pulse">▋</span>}
    </p>
  );
};

/**
 * Retrato del NPC con emoción
 */
const NPCPortrait: React.FC<{
  npc: NPC;
  emotion: string;
}> = ({ npc, emotion }) => {
  const emotionStyle = EMOTION_STYLES[emotion as keyof typeof EMOTION_STYLES] || EMOTION_STYLES.neutral;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Portrait placeholder - puede reemplazarse con imagen real */}
      <div
        className={`
          w-24 h-24 rounded-full flex items-center justify-center
          text-5xl border-4 ${emotionStyle.borderColor}
          bg-gradient-to-br ${emotionStyle.bgGradient}
          shadow-xl relative overflow-hidden
        `}
      >
        {/* Icon del NPC (puede ser emoji o iniciales) */}
        <span className="relative z-10">
          {npc.name.charAt(0)}
        </span>
        
        {/* Glow effect */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle, ${emotionStyle.color} 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Nombre y emoción */}
      <div className="text-center">
        <p className="text-white font-bold">{npc.name}</p>
        <p className={`text-xs ${emotionStyle.color} flex items-center gap-1 justify-center`}>
          <span>{emotionStyle.icon}</span>
          <span>{emotion}</span>
        </p>
      </div>

      {/* Rol/Título */}
      {npc.role && (
        <p className="text-gray-400 text-xs italic">
          {npc.role}
        </p>
      )}
    </div>
  );
};

/**
 * Componente principal de DialogueView
 */
export const DialogueView: React.FC<DialogueViewProps> = ({
  npc,
  memorySystem,
  isActive,
  onSelectOption,
  onClose,
  mode = 'modal',
}) => {
  const [currentDialogue, setCurrentDialogue] = useState<GeneratedDialogue | null>(null);
  const [dialogueHistory, setDialogueHistory] = useState<DialogueEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const historyEndRef = useRef<HTMLDivElement>(null);

  // Generar diálogo inicial al abrir
  useEffect(() => {
    if (isActive && !currentDialogue) {
      generateInitialDialogue();
    }
  }, [isActive]);

  // Auto-scroll al final del historial
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogueHistory]);

  /**
   * Genera el diálogo inicial del NPC
   */
  const generateInitialDialogue = async () => {
    // Fallback básico para demostración
    setCurrentDialogue({
      text: `${npc.name}: "Greetings, traveler. What brings you here?"`,
      emotion: 'neutral',
      suggestedResponses: [
        'Hello, I\'m just passing through',
        'What do you sell?',
        'Tell me about this place',
        '[Leave]'
      ],
    });
    
    // Agregar al historial
    setDialogueHistory([{
      speaker: 'npc',
      text: `${npc.name}: "Greetings, traveler. What brings you here?"`,
      emotion: 'neutral',
      timestamp: Date.now(),
    }]);
  };

  /**
   * Maneja la selección de una opción de respuesta
   */
  const handleSelectOption = async (option: string) => {
    // Agregar respuesta del jugador al historial
    setDialogueHistory(prev => [...prev, {
      speaker: 'player',
      text: option,
      timestamp: Date.now(),
    }]);

    // Si es una acción especial (como Leave), cerrar
    if (option === '[Leave]' || option.includes('[Attack]')) {
      if (onSelectOption) {
        onSelectOption(option, npc);
      }
      onClose();
      return;
    }

    // Simular respuesta del NPC (para demostración)
    setIsGenerating(true);
    setShowOptions(false);

    setTimeout(() => {
      const responses = [
        "Interesting... tell me more.",
        "I see. That's quite a story.",
        "Hmm, I hadn't thought of that.",
        "Yes, yes... go on.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const dialogue: GeneratedDialogue = {
        text: `${npc.name}: "${randomResponse}"`,
        emotion: 'neutral',
        suggestedResponses: [
          'Continue talking',
          'Ask about inventory',
          '[Leave]'
        ],
      };

      setCurrentDialogue(dialogue);
      
      // Agregar respuesta del NPC al historial
      setDialogueHistory(prev => [...prev, {
        speaker: 'npc',
        text: dialogue.text,
        emotion: dialogue.emotion,
        timestamp: Date.now(),
      }]);

      // Actualizar memoria
      if (memorySystem) {
        memorySystem.recordInteraction({
          timestamp: Date.now(),
          npcId: npc.id,
          type: 'dialogue',
          summary: `Conversed about: ${option}`,
          playerChoice: option,
          outcome: 'neutral',
          emotionalImpact: 0,
          context: randomResponse,
        });
      }
      
      setIsGenerating(false);
    }, 1000);

    // Callback externo
    if (onSelectOption) {
      onSelectOption(option, npc);
    }
  };

  if (!isActive) {
    return null;
  }

  const emotionStyle = currentDialogue
    ? EMOTION_STYLES[currentDialogue.emotion as keyof typeof EMOTION_STYLES] || EMOTION_STYLES.neutral
    : EMOTION_STYLES.neutral;

  // Wrapper según el modo
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (mode === 'fullscreen') {
      return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          {children}
        </div>
      );
    }
    if (mode === 'bottom-panel') {
      return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          {children}
        </div>
      );
    }
    // modal
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        {children}
      </div>
    );
  };

  return (
    <Wrapper>
      <RPGUIContainer
        frameType="framed-golden"
        className={`
          ${mode === 'fullscreen' ? 'w-full max-w-4xl h-[90vh]' : ''}
          ${mode === 'modal' ? 'w-full max-w-3xl max-h-[80vh]' : ''}
          ${mode === 'bottom-panel' ? 'w-full' : ''}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💬</span>
            <h2 className="text-yellow-400 font-bold text-2xl">Diálogo</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 text-2xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* NPC Portrait (izquierda) */}
          <div className="flex-shrink-0">
            <NPCPortrait
              npc={npc}
              emotion={currentDialogue?.emotion || 'neutral'}
            />
          </div>

          {/* Dialogue area (derecha) */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Historial de diálogo */}
            <div className="flex-1 bg-black/40 rounded-lg p-4 mb-4 overflow-y-auto max-h-64">
              <div className="space-y-3">
                {dialogueHistory.map((entry, index) => (
                  <div
                    key={index}
                    className={`
                      ${entry.speaker === 'npc' ? 'text-left' : 'text-right'}
                    `}
                  >
                    <div
                      className={`
                        inline-block max-w-[80%] p-3 rounded-lg
                        ${entry.speaker === 'npc'
                          ? `bg-gradient-to-r ${emotionStyle.bgGradient} border-l-4 ${emotionStyle.borderColor}`
                          : 'bg-blue-900/50 border-r-4 border-blue-500'
                        }
                      `}
                    >
                      <p className={`text-xs ${entry.speaker === 'npc' ? 'text-gray-400' : 'text-blue-400'} mb-1`}>
                        {entry.speaker === 'npc' ? npc.name : 'Tú'}
                      </p>
                      <p className="text-white text-sm">{entry.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={historyEndRef} />
              </div>
            </div>

            {/* Diálogo actual */}
            {currentDialogue && !isGenerating && (
              <div className={`bg-gradient-to-r ${emotionStyle.bgGradient} rounded-lg p-4 mb-4 border-2 ${emotionStyle.borderColor}`}>
                <TypewriterText
                  text={currentDialogue.text}
                  speed={20}
                  onComplete={() => setShowOptions(true)}
                />
              </div>
            )}

            {/* Loading indicator */}
            {isGenerating && (
              <div className="bg-gray-900/50 rounded-lg p-4 mb-4 flex items-center gap-3">
                <div className="animate-spin text-2xl">⏳</div>
                <p className="text-gray-400 italic">
                  {npc.name} está pensando...
                </p>
              </div>
            )}

            {/* Opciones de respuesta */}
            {showOptions && currentDialogue?.suggestedResponses && !isGenerating && (
              <div className="space-y-2">
                <p className="text-gray-400 text-sm mb-2">¿Qué respondes?</p>
                <div className="grid grid-cols-1 gap-2">
                  {currentDialogue.suggestedResponses.map((option, index) => (
                    <RPGUIButton
                      key={index}
                      onClick={() => handleSelectOption(option)}
                      golden={option.includes('[Leave]')}
                      className="text-left"
                    >
                      {option}
                    </RPGUIButton>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con información contextual */}
        {memorySystem && (
          <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-500">
            <p>
              💭 {memorySystem.getMemory(npc.id)
                ? `Has hablado con ${npc.name} antes (${memorySystem.getMemory(npc.id)?.interactions.length || 0} veces)`
                : `Primera vez que hablas con ${npc.name}`
              }
            </p>
          </div>
        )}
      </RPGUIContainer>
    </Wrapper>
  );
};

export default DialogueView;
