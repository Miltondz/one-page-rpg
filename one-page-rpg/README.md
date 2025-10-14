# 🎲 One Page RPG - Solo Adventure

Un RPG narrativo de una sola página inspirado en el sistema 2d6, ambientado en el mundo dark fantasy de **Griswald**, donde la Plaga del Silencio consume voces y voluntades.

## 🌟 Características

- **Sistema 2d6**: Mecánica simple pero profunda basada en tiradas de 2 dados de 6 caras
- **Narrativa Ramificada**: Decisiones que importan y cambian el curso de la historia
- **UI Retro**: Interfaz pixel-art con el framework RPGUI
- **Sin Servidor**: Todo corre en el navegador, sin necesidad de backend
- **TypeScript Completo**: Código fuertemente tipado para mayor robustez

## 📊 Estado del Proyecto

### ✅ Completado (15%)

- [x] **Sistema de Types TypeScript** (12 archivos)
  - Atributos, jugador, dados, mundo, escenas, NPCs, enemigos, items, quests, decisiones, estado del juego
- [x] **Integración RPGUI** 
  - 14 componentes React personalizados
  - Demo funcional con barras de salud/maná e inventario
- [x] **Archivos JSON del Prólogo** (12 archivos, ~52KB)
  - Configuración del juego y mundo
  - 8 NPCs completamente definidos
  - 5 enemigos + 1 boss con habilidades únicas
  - 5 localizaciones explorables
  - 13 escenas narrativas completas
  - Sistema de decisiones y consecuencias
  - Eventos aleatorios y encuentros

### ⏳ En Progreso (85%)

- [ ] Motor narrativo (scene engine)
- [ ] Sistema de dados 2d6 con modificadores
- [ ] Sistema de combate
- [ ] Gestión de inventario
- [ ] Persistencia (localStorage)
- [ ] Componentes de UI del juego
- [ ] Pantallas principales (creación, juego, combate)

## 🎮 El Prólogo: "La Deuda del Ladrón de Ecos"

### Historia

Debes una deuda imposible de pagar a **'La Rata' Alenko**, un criminal que controla los muelles de Murogris. Te ofrece una salida: entregar una caja sellada a un ermitaño en las montañas. Pero la caja susurra con una energía antinatural, y pronto descubrirás que has sido arrastrado a una conspiración que involucra:

- **El Velo**: Una dimensión de entropía que consume la realidad
- **La Plaga del Silencio**: Una enfermedad que roba voces y voluntades
- **El Círculo del Eco**: Magos que luchan por restaurar el antiguo Canto
- **El Culto del Silencio**: Fanáticos que adoran la entropía

### Contenido del Prólogo

- **13 escenas narrativas** con múltiples branches
- **5 localizaciones** (ciudad, camino, cueva, pueblo, minas)
- **2 dungeons** con exploración y combate
- **1 boss fight** contra El Coleccionista de Voces
- **3+ horas de juego** (estimado)
- **2 finales principales** (ayudar o traicionar al Eremita)

## 🛠️ Tecnologías

- **React 18** + **TypeScript 5**
- **Vite** (build tool)
- **RPGUI** (UI framework pixel-art)
- **CSS Modules** (estilos componetizados)

## 🚀 Instalación y Ejecución

```bash
# Clonar el repositorio
git clone https://github.com/Miltondz/one-page-rpg.git
cd one-page-rpg

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Build para producción
npm run build
```

## 📖 Sistema de Juego

### Atributos Base (2d6)
- **FUE** (Fuerza): Combate cuerpo a cuerpo, fuerza bruta
- **AGI** (Agilidad): Combate a distancia, sigilo, reflejos
- **SAB** (Sabiduría): Magia, conocimiento, percepción
- **SUE** (Suerte): Eventos aleatorios, esquivar destino

### Mecánica 2d6
- **2-6**: Fallo catastrófico
- **7-9**: Éxito con consecuencias
- **10-11**: Éxito limpio
- **12**: Éxito crítico

### Recursos
- **Heridas**: Salud física (base: 3)
- **Fatiga**: Energía mental/mágica (base: 3)
- **Experiencia**: 3 XP = 1 nivel

## 🌍 El Mundo: Griswald

Una baronía fronteriza perpetuamente nublada, atrapada en un otoño eterno. La magia del Canto se desvanece mientras el Velo se filtra en la realidad, robando voces y memorias.

### Facciones Principales
- **Casa Von Hess**: Nobleza corrupta que busca controlar el Silencio
- **El Culto del Silencio**: Fanáticos que adoran la entropía
- **El Círculo del Eco**: Magos que luchan por restaurar el Canto

## 📜 Licencia

MIT License - Ver archivo LICENSE para más detalles.

## 🎯 Créditos

- **Sistema RPGUI**: [RonenNess/RPGUI](https://github.com/RonenNess/RPGUI)
- **Fuente**: Press Start 2P (Google Fonts)
- **Framework**: React + TypeScript + Vite

---

**Estado**: 🟢 En Desarrollo Activo  
**Versión**: 0.1.0 (Prólogo en construcción)  
**Última actualización**: Enero 2025
