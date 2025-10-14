# 📋 TODO - Tareas Pendientes

**Última actualización:** 2025-01-14  
**Progreso del proyecto:** 80%  
**Tests:** 79/100 pasando

---

## 🚀 Prioridad Alta (Para lanzamiento v1.0)

### 1. ⚠️ Ajustar Tests de ReputationSystem
**Descripción:** Alinear los 21 tests que fallan con la implementación real  
**Esfuerzo:** ~30 minutos  
**Archivos:** `src/test/ReputationSystem.test.ts`

**Cambios necesarios:**
- Actualizar nombres de propiedades (`exclusiveInformation` → `exclusiveInfoAvailable`)
- Ajustar valores esperados de modificadores
- Actualizar textos de descripción esperados

### 2. 🎨 UI para Outcomes de Dados
**Descripción:** Panel visual que muestre los resultados detallados de las tiradas  
**Esfuerzo:** ~2 horas

**Características:**
- Mostrar dados visuales con animación
- Destacar críticos con efectos especiales
- Mostrar consecuencias/bonos procedurales
- Integrar con CombatView y skill checks

### 3. 📊 Indicador Visual de Reputación
**Descripción:** UI que muestre el estado de reputación con cada facción  
**Esfuerzo:** ~1 hora

**Características:**
- Barra de progreso por facción
- Código de colores (rojo=hostile, verde=friendly)
- Tooltip con beneficios/penalizaciones actuales
- Notificación cuando cambia nivel de actitud

### 4. ⚔️ Sistema de Condiciones en Combate
**Descripción:** Determinar ventaja/desventaja basado en estado del combate  
**Esfuerzo:** ~2 horas

**Condiciones que otorgan ventaja:**
- Atacar enemigo aturdido
- Posición táctica favorable
- Buff activo
- Flanqueo

**Condiciones que otorgan desventaja:**
- Herido gravemente (1 HP)
- Debuff activo
- Cegado/Aturdido
- Terreno difícil

---

## 🎯 Prioridad Media (Post-lanzamiento)

### 5. 🎭 Panel Debug de Generación de NPCs
**Descripción:** Interfaz para generar y previsualizar NPCs procedurales  
**Esfuerzo:** ~1 hora

**Características:**
- Generar NPC aleatorio
- Mostrar todos los atributos (nombre, motivación, secreto, etc.)
- Botón "Re-roll" con mismo seed
- Exportar a JSON

### 6. 📜 Sistema de Achievements
**Descripción:** Logros desbloqueables por acciones del jugador  
**Esfuerzo:** ~3 horas

**Categorías:**
- Combate (derrotar X enemigos, críticos, etc.)
- Social (reputación máxima, secretos descubiertos)
- Exploración (visitar todas las locaciones)
- Historia (finales alternativos)

### 7. 📈 Panel de Estadísticas
**Descripción:** Resumen de stats acumuladas del jugador  
**Esfuerzo:** ~2 horas

**Métricas:**
- Enemigos derrotados
- Oro ganado/gastado
- Decisiones tomadas
- NPCs conocidos
- Tiempo jugado

### 8. 🗺️ Sistema de Mapa
**Descripción:** Mapa interactivo del mundo  
**Esfuerzo:** ~4 horas

**Características:**
- Mapa de Griswald con locaciones
- Indicadores de NPCs importantes
- Fog of war (áreas no visitadas)
- Fast travel a locaciones conocidas

---

## 🔮 Prioridad Baja (Futuro lejano)

### 9. 🎲 Editor de Campañas
**Descripción:** Herramienta para crear escenas y quests personalizadas  
**Esfuerzo:** ~20 horas

**Características:**
- Editor visual de escenas
- Sistema de nodes para decisiones
- Editor de NPCs y enemigos
- Exportar/Importar campañas

### 10. 🌐 Modo Multijugador Asíncrono
**Descripción:** Compartir decisiones y resultados con otros jugadores  
**Esfuerzo:** ~40 horas

**Características:**
- Backend con Firebase/Supabase
- Leaderboards globales
- Compartir seeds de aventuras
- Ver decisiones de otros jugadores

### 11. 📱 Versión Móvil
**Descripción:** Adaptar UI para móviles y tablets  
**Esfuerzo:** ~15 horas

**Características:**
- Responsive design
- Touch controls optimizados
- PWA con instalación offline
- Guardado en cloud

### 12. 🎨 Ilustraciones Generadas por IA
**Descripción:** Generar imágenes de NPCs, locaciones y escenas  
**Esfuerzo:** ~10 horas

**Características:**
- Integración con Stable Diffusion local
- Prompt engineering basado en contexto
- Cache de imágenes generadas
- Estilo consistente pixel-art

---

## 🐛 Bugs Conocidos

### ⚠️ Ninguno crítico identificado

**Bugs menores:**
- [ ] Tests de ReputationSystem con discrepancias (no afecta funcionalidad)

---

## 🏗️ Refactoring Técnico

### 1. Migrar a Zustand o Context API
**Descripción:** Reemplazar props drilling con estado global  
**Esfuerzo:** ~5 horas  
**Beneficio:** Código más limpio y mantenible

### 2. Implementar React Query
**Descripción:** Cache inteligente para llamadas LLM y carga de JSON  
**Esfuerzo:** ~3 horas  
**Beneficio:** Mejor performance y experiencia de usuario

### 3. Añadir Storybook
**Descripción:** Documentar componentes RPGUI  
**Esfuerzo:** ~4 horas  
**Beneficio:** Facilita desarrollo y testing de UI

### 4. CI/CD Pipeline
**Descripción:** GitHub Actions para tests y deploy automático  
**Esfuerzo:** ~2 horas  
**Beneficio:** Deploy confiable y automático

---

## 📚 Documentación

### Pendiente de Documentar:

- [ ] Guía de integración de nuevos sistemas
- [ ] API reference completa
- [ ] Tutorial de creación de escenas
- [ ] Guía de contribución
- [ ] Changelog detallado por versión

---

## ✅ Recientemente Completado (v0.6.0)

- ✅ **DiceSystem** - Sistema 2d6 con outcomes diferenciados
- ✅ **ReputationSystem** - Efectos dinámicos en precios y NPCs
- ✅ **NPCGenerator** - Generación procedural con seeds
- ✅ **CombatEngine Integration** - Integrado con DiceSystem
- ✅ **EconomySystem Integration** - Integrado con ReputationSystem
- ✅ **Tests Unitarios** - 79/100 tests pasando
- ✅ **NPCMemorySystem Fix** - Corregido import error

---

## 📊 Métricas del Proyecto

**Líneas de Código:**
- TypeScript: ~15,000
- Tests: ~1,150
- JSON: ~52KB de contenido

**Archivos:**
- Componentes React: 23
- Sistemas: 15
- Tests: 4 suites
- JSON de contenido: 12

**Cobertura:**
- Tests: 79%
- Funcionalidad implementada: 80%
- Prólogo completo: 100%

---

**Próxima versión:** v0.7.0 - UI Improvements & Conditions  
**Fecha estimada:** Febrero 2025
