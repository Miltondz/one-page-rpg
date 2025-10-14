import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Importar index.css y retro.css DESPUÉS para no sobrescribir RPGUI
import './index.css';
import './styles/retro.css';
import App from './App.tsx';
import { getPromptService } from './services/PromptConfigService';

// Inicializar el servicio de prompts al inicio de la aplicación
const promptService = getPromptService();
promptService.loadConfig().then(() => {
  console.log('✅ PromptConfigService loaded successfully');
}).catch((error) => {
  console.error('❌ Failed to load PromptConfigService:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
