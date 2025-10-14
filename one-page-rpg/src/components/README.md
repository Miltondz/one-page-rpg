# 🎨 Componentes de UI - One Page RPG

Sistema completo de interfaz de usuario con estilo retro pixel-art para el juego.

## 📦 Componentes Disponibles

### 1. **SplashScreen** 🎬

Pantalla de entrada con animación de carga.

```tsx
<SplashScreen
  onComplete={() => console.log('Splash completado')}
  duration={3000}
/>
```

**Props:**
- `onComplete: () => void` - Callback cuando termina la animación
- `duration?: number` - Duración en ms (default: 3000)

**Características:**
- Barra de progreso animada
- Efectos de scanline
- Transiciones suaves
- Logo y texto animados

---

### 2. **MainMenu** 🎮

Menú principal del juego con navegación.

```tsx
<MainMenu
  onNewGame={() => console.log('Nueva partida')}
  onLoadGame={() => console.log('Cargar')}
  onOptions={() => console.log('Opciones')}
  hasSavedGame={false}
/>
```

**Props:**
- `onNewGame: () => void` - Handler para nueva partida
- `onLoadGame: () => void` - Handler para cargar partida
- `onOptions: () => void` - Handler para opciones
- `hasSavedGame?: boolean` - Si hay partida guardada (default: false)

**Características:**
- Fondo animado con iconos flotantes
- Modales de "Acerca de" y "Créditos"
- Botón de continuar deshabilitado si no hay guardado
- Diseño responsive con RPGUI

---

### 3. **CharacterCreation** 🎭

Pantalla de creación de personaje en 2 pasos.

```tsx
<CharacterCreation
  onComplete={(name, attributes) => {
    console.log('Personaje creado:', name, attributes);
  }}
  onBack={() => console.log('Volver')}
/>
```

**Props:**
- `onComplete: (name: string, attributes: PlayerAttributes) => void`
- `onBack?: () => void` - Handler opcional para volver

**Flujo:**
1. **Paso 1**: Elegir nombre del personaje
2. **Paso 2**: Distribuir 6 puntos entre FUE, AGI, SAB, SUE

**Características:**
- Sistema de puntos con límite de 5 por atributo
- Validación antes de continuar
- Descripciones detalladas de cada atributo
- Iconos y colores diferenciados

---

### 4. **Modal** 🪟

Componente modal reutilizable.

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Mi Modal"
  size="medium"
>
  <p>Contenido del modal</p>
</Modal>
```

**Props:**
- `isOpen: boolean` - Estado de visibilidad
- `onClose: () => void` - Handler para cerrar
- `title: string` - Título del modal
- `children: React.ReactNode` - Contenido
- `size?: 'small' | 'medium' | 'large'` - Tamaño (default: 'medium')
- `showCloseButton?: boolean` - Mostrar botón X (default: true)
- `closeOnBackdropClick?: boolean` - Cerrar al click fuera (default: true)

**Características:**
- Cierre con ESC
- Backdrop blur
- Animaciones de entrada/salida
- Bloqueo de scroll
- Scroll interno si el contenido es muy largo

---

### 5. **ConfirmModal** ⚠️

Modal especializado para confirmaciones.

```tsx
<ConfirmModal
  isOpen={isOpen}
  onConfirm={() => console.log('Confirmado')}
  onCancel={() => console.log('Cancelado')}
  title="¿Estás seguro?"
  message="Esta acción no se puede deshacer"
  variant="danger"
/>
```

**Props:**
- `isOpen: boolean`
- `onConfirm: () => void`
- `onCancel: () => void`
- `title: string`
- `message: string`
- `confirmText?: string` - Texto del botón (default: 'Confirmar')
- `cancelText?: string` - Texto del botón (default: 'Cancelar')
- `variant?: 'danger' | 'warning' | 'info'` - Estilo (default: 'info')

**Variantes:**
- **danger** ⚠️ - Acciones destructivas (rojo)
- **warning** ❗ - Advertencias (amarillo)
- **info** ℹ️ - Información (azul)

---

## 🎨 Estilos y Animaciones

### Archivo: `src/styles/animations.css`

**Animaciones disponibles:**

```css
.animate-fadeIn        /* Fade in suave */
.animate-slideUp       /* Deslizar desde abajo */
.animate-slideDown     /* Deslizar desde arriba */
.animate-shine         /* Efecto de brillo */
.animate-float         /* Flotación lenta */
.animate-pulse-slow    /* Pulso lento */
.text-shadow          /* Sombra de texto retro */
.text-shadow-lg       /* Sombra más pronunciada */
.scanline-effect      /* Efecto de líneas CRT */
.pixel-perfect        /* Renderizado pixelado */
.custom-scrollbar     /* Scrollbar personalizada */
.glitch-hover         /* Efecto glitch al hover */
.shake                /* Sacudida */
.blink                /* Parpadeo */
```

**Ejemplo de uso:**

```tsx
<div className="animate-slideUp text-shadow">
  ¡Hola Mundo Retro!
</div>
```

---

## 🚀 Integración en App.tsx

### Flujo de Navegación

```tsx
import { useState } from 'react';
import './styles/animations.css';
import {
  SplashScreen,
  MainMenu,
  CharacterCreation,
} from './components';

type GameScreen = 'splash' | 'menu' | 'character-creation' | 'game';

function App() {
  const [screen, setScreen] = useState<GameScreen>('splash');

  switch (screen) {
    case 'splash':
      return <SplashScreen onComplete={() => setScreen('menu')} />;
    
    case 'menu':
      return (
        <MainMenu
          onNewGame={() => setScreen('character-creation')}
          onLoadGame={() => {/* TODO */}}
          onOptions={() => {/* TODO */}}
        />
      );
    
    case 'character-creation':
      return (
        <CharacterCreation
          onComplete={(name, attrs) => {
            console.log(name, attrs);
            setScreen('game');
          }}
          onBack={() => setScreen('menu')}
        />
      );
    
    case 'game':
      return <div>Juego aquí</div>;
  }
}
```

---

## 📝 Notas de Implementación

### Para usar AppNew.tsx en lugar de App.tsx:

1. Renombrar `App.tsx` a `AppOld.tsx`
2. Renombrar `AppNew.tsx` a `App.tsx`
3. Ejecutar `npm run dev`

O alternativamente, en `main.tsx`:

```tsx
import App from './AppNew.tsx'  // En lugar de './App.tsx'
```

---

---

### 6. **SaveGameManager** 💾

Gestor completo de partidas guardadas.

```tsx
<SaveGameManager
  currentGameState={gameState}
  currentRng={rng}
  onLoadSave={(loadedState, loadedRng) => {
    console.log('Partida cargada');
  }}
  onClose={() => setShowSaves(false)}
  mode="manage"
  maxSlots={10}
/>
```

**Props:**
- `currentGameState?: GameState` - Estado actual para guardar
- `currentRng?: SeededRandom` - RNG actual
- `onLoadSave?: (state: GameState, rng: SeededRandom) => void` - Callback al cargar
- `onClose?: () => void` - Callback para cerrar
- `maxSlots?: number` - Número máximo de slots (default: 10)
- `mode?: 'save' | 'load' | 'manage'` - Modo de operación (default: 'manage')

**Características:**
- 10 slots manuales + autosave
- Vista previa de cada save (nombre, nivel, tiempo jugado)
- Confirmación para acciones críticas
- Integración con SaveSystem (localStorage)
- Ordenado por fecha de guardado

---

### 7. **CombatView** ⚔️

Sistema de combate por turnos completo.

```tsx
<CombatView
  player={player}
  enemies={enemies}
  onCombatEnd={(result) => {
    if (result.victory) {
      console.log('Victoria:', result.rewards);
    }
  }}
  onUseItem={(itemId) => console.log('Usar item:', itemId)}
/>
```

**Props:**
- `player: Player` - Datos del jugador
- `enemies: Enemy[]` - Lista de enemigos
- `onCombatEnd: (result) => void` - Callback al terminar combate
- `onUseItem?: (itemId: string) => boolean` - Callback para usar items

**Características:**
- Sistema de turnos automático
- 4 acciones: Atacar, Defender, Usar Item, Huir
- Ataque con FUE o AGI
- Log de combate en tiempo real
- Animaciones de daño y críticos
- Barras de HP animadas
- Victoria/Derrota con recompensas

---

### 8. **InventoryView** 🎒

Gestión completa de inventario y equipo.

```tsx
<InventoryView
  player={player}
  itemCatalog={itemDatabase}
  onEquipItem={(itemId) => console.log('Equipar:', itemId)}
  onUnequipItem={(itemId) => console.log('Desequipar:', itemId)}
  onUseItem={(itemId) => console.log('Usar:', itemId)}
  onDiscardItem={(itemId) => console.log('Descartar:', itemId)}
  onClose={() => setShowInventory(false)}
/>
```

**Props:**
- `player: Player` - Jugador con inventario
- `itemCatalog: Record<string, Item>` - Catálogo de items
- `onEquipItem?: (itemId: string) => void` - Callback al equipar
- `onUnequipItem?: (itemId: string) => void` - Callback al desequipar
- `onUseItem?: (itemId: string) => void` - Callback al usar consumible
- `onDiscardItem?: (itemId: string) => void` - Callback al descartar
- `onClose?: () => void` - Callback para cerrar

**Características:**
- Filtros por tipo de item (Arma, Armadura, Consumible, etc.)
- Visualización de stats con bonos de equipo
- Vista detallada de item seleccionado
- Colores por rareza (común, raro, legendario)
- Slots de equipamiento (Arma, Armadura, Accesorio)
- Confirmación antes de descartar
- Protección de items de quest

---

### 9. **GameScreen** 🎮

Pantalla principal del juego con navegación por tabs.

```tsx
<GameScreen
  playerName={playerName}
  playerAttributes={attributes}
  onBack={() => setScreen('menu')}
/>
```

**Props:**
- `playerName: string` - Nombre del personaje
- `playerAttributes: PlayerAttributes` - Atributos iniciales
- `onBack: () => void` - Volver al menú principal

**Tabs disponibles:**
- 📜 **Misiones**: Sistema de quests con debug panel
- 💾 **Guardar**: Gestor de partidas guardadas
- 🎒 **Inventario**: Gestión de items y equipo
- ⚔️ **Combate**: Sistema de combate por turnos

**Características:**
- Navegación fluida entre tabs
- Integración con GameContext
- Carga diferida de componentes
- Estados de carga y error

---

## 🎯 TODOs

- [x] Implementar sistema de guardado (localStorage)
- [x] Crear componente GameScreen (pantalla principal del juego)
- [x] Crear componente CombatScreen
- [x] Crear componente InventoryScreen
- [ ] Añadir más animaciones de transición
- [ ] Añadir efectos de sonido
- [ ] Implementar sistema de temas (claro/oscuro)
- [ ] Añadir más variantes de modales
- [ ] Implementar drag & drop para inventario
- [ ] Añadir tooltips informativos

---

## 🐛 Problemas Conocidos

- Las animaciones CSS pueden no funcionar en navegadores muy antiguos
- El modal puede tener problemas de z-index con RPGUI en ciertos casos
- La barra de progreso del splash screen puede saltar si el navegador está sobrecargado

---

## 📚 Recursos

- **RPGUI Framework**: https://github.com/RonenNess/RPGUI
- **Press Start 2P Font**: https://fonts.google.com/specimen/Press+Start+2P
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Última actualización**: 2025-01-14 (Implementación de SaveGameManager, CombatView, InventoryView)  
**Versión**: 0.2.0
