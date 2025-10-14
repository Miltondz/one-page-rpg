import React, { useState } from 'react';
import { RPGUIContainer, RPGUIButton, RPGUIInput } from '../ui';
import type { PlayerAttributes } from '../types';

interface CharacterCreationProps {
  onComplete: (name: string, attributes: PlayerAttributes) => void;
  onBack?: () => void;
}

/**
 * Pantalla de creación de personaje
 * Sistema de puntos para distribuir atributos
 */
export const CharacterCreation: React.FC<CharacterCreationProps> = ({
  onComplete,
  onBack,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [attributes, setAttributes] = useState<PlayerAttributes>({
    FUE: 0,
    AGI: 0,
    SAB: 0,
    SUE: 0,
  });

  const totalPoints = 6; // Total de puntos para distribuir
  const usedPoints = Object.values(attributes).reduce((sum, val) => sum + val, 0);
  const remainingPoints = totalPoints - usedPoints;

  const attributeDescriptions = {
    FUE: {
      name: 'Fuerza',
      icon: '💪',
      desc: 'Combate cuerpo a cuerpo, fuerza bruta, resistencia física',
    },
    AGI: {
      name: 'Agilidad',
      icon: '🏃',
      desc: 'Combate a distancia, sigilo, reflejos, esquivar',
    },
    SAB: {
      name: 'Sabiduría',
      icon: '📚',
      desc: 'Magia, conocimiento arcano, percepción, persuasión',
    },
    SUE: {
      name: 'Suerte',
      icon: '🍀',
      desc: 'Eventos aleatorios, golpes críticos, esquivar el destino',
    },
  };

  const increaseAttribute = (attr: keyof PlayerAttributes) => {
    if (remainingPoints > 0 && attributes[attr] < 5) {
      setAttributes({ ...attributes, [attr]: attributes[attr] + 1 });
    }
  };

  const decreaseAttribute = (attr: keyof PlayerAttributes) => {
    if (attributes[attr] > 0) {
      setAttributes({ ...attributes, [attr]: attributes[attr] - 1 });
    }
  };

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2 && remainingPoints === 0) {
      onComplete(name, attributes);
    }
  };

  const canProceed = step === 1 ? name.trim().length > 0 : remainingPoints === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-purple-400 text-3xl font-bold mb-2 text-shadow">
            {step === 1 ? '🎭 Tu Personaje' : '⚡ Atributos'}
          </h1>
          <p className="text-gray-400 text-sm">
            {step === 1
              ? 'Todo aventurero necesita un nombre...'
              : `Distribuye ${totalPoints} puntos entre tus atributos`}
          </p>
        </div>

        <RPGUIContainer frameType="framed-golden">
          {/* STEP 1: Nombre */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">🗡️</div>
                <p className="text-gray-300 text-sm">
                  Eres un <span className="text-yellow-400">Aventurero</span>,
                  marcado por el destino.
                  <br />
                  En el mundo de Griswald, tu nombre es tu identidad.
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <label className="block">
                  <span className="text-gray-300 text-sm mb-2 block">
                    Nombre del Personaje:
                  </span>
                  <RPGUIInput
                    value={name}
                    onChange={(value) => setName(value)}
                    placeholder="Escribe tu nombre..."
                  />
                </label>

                <div className="bg-black/30 p-4 border-2 border-gray-700 space-y-2">
                  <p className="text-yellow-400 text-xs font-bold">💡 Consejo:</p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Elige un nombre que refleje tu espíritu aventurero. En Griswald,
                    los nombres tienen poder y pueden determinar tu destino.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Atributos */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Points remaining */}
              <div className="text-center bg-black/40 p-4 border-2 border-purple-600">
                <p className="text-gray-300 text-sm mb-1">Puntos Restantes</p>
                <p className="text-yellow-400 text-4xl font-bold">
                  {remainingPoints}
                </p>
              </div>

              {/* Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(attributeDescriptions) as Array<keyof PlayerAttributes>).map((attr) => {
                  const info = attributeDescriptions[attr];
                  return (
                    <div
                      key={attr}
                      className="bg-black/30 p-4 border-2 border-gray-700 hover:border-purple-600 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{info.icon}</span>
                          <div>
                            <p className="text-yellow-400 font-bold">{attr}</p>
                            <p className="text-gray-500 text-xs">{info.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decreaseAttribute(attr)}
                            disabled={attributes[attr] === 0}
                            className="w-8 h-8 bg-red-900/50 hover:bg-red-900 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-red-700 text-white font-bold transition-colors"
                          >
                            −
                          </button>
                          <span className="text-2xl font-bold text-purple-400 w-8 text-center">
                            {attributes[attr]}
                          </span>
                          <button
                            onClick={() => increaseAttribute(attr)}
                            disabled={remainingPoints === 0 || attributes[attr] >= 5}
                            className="w-8 h-8 bg-green-900/50 hover:bg-green-900 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-green-700 text-white font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed">
                        {info.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Info box */}
              <div className="bg-black/30 p-4 border-2 border-gray-700 space-y-2">
                <p className="text-yellow-400 text-xs font-bold">📊 Sistema 2d6:</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Cuando enfrentes un desafío, tiraras 2d6 + tu atributo relevante.
                  • 2-6: Fallo • 7-9: Éxito con consecuencias • 10-11: Éxito limpio • 12: Crítico
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 mt-6 pt-6 border-t-2 border-gray-700">
            {step === 2 && (
              <RPGUIButton onClick={() => setStep(1)}>
                ← Atrás
              </RPGUIButton>
            )}
            {step === 1 && onBack && (
              <RPGUIButton onClick={onBack}>
                ← Menu
              </RPGUIButton>
            )}
            <RPGUIButton
              onClick={handleNext}
              golden
              disabled={!canProceed}
              className="ml-auto"
            >
              {step === 1 ? 'Siguiente →' : 'Comenzar Aventura ⚔️'}
            </RPGUIButton>
          </div>
        </RPGUIContainer>

        {/* Character summary (step 2) */}
        {step === 2 && (
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-xs">
              Personaje: <span className="text-purple-400">{name}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterCreation;
