# 🎮 GUÍA DEL JUGADOR - One Page RPG

**Versión:** 0.6.0  
**Para jugadores que quieren:** Dominar el sistema y aprovechar todos los elementos narrativos

---

## 📖 ÍNDICE

1. [Conceptos Básicos](#conceptos-básicos)
2. [Sistema de Dados 2d6](#sistema-de-dados-2d6)
3. [Combate Táctico](#combate-táctico)
4. [Interacción con NPCs](#interacción-con-npcs)
5. [Sistema de Reputación](#sistema-de-reputación)
6. [Comercio y Economía](#comercio-y-economía)
7. [Quests y Narrativa](#quests-y-narrativa)
8. [Estrategias Avanzadas](#estrategias-avanzadas)

---

## 🎯 CONCEPTOS BÁSICOS

### Tu Personaje

**Atributos (escala 0-5):**
- **FUE (Fuerza):** Ataques cuerpo a cuerpo, fuerza bruta
- **AGI (Agilidad):** Ataques a distancia, sigilo, reflejos
- **SAB (Sabiduría):** Magia, conocimiento, percepción
- **SUE (Suerte):** Eventos aleatorios, esquivar el destino

**Recursos:**
- **Heridas:** Salud física (base: 3). Si llegas a 0, mueres.
- **Fatiga:** Energía mental/mágica (base: 3). Para habilidades especiales.
- **Oro:** Moneda para comercio
- **XP:** 3 puntos = 1 nivel

**Ejemplo de creación:**
```
Nombre: Kael el Silencioso
Clase: Ladrón
Atributos: FUE 2, AGI 4, SAB 2, SUE 3
Heridas: 3/3
Fatiga: 3/3
Oro: 50
```

---

## 🎲 SISTEMA DE DADOS 2d6

### Cómo Funcionan las Tiradas

Cuando realizas una acción, tiras **2 dados de 6 caras** y sumas tu **atributo relevante**.

**Fórmula:** `2d6 + Atributo + Bonos`

### Resultados Posibles

| Total | Resultado | Efecto |
|-------|-----------|--------|
| **2-6** | 💀 **Fallo Crítico** | Fallas Y sufres consecuencias graves |
| **7-9** | ⚠️ **Éxito Parcial** | Logras tu objetivo PERO con una consecuencia |
| **10-11** | ✅ **Éxito** | Logras tu objetivo limpiamente |
| **12+** | 🌟 **Éxito Crítico** | Logras tu objetivo Y obtienes un bono extra |

### Consecuencias de Éxito Parcial (7-9)

El juego elige **aleatoriamente** una consecuencia narrativa:

1. "pero te cuesta 1 punto de fatiga extra"
2. "pero alertas a enemigos cercanos"
3. "pero pierdes o dañas un item"
4. "pero te expones a un peligro adicional"
5. "pero toma el doble de tiempo"
6. "pero haces ruido y pierdes el sigsigilo"
7. "pero el éxito es solo temporal"
8. "pero alguien nota tu acción"

**Ejemplo:**
```
Acción: Abrir una cerradura (AGI)
Tus dados: [4, 3] + AGI 4 = 11 ✅ Éxito
Resultado: "Abres la cerradura sin problemas"

VS.

Tus dados: [3, 5] + AGI 4 = 12 🌟 Éxito Crítico
Resultado: "Abres la cerradura Y encuentras una ganzúa de calidad"
```

### Bonos de Éxito Crítico (12+)

Posibles bonos narrativos aleatorios:

1. "y encuentras algo útil adicional"
2. "y impresionas a los presentes positivamente"
3. "y lo haces más rápido de lo esperado"
4. "y no gastas recursos en el proceso"
5. "y ganas ventaja táctica para tu próxima acción"
6. "y aprendes algo importante del proceso"
7. "y tus enemigos se desmoralizan"
8. "y causas un efecto secundario favorable"

### Ventaja y Desventaja

En situaciones especiales, puedes tener **ventaja** o **desventaja**:

**Ventaja:** Tiras **3d6** y mantienes los **2 mejores**
- Ejemplo: Atacas a un enemigo aturdido
- Dados: [6, 2, 5] → Mantienes [6, 5] = 11 + mods

**Desventaja:** Tiras **3d6** y mantienes los **2 peores**
- Ejemplo: Estás herido gravemente (1 HP)
- Dados: [6, 2, 5] → Mantienes [2, 5] = 7 + mods

**Cuándo tienes Ventaja:**
- Enemigo aturdido/cegado
- Posición táctica favorable
- Ayuda de un aliado
- Buff mágico activo

**Cuándo tienes Desventaja:**
- Herido gravemente (1 HP)
- Debuff activo (veneno, maldición)
- Condiciones ambientales adversas
- Ataque temerario

### Niveles de Dificultad

El GM (o el juego) establece la **dificultad**:

| Dificultad | Objetivo | Ejemplo |
|------------|----------|---------|
| **Fácil** | 6+ | Escalar un muro bajo con agarre |
| **Normal** | 7+ | Persuadir a un guardia distraído |
| **Difícil** | 9+ | Hackear una cerradura compleja |
| **Épica** | 11+ | Saltar sobre un abismo mortal |

---

## ⚔️ COMBATE TÁCTICO

### Flujo de Combate

1. **Turno del Jugador:** Elige acción
2. **Resolución:** Tira dados
3. **Turno de Enemigos:** Cada enemigo ataca
4. **Repetir** hasta victoria o derrota

### Acciones en Combate

#### 1. 🗡️ Atacar

**Opciones:**
- **Ataque de FUE:** Cuerpo a cuerpo, daño sólido
- **Ataque de AGI:** A distancia, más preciso

**Tirada:** `2d6 + Atributo + Bono de Arma` vs **DEF del enemigo**

**Daño según Resultado:**
- **Crítico (12+):** 2 Heridas al enemigo
- **Éxito (10-11):** 1 Herida al enemigo
- **Parcial (7-9):** 1 Herida + consecuencia (ej: gastas 1 fatiga)
- **Fallo (2-6):** 0 daño + TÚ recibes 1-2 heridas

**Ejemplo de Combate:**
```
Enemigo: Bandido (DEF 7, 3 HP)
Tu FUE: 3
Arma: Espada (+1)

Turno 1:
Tiras: [5, 4] +3 FUE +1 espada = 13 🌟 Crítico!
Daño: 2 heridas
Bandido: 1/3 HP
Bono: "ganas ventaja táctica para tu próxima acción"

Turno 2:
Tiras con VENTAJA: [6, 5, 2] → [6, 5] +4 = 15
Daño: 2 heridas
Bandido: -1/3 HP → ¡DERROTADO!
```

#### 2. 🛡️ Defender

**Efecto:** Reduces el daño del próximo ataque enemigo

**Cuándo usar:**
- Estás con 1 HP
- Esperas refuerzos
- Enemigo muy poderoso

#### 3. 🧪 Usar Item

**Ejemplos:**
- **Poción de Curación:** +2 Heridas
- **Poción de Agilidad:** +2 AGI por 3 turnos
- **Bomba de Humo:** Escapar del combate

#### 4. 🏃 Huir

**Tirada:** `2d6 + AGI` vs **Dificultad 7**

**Resultado:**
- **Éxito:** Escapas del combate
- **Fallo:** Recibes 1 herida y combate continúa

**Cuándo huir:**
- Estás superado en número
- Sin recursos (pociones, fatiga)
- Enemigo muy superior

### Estrategia de Combate

**Tips Tácticos:**

1. **Prioriza Objetivos:**
   - Elimina enemigos débiles primero
   - O enfócate en el más peligroso

2. **Gestiona Recursos:**
   - Guarda pociones para emergencias
   - No gastes toda la fatiga temprano

3. **Busca Ventaja:**
   - Aturde enemigos con habilidades
   - Posiciónate tácticamente

4. **Conoce Cuándo Retirarte:**
   - Si tienes 1 HP, considera huir
   - Vivir para luchar otro día

---

## 👥 INTERACCIÓN CON NPCs

### Memoria de NPCs

**Los NPCs recuerdan tus acciones.** Cada interacción modifica su:

- **Relación:** -100 (enemigo) a +100 (aliado íntimo)
- **Confianza:** 0-100 (qué tan confiable eres)
- **Estado de Ánimo:** hostile, suspicious, neutral, friendly, devoted

### Tipos de Interacción

#### 1. 💬 Diálogo

**El sistema recuerda:**
- Promesas que haces
- Secretos que compartes
- Mentiras que dices

**Ejemplo:**
```
NPC: "¿Podrías llevar esta carta a mi hermano?"

Opción A: "Sí, lo haré" → +10 relación, promesa registrada
Opción B: "No tengo tiempo" → -5 relación
Opción C: [Mentir] "Sí" pero no lo haces → -20 confianza (si descubre)
```

#### 2. 🎁 Regalos

**Efecto:** +5 a +20 relación según valor del item

**Estrategia:**
- Regala items que le gustan al NPC
- Acepta regalos (aumenta confianza)

#### 3. ⚔️ Combate Conjunto

**Si ayudas a un NPC:**
- +15 relación
- Tag especial: "saved-life"
- Puede deber un favor

#### 4. 🤝 Favores

**Pedir Favor:**
- Requiere relación alta (friendly+)
- Consumidor (reduce relación)

**Hacer Favor:**
- +10 relación
- NPC puede devolver el favor más tarde

### Descubriendo Secretos

**Cada NPC tiene un secreto** (generado proceduralmente):

**Severidad:**
- **Minor:** 40-70% probabilidad de compartir
- **Moderate:** 20-40% probabilidad
- **Major:** 5-20% probabilidad

**Cómo descubrir secretos:**
1. **Alta confianza:** Friendly o Devoted
2. **Contexto adecuado:** En privado, situación tensa
3. **Persuasión exitosa:** Tirada de SAB

**Ejemplo:**
```
NPC: Mirwen la Mercader
Secreto: "Trabaja como espía para una facción enemiga" (Major, 12%)
Relación actual: 65 (Friendly)
Confianza: 70

Acción: [SAB] Presionar sobre sus lealtades
Tirada: 2d6 + SAB vs Dificultad Difícil (9)
Dados: [5, 5] + 2 = 12 🌟 Crítico!

Resultado: Mirwen revela su secreto y pide tu ayuda
Nuevo questline desbloqueado: "El Espía Doble"
```

### Motivaciones de NPCs

Cada NPC tiene una **motivación primaria**:

1. **Gold:** Necesita oro para una deuda
2. **Power:** Busca ascender en jerarquía
3. **Knowledge:** Investiga secretos prohibidos
4. **Revenge:** Busca venganza
5. **Love:** Protege a alguien querido
6. **Survival:** Solo quiere sobrevivir
7. **Redemption:** Busca redimirse
8. **Duty:** Cumple su deber sin importar qué
9. **Freedom:** Lucha contra opresión
10. **Faith:** Sigue su fe ciegamente

**Usa esto a tu favor:**
- Ofrece ayuda con su motivación
- Entiende sus acciones en contexto

---

## 🏆 SISTEMA DE REPUTACIÓN

### Facciones del Juego

**Griswald tiene 3 facciones principales:**

1. **Casa Von Hess**
   - Nobleza corrupta
   - Control político
   - Buscan dominar el Silencio

2. **El Círculo del Eco**
   - Magos restauradores
   - Luchan contra la Plaga
   - Investigan el Velo

3. **El Culto del Silencio**
   - Fanáticos de la entropía
   - Adoran el Velo
   - Quieren acelerar la Plaga

### Niveles de Reputación

| Puntos | Actitud | Efecto |
|--------|---------|--------|
| **+80 a +100** | 🌟 Devoted | Aliado leal |
| **+40 a +79** | 😊 Friendly | Te ayudan activamente |
| **-39 a +39** | 😐 Neutral | Trato estándar |
| **-40 a -79** | 😠 Unfriendly | Desconfían de ti |
| **-80 a -100** | 💀 Hostile | ¡Te atacan! |

### Cómo Ganar/Perder Reputación

**Ganar Reputación (+):**
- Completar quests para la facción (+10 a +30)
- Ayudar a NPCs de la facción (+5 a +15)
- Donar oro a la causa (+1 por 10 oro)
- Defender territorio de la facción (+20)

**Perder Reputación (-):**
- Atacar NPCs de la facción (-30 a -50)
- Fallar quests importantes (-10 a -20)
- Traicionar confianza (-40)
- Ayudar a facción enemiga (-10 indirecto)

**Ejemplo de Cadena:**
```
Inicio: Casa Von Hess = 0, Círculo Eco = 0, Culto = 0

Acción 1: Ayudas al Círculo del Eco (+20)
Resultado: Casa Von Hess = -6, Círculo Eco = +20, Culto = -10
(Enemigos del Círculo te ven peor)

Acción 2: Completas quest del Círculo (+15)
Resultado: Casa Von Hess = -10, Círculo Eco = +35, Culto = -17

Estado: Neutral con Von Hess, Friendly con Eco, Unfriendly con Culto
```

### Relaciones entre Facciones

**Matriz de Enemistades:**
- Casa Von Hess ↔ Círculo Eco: **-0.3** (tensos)
- Círculo Eco ↔ Culto Silencio: **-0.5** (enemigos)
- Casa Von Hess ↔ Culto Silencio: **-0.5** (enemigos)

**Esto significa:**
- +10 con Círculo Eco = -3 con Von Hess, -5 con Culto

**Estrategia:**
- No puedes agradar a todos
- Elige un bando temprano
- O mantente neutral (más difícil)

### Beneficios de Alta Reputación

**+50 (Friendly):**
- ✅ Información exclusiva disponible
- ✅ NPCs comparten rumores

**+60:**
- ✅ Acceso a items especiales en tiendas
- ✅ 20% descuento en compras

**+70:**
- ✅ Puedes pedir favores
- ✅ NPCs te ayudan en combate

**+80 (Devoted):**
- ✅ Refugio seguro en territorio
- ✅ 30% descuento en compras
- ✅ Misiones especiales desbloqueadas

### Penalizaciones de Baja Reputación

**-60:**
- ⚠️ NPCs hostiles te atacan
- ⚠️ 20% sobreprecio en compras

**-70:**
- ⚠️ Acceso restringido a ciertas áreas
- ⚠️ Guardias te interrogan

**-80:**
- 💀 Attack on sight (todos te atacan)
- 💀 40% sobreprecio (si aceptan comerciar)

**-90:**
- 💀 **Recompensa por tu cabeza** (100-500 oro)
- 💀 Cazarrecompensas te buscan activamente

---

## 💰 COMERCIO Y ECONOMÍA

### Precios Dinámicos

**Los precios NO son fijos.** Dependen de:

1. **Tipo de comerciante:** Multiplicador base
2. **Tu reputación con su facción**
3. **Tu relación personal con el NPC**

**Fórmula de Compra:**
```
Precio Final = Precio Base × Multiplicador Comerciante × Modificador Reputación
```

**Ejemplo Real:**
```
Item: Espada de Acero (Valor base: 100 oro)
Comerciante: Herrero Von Hess (multiplicador: 1.2)
Tu reputación Von Hess: +70 (Friendly)
Modificador: 0.9 (10% descuento)

Precio Final: 100 × 1.2 × 0.9 = 108 oro

VS.

Con reputación -60 (Unfriendly):
Modificador: 1.2 (20% sobreprecio)
Precio Final: 100 × 1.2 × 1.2 = 144 oro
```

### Tabla de Modificadores

| Reputación | Compras | Ventas | Efecto |
|------------|---------|--------|--------|
| +80 | ×0.7 | ×1.3 | ¡30% descuento! |
| +60 | ×0.8 | ×1.2 | 20% descuento |
| +40 | ×0.9 | ×1.1 | 10% descuento |
| 0 | ×1.0 | ×1.0 | Precio normal |
| -40 | ×1.2 | ×0.8 | 20% sobreprecio |
| -60 | ×1.4 | ×0.6 | 40% sobreprecio |
| -80 | ×1.6 | ×0.5 | ¡60% sobreprecio! |

### Tipos de Comerciantes

1. **Tienda General:** Vende todo, precios estándar
2. **Herrero:** Armas y armaduras, +20% precio
3. **Alquimista:** Pociones, +30% precio
4. **Perista:** Items robados, -20% precio
5. **Comerciante de Facción:** Solo si tienes buena reputación

### Estrategias de Comercio

**Maximizar Ganancias:**

1. **Vende en Friendly o mejor** (×1.1 o más)
2. **Compra en Neutral o mejor** (evita sobreprecios)
3. **Busca peristas para vender loot** (compran todo)
4. **Completa quests para desbloquear descuentos**

**Ejemplo de Optimización:**
```
Loot del dungeon: 5 espadas (valor 100 c/u)

Opción A: Vender al herrero Von Hess (rep: -20)
Modificador: ×1.0 (neutral)
Ganancia: 5 × 100 × 0.5 × 1.0 = 250 oro

Opción B: Vender al perista del Círculo Eco (rep: +60)
Modificador: ×1.2 (friendly)
Ganancia: 5 × 100 × 0.5 × 1.2 = 300 oro

¡50 oro extra por elegir bien!
```

---

## 📜 QUESTS Y NARRATIVA

### Tipos de Quests

#### 1. 📖 Main Quest
- Historia principal
- Obligatorias para avanzar
- Recompensas mayores

#### 2. 🌟 Side Quests
- Opcionales
- Exploran personajes y lore
- Pueden afectar main quest

#### 3. ⚡ Eventos Aleatorios
- Procedurales
- Basados en ubicación y reputación
- Consecuencias inmediatas

#### 4. 🔁 Quests Generadas
- Procedurales dinámicas
- "Escolta", "Cacería", "Entrega"
- Recompensas estándar

### Decisiones Críticas

**El juego registra tus decisiones importantes:**

**Ejemplo de Decisión Ramificada:**
```
Situación: El Eremita te pide entregar un artefacto al Círculo del Eco

Opción A: Entregar al Círculo
- Consecuencias:
  * +30 reputación Círculo Eco
  * -20 reputación Casa Von Hess
  * Desbloquea questline "La Restauración"
  * El Eremita te considera aliado

Opción B: Vender a Casa Von Hess
- Consecuencias:
  * +500 oro
  * +30 reputación Von Hess
  * -40 reputación Círculo Eco
  * El Eremita te considera traidor
  * Desbloquea questline "El Poder Corrupto"

Opción C: Quedarte el artefacto
- Consecuencias:
  * Item poderoso
  * -20 reputación con AMBAS facciones
  * El Eremita te maldice (-1 SUE permanente)
  * Cazado por ambos bandos
```

### Múltiples Finales

**El Prólogo tiene 2+ finales:**

1. **Final del Eco:** Ayudas al Círculo, debilitas el Velo
2. **Final de Von Hess:** Entregas poder a la nobleza
3. **Final del Culto:** Aceleras la Plaga (secreto)
4. **Final Neutral:** Sobrevives sin tomar partido

**Tu final depende de:**
- Decisiones críticas tomadas
- Reputación final con facciones
- Si completaste side quests clave
- Si descubriste secretos importantes

---

## 🎯 ESTRATEGIAS AVANZADAS

### Builds Optimizados

#### Build 1: Guerrero Táctico
```
FUE: 4, AGI: 2, SAB: 1, SUE: 2
Ventajas:
- Alto daño en combate (2 heridas consistentes)
- Buena defensa
- Ideal para combate directo

Desventajas:
- Bajo en habilidades sociales
- Poca versatilidad

Estrategia:
- Usa armas de FUE (+bono)
- Enfócate en Casa Von Hess (aprecian fuerza)
- Resuelve problemas con violencia
```

#### Build 2: Ladrón Versátil
```
FUE: 2, AGI: 4, SAB: 2, SUE: 2
Ventajas:
- Sigilo y precisión
- Huir es viable
- Versatil en exploracion

Desventajas:
- Daño moderado
- Heridas bajas

Estrategia:
- Ataca con AGI desde distancia
- Usa sigilo para evitar combates
- Explora todas las opciones
```

#### Build 3: Mago Manipulador
```
FUE: 1, AGI: 2, SAB: 4, SUE: 2
Ventajas:
- Domina interacciones sociales
- Descubre secretos fácilmente
- Alta versatilidad mágica

Desventajas:
- Débil en combate directo
- Necesita gestión de fatiga

Estrategia:
- Únete al Círculo del Eco temprano
- Persuade en lugar de luchar
- Descubre todos los secretos
```

### Gestión de Recursos

**Regla de Oro:** Siempre ten al menos:
- 1 Poción de Curación
- 50 oro para emergencias
- 1 punto de fatiga reservado

**Prioridades de Gasto:**
1. **Emergencia:** Pociones de curación
2. **Inversión:** Armas/armadura mejores
3. **Social:** Regalos para NPCs clave
4. **Lujo:** Items cosméticos

### Maximizar XP

**Mejores fuentes de XP:**
1. **Combates:** 1-3 XP por victoria
2. **Quests:** 5-10 XP por quest
3. **Descubrimientos:** 2-5 XP por secreto/área
4. **Decisiones Críticas:** 5 XP por decisión mayor

**Estrategia de Farming:**
- Completa side quests antes de main quest
- Explora todo el mapa
- Habla con todos los NPCs
- Descubre todos los secretos

### Secretos y Easter Eggs

**Interacciones Ocultas:**

1. **Nombres de NPCs:** Algunos responden a nombres específicos del lore
2. **Seeds Especiales:** Ciertos seeds generan NPCs únicos
3. **Combinaciones de Items:** Algunos items interactúan entre sí
4. **Diálogos Secretos:** Con reputación Devoted, desbloqueas diálogos únicos

**Ejemplo:**
```
Seed especial: "GRISWALD-ETERNAL-AUTUMN"
Efecto: Genera un NPC llamado "El Archivista" con información del lore
completo del mundo
```

---

## 🏆 CHECKLIST DEL JUGADOR MAESTRO

### Combate
- [ ] Conseguiste un crítico en combate
- [ ] Derrotaste un enemigo sin recibir daño
- [ ] Escapaste exitosamente de un combate imposible
- [ ] Usaste ventaja táctica a tu favor

### Social
- [ ] Alcanzaste Friendly con una facción
- [ ] Descubriste el secreto de un NPC
- [ ] Hiciste y cumpliste una promesa
- [ ] Traicionaste a alguien (y viviste para contarlo)

### Economía
- [ ] Compraste con 30% de descuento
- [ ] Vendiste loot por más de 500 oro
- [ ] Negociaste con un mercader hostile

### Narrativa
- [ ] Completaste todas las side quests de una zona
- [ ] Tomaste una decisión crítica que cambió la historia
- [ ] Descubriste un final secreto
- [ ] Desbloqueaste un questline oculto

---

## 💡 TIPS FINALES

1. **Guarda a menudo** (el juego tiene múltiples slots)
2. **Experimenta con diferentes seeds** (cada uno genera NPCs únicos)
3. **Lee con atención** (pistas importantes están en los diálogos)
4. **No tengas miedo de fallar** (los fallos son parte de la narrativa)
5. **Tus decisiones importan** (el juego recuerda TODO)
6. **Explora exhaustivamente** (hay secretos en todas partes)
7. **Gestiona tu reputación** (no puedes agradar a todos)
8. **Aprovecha el sistema de memoria** (los NPCs recuerdan tus acciones)

---

**¡Buena suerte en tu aventura por Griswald!**

*Que el Canto te proteja del Silencio.*

🎲🎭⚔️
