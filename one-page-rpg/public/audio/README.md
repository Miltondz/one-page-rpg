# 🎵 Audio Assets para One Page RPG

## Estructura de Carpetas

```
public/audio/
├── music/          # Música de fondo (MP3)
└── sfx/            # Efectos de sonido (MP3)
```

---

## 🎼 Música de Fondo (music/)

Copia los siguientes archivos MP3 en la carpeta `/public/audio/music/`:

### Archivos Requeridos:

1. **menu_theme.mp3** - Tema del menú principal
   - Estilo: Orquestal épico, misterioso
   - Duración sugerida: 2-3 min (loop)

2. **exploration.mp3** - Música de exploración
   - Estilo: Ambient, tranquilo pero tenso
   - Duración sugerida: 3-4 min (loop)

3. **combat.mp3** - Música de combate estándar
   - Estilo: Acción, ritmo rápido
   - Duración sugerida: 2-3 min (loop)

4. **boss_fight.mp3** - Música de pelea contra boss
   - Estilo: Épico, intenso, dramático
   - Duración sugerida: 3-4 min (loop)

5. **horror.mp3** - Música de terror/suspenso
   - Estilo: Oscuro, inquietante, drones
   - Duración sugerida: 2-3 min (loop)

6. **mystery.mp3** - Música de misterio
   - Estilo: Intrigante, investigación
   - Duración sugerida: 2-3 min (loop)

7. **triumph.mp3** - Música de victoria
   - Estilo: Celebración, heroico
   - Duración sugerida: 30-60 seg (no loop)

8. **sadness.mp3** - Música triste
   - Estilo: Melancólico, emotivo
   - Duración sugerida: 1-2 min (no loop)

9. **betrayal.mp3** - Música de traición
   - Estilo: Dramático, revelación oscura
   - Duración sugerida: 1-2 min (no loop)

10. **tavern.mp3** - Música de taberna
    - Estilo: Alegre, medieval, laúd
    - Duración sugerida: 2-3 min (loop)

11. **dungeon.mp3** - Música de dungeon
    - Estilo: Oscuro, exploración peligrosa
    - Duración sugerida: 3-4 min (loop)

---

## 🔊 Efectos de Sonido (sfx/)

Copia los siguientes archivos MP3 en la carpeta `/public/audio/sfx/`:

### UI Sounds (5 archivos):
- **ui_click.mp3** - Click de botón
- **ui_hover.mp3** - Hover sobre elemento
- **ui_open.mp3** - Abrir menú/ventana
- **ui_close.mp3** - Cerrar menú/ventana
- **ui_error.mp3** - Error/acción inválida

### Combat Sounds (7 archivos):
- **attack_sword.mp3** - Sonido de espada
- **attack_hit.mp3** - Golpe exitoso
- **attack_miss.mp3** - Ataque fallido
- **attack_critical.mp3** - Golpe crítico
- **defend.mp3** - Defensa/bloqueo
- **take_damage.mp3** - Recibir daño
- **death.mp3** - Muerte de enemigo

### Magic Sounds (3 archivos):
- **spell_cast.mp3** - Lanzar hechizo
- **spell_hit.mp3** - Hechizo impacta
- **heal.mp3** - Curación

### Item Sounds (5 archivos):
- **pickup_item.mp3** - Recoger item
- **equip_item.mp3** - Equipar item
- **use_potion.mp3** - Usar poción
- **drop_item.mp3** - Soltar item
- **coins.mp3** - Monedas/oro

### Character Sounds (3 archivos):
- **level_up.mp3** - Subir de nivel
- **quest_complete.mp3** - Quest completada
- **achievement.mp3** - Logro desbloqueado

### Ambient Sounds (5 archivos):
- **door_open.mp3** - Abrir puerta
- **door_close.mp3** - Cerrar puerta
- **chest_open.mp3** - Abrir cofre
- **footsteps.mp3** - Pasos
- **heartbeat.mp3** - Latidos (horror)

---

## 📋 Resumen

- **Total de archivos de música:** 11
- **Total de efectos de sonido:** 28
- **Total general:** 39 archivos MP3

---

## 🎨 Recomendaciones de Fuentes

### Música Libre de Derechos:
- [Incompetech](https://incompetech.com/) - Kevin MacLeod
- [Purple Planet Music](https://www.purple-planet.com/)
- [Bensound](https://www.bensound.com/)
- [Freesound](https://freesound.org/)

### Efectos de Sonido:
- [Freesound](https://freesound.org/)
- [Zapsplat](https://www.zapsplat.com/)
- [Soundbible](http://soundbible.com/)
- [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk/)

---

## ⚙️ Configuración en el Juego

El sistema de audio se activa automáticamente:

```typescript
import { getAudioService } from '../services/AudioService';

// Reproducir música según contexto
const audio = getAudioService();
await audio.playMusic('combat'); // Cambiar a música de combate

// Reproducir efecto de sonido
audio.playSFX('attack_hit'); // Sonido de golpe

// Controlar volumen
audio.setMusicVolume(0.5); // 50% volumen
audio.setSFXVolume(0.7); // 70% volumen

// Silenciar
audio.setMuted(true);
```

---

## 🎯 Contextos Musicales Disponibles

| Contexto | Cuándo se Usa |
|----------|---------------|
| `menu` | Menú principal |
| `exploration` | Explorando el mundo |
| `combat` | Combate estándar |
| `boss_fight` | Pelea contra jefe |
| `horror` | Momentos de terror |
| `mystery` | Investigación |
| `triumph` | Victoria |
| `sadness` | Momentos tristes |
| `betrayal` | Revelaciones oscuras |
| `tavern` | En la taberna |
| `dungeon` | Dungeons/mazmorras |

---

**Nota:** Los archivos MP3 deben tener calidad media (128-192 kbps) para balance entre calidad y tamaño.

**Última actualización:** 2025-01-14
