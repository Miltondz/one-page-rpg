/**
 * Barrel export para todos los componentes de UI del juego
 */

export { Modal, ConfirmModal } from './Modal';
export { SplashScreen } from './SplashScreen';
export { CharacterCreation } from './CharacterCreation';
export { MainMenu } from './MainMenu';
export { CombatScreen } from './CombatScreen';
export { GameScreen } from './GameScreen';
export { QuestDebugPanel } from './QuestDebugPanel';

// Nuevos componentes implementados
export { default as SaveGameManager } from './SaveGameManager';
export { default as CombatView } from './CombatView';
export { default as InventoryView } from './InventoryView';

// Placeholder exports para componentes futuros
// export { OptionsScreen } from './OptionsScreen';
