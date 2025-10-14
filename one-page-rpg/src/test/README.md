# 🧪 Sistema de Pruebas - One Page RPG

## Stack de Testing

- **Vitest**: Framework de testing rápido y compatible con Vite
- **@testing-library/react**: Testing utilities para componentes React
- **@testing-library/jest-dom**: Matchers personalizados para DOM
- **jsdom**: Entorno DOM para Node.js

## Estructura

```
src/test/
├── setup.ts                          # Configuración global de tests
├── PromptConfigService.test.ts       # Tests del servicio de prompts
└── README.md                         # Esta documentación
```

## Ejecutar Pruebas

```bash
# Ejecutar tests en modo watch
npm test

# Ejecutar tests una vez
npm test -- --run

# Ejecutar con UI interactiva
npm run test:ui

# Generar reporte de cobertura
npm run test:coverage
```

## Cobertura Actual

### PromptConfigService ✅ (100%)

**19 tests | 19 passed**

#### Funcionalidades Probadas

1. **loadConfig** (2 tests)
   - ✅ Carga correcta de configuración desde JSON
   - ✅ Manejo de errores al fallar la carga

2. **getTemplate** (2 tests)
   - ✅ Obtención de template por ruta
   - ✅ Retorno null para rutas inexistentes

3. **buildPrompt** (3 tests)
   - ✅ Construcción básica de prompts con variables
   - ✅ Manejo de secciones condicionales
   - ✅ Fallback cuando template no existe

4. **buildDialoguePrompt** (1 test)
   - ✅ Construcción de prompts de diálogo

5. **buildOraclePrompt** (2 tests)
   - ✅ Construcción de prompts de oráculo
   - ✅ Uso de explicaciones desde config

6. **buildDynamicPrompt** (4 tests)
   - ✅ Construcción de prompts dinámicos
   - ✅ Exclusión de valores undefined/null/empty
   - ✅ Inclusión de constraints por defecto
   - ✅ Control de system context y constraints

7. **validateVariables** (2 tests)
   - ✅ Validación de variables presentes
   - ✅ Detección de variables faltantes

8. **Utilities** (3 tests)
   - ✅ Listado de templates disponibles
   - ✅ Obtención de system context
   - ✅ Obtención de constraints globales

## Escribir Nuevos Tests

### Ejemplo básico

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('MiServicio', () => {
  let service: MiServicio;

  beforeEach(() => {
    // Setup antes de cada test
    service = new MiServicio();
  });

  describe('miMetodo', () => {
    it('debe hacer lo esperado', () => {
      const result = service.miMetodo('input');
      expect(result).toBe('expected');
    });

    it('debe manejar errores', () => {
      expect(() => service.miMetodo(null)).toThrow();
    });
  });
});
```

### Mocking

```typescript
// Mock de fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'mock' }),
} as Response);

// Mock de módulo
vi.mock('../services/MyService', () => ({
  MyService: vi.fn(() => ({
    method: vi.fn().mockReturnValue('mocked'),
  })),
}));
```

## Próximos Tests a Implementar

- [ ] **NPCDialogueGenerator**
  - Generación de diálogos con memoria
  - Fallback procedural
  - Detección de emociones
  - Respuestas sugeridas

- [ ] **OracleSystem**
  - Sistema 2d6 con modificadores
  - Interpretación con LLM
  - Historial de consultas
  - Fallback procedural

- [ ] **NarrativeJournal**
  - Creación de entradas
  - Categorización automática
  - Generación con LLM
  - Filtrado y búsqueda

- [ ] **NPCMemorySystem**
  - Tracking de interacciones
  - Cálculo de relación
  - Mood transitions
  - Contexto para LLM

- [ ] **AchievementSystem**
  - Desbloqueo de logros
  - Verificación de condiciones
  - Descripciones contextuales
  - Progreso y tracking

- [ ] **LLMNarrativeEngine**
  - Enriquecimiento de escenas
  - Generación de diálogos NPCs
  - Flavor text de combate
  - Descubrimientos de items
  - Pensamientos del personaje

## Mejores Prácticas

1. **Nomenclatura clara**: Usa `describe` para agrupar y `it('debe...')` para casos
2. **Un concepto por test**: Cada test debe verificar una sola cosa
3. **AAA Pattern**: Arrange (preparar) → Act (actuar) → Assert (verificar)
4. **Mock externo, test interno**: Mock dependencias externas, testea lógica interna
5. **Tests independientes**: Cada test debe poder ejecutarse solo
6. **Setup/Teardown**: Usa `beforeEach`/`afterEach` para limpiar estado

## Comandos Útiles

```bash
# Ver tests en modo watch con filtro
npm test -- --watch --grep="buildPrompt"

# Ejecutar solo un archivo
npm test -- PromptConfigService.test.ts

# Ver reporte detallado
npm test -- --reporter=verbose

# Actualizar snapshots (si usamos)
npm test -- -u
```

## CI/CD

Los tests se ejecutan automáticamente en:
- ✅ Pre-commit hooks (opcional)
- ✅ GitHub Actions en push/PR (opcional)
- ✅ Antes de build de producción

## Debugging Tests

```typescript
// Para ver valores durante el test
console.log('Debug:', myValue);

// Para pausar ejecución (en debug mode)
debugger;

// Para ver qué se renderizó (React)
import { screen } from '@testing-library/react';
screen.debug();
```

---

**Última actualización**: Enero 2025  
**Cobertura total**: 100% (PromptConfigService)  
**Tests totales**: 19 passed
