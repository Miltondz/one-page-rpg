import { useState } from 'react';
import {
  RPGUIContent,
  RPGUIContainer,
  RPGUIButton,
  RPGUIProgress,
  RPGUIIcon,
  RPGUIHR,
} from './ui/RPGUIComponents';
import DiceOutcomeDisplay from './components/DiceOutcomeDisplay';
import ReputationIndicator from './components/ReputationIndicator';
import DialogueView from './components/DialogueView';
import { DiceSystem } from './utils/DiceSystem';
import { ReputationSystem } from './systems/ReputationSystem';
import { NPCMemorySystem } from './systems/NPCMemorySystem';
import type { NPC } from './types';
import type { RollResult } from './utils/DiceSystem';

/**
 * Componente principal de la aplicación
 * Ejemplo básico usando RPGUI con componentes visuales integrados
 */
function App() {
  const [health, setHealth] = useState(1.0);
  const [mana, setMana] = useState(0.7);

  // Sistemas del juego
  const [diceSystem] = useState(() => {
    // Mock RNG simple para demostración
    const mockRng: any = {
      nextInt: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
      roll2d6: () => {
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        return { die1, die2, total: die1 + die2 };
      },
      pick: <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)],
    };
    return new DiceSystem(mockRng);
  });
  const [reputationSystem] = useState(() => new ReputationSystem());
  const [memorySystem] = useState(() => new NPCMemorySystem());

  // Estados UI
  const [showDiceRoll, setShowDiceRoll] = useState(false);
  const [diceResult, setDiceResult] = useState<RollResult | null>(null);
  const [showDialogue, setShowDialogue] = useState(false);
  const [currentNPC, setCurrentNPC] = useState<NPC | null>(null);

  const takeDamage = () => {
    setHealth((prev) => Math.max(0, prev - 0.2));
  };

  const heal = () => {
    setHealth((prev) => Math.min(1, prev + 0.3));
  };

  const useMana = () => {
    setMana((prev) => Math.max(0, prev - 0.2));
  };

  // Función para tirar dados
  const rollDice = (modifier: number = 0) => {
    const result = diceSystem.roll(modifier, 'normal');
    setDiceResult(result);
    setShowDiceRoll(true);
  };

  // Función para abrir diálogo con NPC
  const talkToNPC = () => {
    const exampleNPC: NPC = {
      id: 'npc-merchant',
      name: 'Elara the Merchant',
      role: 'Trader',
      personality: ['friendly', 'greedy', 'talkative'],
      faction: 'merchants_guild',
      archetype: 'merchant',
      race: 'Human',
      relationship: 0,
      location: 'town_square',
      mood: 'friendly',
      knowledge: ['trade', 'rumors'],
      questsGiven: [],
      interactions: [],
      isAlive: true,
      isMet: false,
    };
    setCurrentNPC(exampleNPC);
    setShowDialogue(true);
  };

  // Función para cambiar reputación (placeholder visual)
  const modifyReputation = (_faction: string, _amount: number) => {
    // El sistema de reputación requiere integración completa con GameState
    // Por ahora solo forzamos re-render
    setHealth((prev) => prev);
  };

  return (
    <RPGUIContent>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Panel principal */}
        <RPGUIContainer frameType="framed-golden" style={{ minWidth: '600px', flex: 1 }}>
          <h1>One Page RPG</h1>
          <p>Solo Adventure - Demo con Componentes Visuales</p>

          <RPGUIHR golden />

          <h3>Character Stats</h3>

          <div style={{ margin: '20px 0' }}>
            <label>Health:</label>
            <RPGUIProgress value={health} color="red" />

            <label style={{ marginTop: '10px', display: 'block' }}>Mana:</label>
            <RPGUIProgress value={mana} color="blue" />
          </div>

          <RPGUIHR />

          <h3>Actions</h3>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <RPGUIButton onClick={takeDamage}>Take Damage</RPGUIButton>
            <RPGUIButton onClick={heal} golden>
              Heal
            </RPGUIButton>
            <RPGUIButton onClick={useMana}>Use Mana</RPGUIButton>
          </div>

          <RPGUIHR golden />

          <h3>🎲 Dice Rolling System</h3>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <RPGUIButton onClick={() => rollDice(0)}>Roll 2d6</RPGUIButton>
            <RPGUIButton onClick={() => rollDice(1)}>Roll 2d6 +1</RPGUIButton>
            <RPGUIButton onClick={() => rollDice(2)} golden>
              Roll 2d6 +2
            </RPGUIButton>
            <RPGUIButton onClick={() => rollDice(-1)}>Roll 2d6 -1</RPGUIButton>
          </div>

          <RPGUIHR />

          <h3>💬 NPC Interactions</h3>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <RPGUIButton onClick={talkToNPC} golden>
              Talk to Merchant
            </RPGUIButton>
          </div>

          <RPGUIHR />

          <h3>🎖️ Reputation Management</h3>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <RPGUIButton onClick={() => modifyReputation('merchants_guild', 10)}>
              Help Merchants (+10)
            </RPGUIButton>
            <RPGUIButton onClick={() => modifyReputation('merchants_guild', -10)}>
              Steal (-10)
            </RPGUIButton>
            <RPGUIButton onClick={() => modifyReputation('thieves_guild', 15)}>
              Help Thieves (+15)
            </RPGUIButton>
            <RPGUIButton onClick={() => modifyReputation('city_guard', 20)} golden>
              Help Guards (+20)
            </RPGUIButton>
          </div>

          <RPGUIHR golden />

          <h3>Inventory</h3>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <RPGUIIcon icon="sword" />
            <RPGUIIcon icon="shield" />
            <RPGUIIcon icon="potion-red" />
            <RPGUIIcon icon="potion-blue" />
            <RPGUIIcon icon="empty-slot" />
            <RPGUIIcon icon="empty-slot" />
          </div>
        </RPGUIContainer>

        {/* Panel de reputación */}
        <div style={{ minWidth: '300px' }}>
          <ReputationIndicator
            reputationSystem={reputationSystem}
            mode="full"
            position="top-right"
          />
        </div>
      </div>

      {/* Componente de dados - Siempre visible */}
      <DiceOutcomeDisplay
        result={diceResult}
        isVisible={showDiceRoll}
        onClose={() => setShowDiceRoll(false)}
        mode="persistent"
        position="top-right"
      />

      {/* Diálogo con NPC */}
      {currentNPC && (
        <DialogueView
          npc={currentNPC}
          memorySystem={memorySystem}
          sceneContext="A bustling marketplace in the town square"
          isActive={showDialogue}
          onSelectOption={(option, npc) => {
            console.log(`Player selected: ${option} with ${npc.name}`);
          }}
          onClose={() => {
            setShowDialogue(false);
            setCurrentNPC(null);
          }}
          mode="modal"
        />
      )}
    </RPGUIContent>
  );
}

export default App;
