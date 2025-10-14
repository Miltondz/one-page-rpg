# 🗺️ Roadmap - 55% Faltante del Proyecto

## Estado Actual: 45% Completado ✅

---

## 📋 Desglose del 55% Restante

### **FASE 1: Integración y Conexión (15%)** 🔗

#### 1.1 Integración Narrativa Completa (5%)
- [ ] Conectar SceneGenerator con GameContext
- [ ] Integrar decisiones con sistema de quests
- [ ] Sistema de flags y eventos persistentes
- [ ] Transiciones entre escenas con contexto
- [ ] Historia del jugador (event log completo)
- [ ] **Archivos a crear:**
  - `src/engine/SceneManager.ts`
  - `src/engine/StoryEngine.ts`
  - `src/hooks/useNarrative.ts`

**Estimado:** 8-12 horas de desarrollo

---

#### 1.2 Integración de Datos JSON (5%)
- [ ] Cargar catálogo completo de items desde `/game_data/items/items.json`
- [ ] Cargar enemigos desde `/game_data/creatures/creatures.json`
- [ ] Cargar NPCs desde `/game_data/characters/npcs.json`
- [ ] Cargar locaciones desde `/game_data/locations/locations.json`
- [ ] Sistema de caché para datos cargados
- [ ] Validación de datos JSON al cargar
- [ ] **Archivos a modificar:**
  - `src/hooks/useGameData.ts` (expandir)
  - `src/context/GameContext.tsx` (añadir catálogos)
  - `src/types/catalog.ts` (crear)

**Estimado:** 6-8 horas de desarrollo

---

#### 1.3 Sistema de Combate Integrado (5%)
- [ ] Triggers de combate desde eventos de historia
- [ ] Generación de encuentros aleatorios
- [ ] Combate en dungeons (minas, cuevas)
- [ ] Boss fights con mecánicas especiales
- [ ] Recompensas post-combate integradas con inventario
- [ ] XP y leveling desde combates
- [ ] **Archivos a crear:**
  - `src/systems/EncounterSystem.ts`
  - `src/hooks/useCombat.ts`

**Estimado:** 10-14 horas de desarrollo

---

### **FASE 2: Sistemas de Juego Avanzados (20%)** 🎮

#### 2.1 Sistema de Progresión Completo (5%)
- [ ] Sistema de niveles expandido (1-10)
- [ ] Árbol de habilidades básico
- [ ] Sistema de reputación con facciones
  - Casa Von Hess
  - Culto del Silencio
  - Círculo del Eco
- [ ] Achievements y logros desbloqueables
- [ ] Estadísticas del jugador (tracking)
- [ ] **Archivos a crear:**
  - `src/systems/ReputationSystem.ts`
  - `src/systems/AchievementSystem.ts`
  - `src/components/ProgressionScreen.tsx`

**Estimado:** 12-16 horas de desarrollo

---

#### 2.2 Sistema de Comercio y Economía (5%)
- [ ] Componente de Tienda (ShopView)
- [ ] Compra/venta de items
- [ ] Precios dinámicos basados en reputación
- [ ] NPCs vendedores
- [ ] Inventario de comerciantes
- [ ] Quests relacionadas con comercio
- [ ] **Archivos a crear:**
  - `src/components/ShopView.tsx`
  - `src/systems/EconomySystem.ts`
  - `src/types/merchant.ts`

**Estimado:** 10-14 horas de desarrollo

---

#### 2.3 Sistema de Crafting Básico (5%)
- [ ] Recetas de crafteo
- [ ] Combinación de items
- [ ] Materiales y recursos
- [ ] UI de crafting
- [ ] Integración con inventario
- [ ] **Archivos a crear:**
  - `src/components/CraftingView.tsx`
  - `src/systems/CraftingSystem.ts`
  - `src/types/recipe.ts`

**Estimado:** 8-12 horas de desarrollo

---

#### 2.4 Sistema de Magia y Hechizos (5%)
- [ ] Sistema de hechizos basado en SAB
- [ ] Libro de hechizos
- [ ] Coste de fatiga para lanzar
- [ ] Hechizos de combate y utilidad
- [ ] Aprendizaje de nuevos hechizos
- [ ] **Archivos a crear:**
  - `src/components/SpellbookView.tsx`
  - `src/systems/MagicSystem.ts`
  - `src/types/spell.ts`

**Estimado:** 10-14 horas de desarrollo

---

### **FASE 3: Contenido del Prólogo (15%)** 📖

#### 3.1 Implementación de las 13 Escenas (8%)
- [ ] Escena 1-3: Introducción y La Rata Alenko
- [ ] Escena 4-6: Camino a las montañas
- [ ] Escena 7-9: El Ermitaño y la revelación
- [ ] Escena 10-11: Las Minas Olvidadas (dungeon)
- [ ] Escena 12: Boss Fight - El Coleccionista de Voces
- [ ] Escena 13: Finales múltiples
- [ ] **Archivos a crear:**
  - `src/content/prologue/scene_implementations.ts`
  - JSON de escenas específicas si faltan

**Estimado:** 20-30 horas de desarrollo

---

#### 3.2 Eventos Aleatorios y Encuentros (4%)
- [ ] 15+ eventos aleatorios por tipo de locación
- [ ] Sistema de probabilidades
- [ ] Consecuencias de eventos
- [ ] Loot dinámico
- [ ] **Archivos a crear:**
  - `src/systems/RandomEventSystem.ts`
  - `game_data/events/random_events.json`

**Estimado:** 6-10 horas de desarrollo

---

#### 3.3 Diálogos y NPCs Interactivos (3%)
- [ ] Sistema de diálogo completo
- [ ] Opciones de diálogo con checks de atributos
- [ ] Memoria de conversaciones
- [ ] Diálogos con los 8 NPCs del prólogo
- [ ] **Archivos a crear:**
  - `src/components/DialogueView.tsx`
  - `src/systems/DialogueSystem.ts`

**Estimado:** 8-12 horas de desarrollo

---

### **FASE 4: Pulido y UX (10%)** ✨

#### 4.1 Efectos de Audio (3%)
- [ ] Música de fondo (3-4 tracks)
  - Menú principal
  - Exploración
  - Combate
  - Boss fight
- [ ] Efectos de sonido
  - UI clicks
  - Ataque/daño
  - Level up
  - Items
- [ ] Control de volumen
- [ ] **Archivos a crear:**
  - `src/services/AudioService.ts`
  - Carpeta `/public/audio/`

**Estimado:** 6-10 horas de desarrollo

---

#### 4.2 Animaciones y Transiciones (3%)
- [ ] Transiciones entre pantallas
- [ ] Animaciones de entrada/salida
- [ ] Efectos visuales en combate (mejorados)
- [ ] Partículas y efectos especiales
- [ ] Loading screens con tips
- [ ] **Archivos a crear:**
  - `src/styles/enhanced-animations.css`
  - `src/components/ParticleEffect.tsx`

**Estimado:** 8-12 horas de desarrollo

---

#### 4.3 Tutorial y Onboarding (2%)
- [ ] Tutorial interactivo inicial
- [ ] Tooltips contextuales
- [ ] Help screens por sección
- [ ] Glosario de términos
- [ ] **Archivos a crear:**
  - `src/components/TutorialOverlay.tsx`
  - `src/components/TooltipSystem.tsx`

**Estimado:** 4-6 horas de desarrollo

---

#### 4.4 Opciones y Configuración (2%)
- [ ] Pantalla de opciones completa
- [ ] Ajustes de audio
- [ ] Velocidad de texto
- [ ] Modo daltónico
- [ ] Accesibilidad
- [ ] **Archivos a crear:**
  - `src/components/OptionsScreen.tsx`
  - `src/context/SettingsContext.tsx`

**Estimado:** 4-6 horas de desarrollo

---

### **FASE 5: Testing y Optimización (10%)** 🧪

#### 5.1 Testing de Sistemas (4%)
- [ ] Unit tests para sistemas críticos
- [ ] Tests de integración
- [ ] Tests de combate
- [ ] Tests de guardado/carga
- [ ] **Archivos a crear:**
  - `tests/` (estructura completa)
  - Configuración de Vitest/Jest

**Estimado:** 10-15 horas de desarrollo

---

#### 5.2 Balance y Gameplay (3%)
- [ ] Balanceo de combate
- [ ] Ajuste de dificultad
- [ ] Economía del juego
- [ ] Recompensas de quests
- [ ] Testing playtesting
- [ ] **Archivos a modificar:**
  - JSONs de enemies
  - JSONs de items
  - Sistema de progresión

**Estimado:** 15-20 horas de playtesting

---

#### 5.3 Optimización de Performance (3%)
- [ ] Code splitting
- [ ] Lazy loading de componentes
- [ ] Optimización de renders
- [ ] Compresión de assets
- [ ] Service Worker para caché
- [ ] **Archivos a modificar:**
  - `vite.config.ts`
  - Múltiples componentes
  - Assets

**Estimado:** 6-10 horas de desarrollo

---

### **FASE 6: Deploy y Distribución (5%)** 🚀

#### 6.1 Build y Deploy (2%)
- [ ] Build de producción optimizado
- [ ] Deploy en GitHub Pages / Vercel / Netlify
- [ ] CI/CD con GitHub Actions
- [ ] **Archivos a crear:**
  - `.github/workflows/deploy.yml`
  - Configuración de hosting

**Estimado:** 4-6 horas

---

#### 6.2 Documentación Final (2%)
- [ ] README completo con screenshots
- [ ] Guía del jugador
- [ ] Documentación técnica
- [ ] CHANGELOG
- [ ] **Archivos a crear:**
  - `PLAYER_GUIDE.md`
  - `TECHNICAL_DOCS.md`
  - `CHANGELOG.md`

**Estimado:** 6-8 horas

---

#### 6.3 Marketing y Comunidad (1%)
- [ ] Video trailer/demo
- [ ] Screenshots para GitHub
- [ ] Post en itch.io
- [ ] Página de proyecto
- [ ] **Assets a crear:**
  - Banner del proyecto
  - Screenshots
  - GIFs de gameplay

**Estimado:** 4-6 horas

---

## 📊 Resumen por Fase

| Fase | Porcentaje | Horas Estimadas | Prioridad |
|------|-----------|-----------------|-----------|
| **Fase 1: Integración** | 15% | 24-34 hrs | 🔴 CRÍTICA |
| **Fase 2: Sistemas Avanzados** | 20% | 40-56 hrs | 🟠 ALTA |
| **Fase 3: Contenido Prólogo** | 15% | 34-52 hrs | 🟠 ALTA |
| **Fase 4: Pulido y UX** | 10% | 22-34 hrs | 🟡 MEDIA |
| **Fase 5: Testing** | 10% | 31-45 hrs | 🟢 BAJA* |
| **Fase 6: Deploy** | 5% | 14-20 hrs | 🟢 FINAL |
| **TOTAL** | **55%** | **165-241 hrs** | - |

\* *Baja prioridad al inicio, crítica antes de release*

---

## 🎯 Orden de Implementación Recomendado

### **Sprint 1 (Semana 1-2):** Integración
1. Cargar datos JSON
2. Integrar SceneManager
3. Conectar combate con historia

### **Sprint 2 (Semana 3-4):** Sistemas Base
1. Sistema de comercio
2. Sistema de progresión
3. Sistema de reputación

### **Sprint 3 (Semana 5-7):** Contenido
1. Implementar escenas 1-7
2. Implementar escenas 8-13
3. Eventos aleatorios

### **Sprint 4 (Semana 8-9):** Magia y Crafting
1. Sistema de magia
2. Sistema de crafting básico

### **Sprint 5 (Semana 10-11):** Pulido
1. Audio
2. Animaciones
3. Tutorial

### **Sprint 6 (Semana 12-13):** Testing
1. Playtesting
2. Balance
3. Bugs

### **Sprint 7 (Semana 14):** Deploy
1. Build final
2. Deploy
3. Documentación

---

## 🔢 Métricas del Proyecto

### Archivos Totales Estimados
- **Actual:** ~50 archivos TypeScript/React
- **A crear:** ~45 archivos adicionales
- **Total final:** ~95 archivos de código

### Líneas de Código Estimadas
- **Actual:** ~15,000 líneas
- **Faltante:** ~20,000 líneas
- **Total final:** ~35,000 líneas

### Assets
- **JSON:** 12 archivos (completos) ✅
- **Audio:** 0 archivos (faltante: ~20)
- **Imágenes:** Mínimas (icons, sprites opcionales)

---

## 💡 Notas Importantes

1. **El prólogo completo es jugable sin todos los sistemas** - Se puede lanzar una versión "Early Access" al 70%
2. **El LLM narrativo ya está implementado** - Gran ventaja para contenido dinámico
3. **Los sistemas core están sólidos** - Combate, inventario, guardado funcionan bien
4. **Priorizar contenido sobre features** - Mejor un prólogo completo que sistemas a medias

---

## 🚦 Señales de Progreso

- **60% (Sprint 2):** Sistema de comercio funcionando
- **70% (Sprint 3):** Prólogo jugable de inicio a fin
- **80% (Sprint 4):** Todos los sistemas implementados
- **90% (Sprint 5):** Audio y pulido completo
- **100% (Sprint 7):** Release v1.0

---

**Última actualización:** 2025-01-14  
**Estimación total:** 3-4 meses de desarrollo a tiempo parcial (20h/semana)  
**O:** 1.5-2 meses a tiempo completo (40h/semana)
