import { useState } from 'react';
import {
  RPGUIContent,
  RPGUIContainer,
  RPGUIButton,
  RPGUIProgress,
  RPGUIIcon,
  RPGUIHR,
} from './ui/RPGUIComponents';

/**
 * Componente principal de la aplicación
 * Ejemplo básico usando RPGUI
 */
function App() {
  const [health, setHealth] = useState(1.0);
  const [mana, setMana] = useState(0.7);

  const takeDamage = () => {
    setHealth((prev) => Math.max(0, prev - 0.2));
  };

  const heal = () => {
    setHealth((prev) => Math.min(1, prev + 0.3));
  };

  const useMana = () => {
    setMana((prev) => Math.max(0, prev - 0.2));
  };

  return (
    <RPGUIContent>
      <RPGUIContainer frameType="framed-golden" style={{ minWidth: '600px' }}>
        <h1>One Page RPG</h1>
        <p>Solo Adventure - Ejemplo con RPGUI</p>

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

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <RPGUIButton onClick={takeDamage}>Take Damage</RPGUIButton>
          <RPGUIButton onClick={heal} golden>
            Heal
          </RPGUIButton>
          <RPGUIButton onClick={useMana}>Use Mana</RPGUIButton>
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
    </RPGUIContent>
  );
}

export default App;
