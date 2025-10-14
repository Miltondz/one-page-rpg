Entendido. A continuación, presento las versiones finales de los 14 archivos JSON que componen la base de datos de "El Lamento de la Aguja de Hueso". Cada archivo viene precedido por una guía clara y concisa que explica su propósito, cómo se debe rellenar y qué opciones están disponibles para cada campo clave.

Esta documentación servirá como la "guía del desarrollador" para el motor narrativo, asegurando que cualquier contenido futuro se cree de forma consistente y compatible.

---

### **Guía de Archivos JSON y Versiones Finales**

#### **1. `config/game_config.json`**

*   **Propósito:** Define los parámetros globales y las reglas fundamentales del juego. Este archivo se lee una vez al iniciar la aplicación.
*   **Instrucciones de Llenado:** Modifica estos valores para ajustar el balance general del juego. `xp_per_level` define la curva de progresión. `default_world` establece el punto de partida para una nueva partida.
*   **Opciones Disponibles:**
    *   `attributes`: Lista de los atributos principales usados en las tiradas.
    *   `xp_per_level`: Número de XP necesarios para subir de nivel. Puede ser un número (curva plana) o un array (curva progresiva).

```json
{
  "game": {
    "name": "El Lamento de la Aguja de Hueso",
    "version": "1.1.0",
    "default_world": "griswald",
    "starting_level": 1,
    "max_level": 10
  },
  "mechanics": {
    "attributes": ["FUE", "AGI", "SAB", "SUE"],
    "base_wounds": 3,
    "base_fatigue": 3,
    "xp_per_level": 3,
    "inventory_slots": 10,
    "starting_gold": 5
  }
}
```

---

#### **2. `worlds/worlds.json`**

*   **Propósito:** Contiene la información de alto nivel sobre los mundos del juego, incluyendo sus facciones y conflictos globales.
*   **Instrucciones de Llenado:** Cada mundo tiene un ID único. Las facciones se definen aquí con sus relaciones base (un número de -100 a 100).
*   **Opciones Disponibles:**
    *   `alignment`: `lawful_good`, `neutral_good`, `chaotic_good`, `lawful_neutral`, `true_neutral`, `chaotic_neutral`, `lawful_evil`, `neutral_evil`, `chaotic_evil`.
    *   `type`: `dark_fantasy`, `high_fantasy`, `sci_fi`, `steampunk`, etc.

```json
{
  "worlds": {
    "griswald": {
      "id": "griswald",
      "name": "Griswald, la Baronía Fronteriza",
      "description": "Una tierra moribunda y aislada, perpetuamente nublada y atrapada en un otoño eterno, donde la magia del Canto se desvanece y viejos horrores despiertan.",
      "type": "dark_fantasy",
      "factions": [
        {
          "id": "casa_von_hess",
          "name": "Casa Von Hess",
          "alignment": "lawful_evil",
          "goal": "Controlar el poder del Silencio para imponer un orden absoluto.",
          "relationships": { "culto_silencio": -10, "circulo_eco": -50 }
        },
        {
          "id": "culto_silencio",
          "name": "El Culto del Silencio",
          "alignment": "chaotic_neutral",
          "goal": "Ayudar a la Plaga a consumir el mundo, creyendo que es una purificación divina.",
          "relationships": { "casa_von_hess": -10, "circulo_eco": -80 }
        },
        {
          "id": "circulo_eco",
          "name": "El Círculo del Eco",
          "alignment": "neutral_good",
          "goal": "Encontrar el Corazón Resonante para restaurar el Canto y detener al Velo.",
          "relationships": { "casa_von_hess": -50, "culto_silencio": -80 }
        }
      ],
      "global_conflicts": [
        "La Plaga del Silencio se expande, robando la voz y la voluntad de la gente.",
        "El Velo, una dimensión de entropía, se está filtrando en la realidad.",
        "El Barón Von Hess explota la crisis para afianzar su poder."
      ],
      "magic_system": {
        "type": "dualistic",
        "description": "El mundo está regido por la lucha entre la Magia Resonante (vida, sonido) y la Entropía Silente (vacío, olvido)."
      }
    }
  }
}
```

---

#### **3. `characters/races.json`**

*   **Propósito:** Define las razas jugables. En nuestro caso, solo Humanos para mantener el enfoque.
*   **Instrucciones de Llenado:** `base_attributes` son los modificadores iniciales. `traits` son palabras clave para el LLM o mecánicas futuras.

```json
{
  "races": {
    "human": {
      "id": "human",
      "name": "Humano",
      "description": "Resilientes, desesperados y atrapados en medio del conflicto. Su mayor fortaleza y debilidad es su voluntad de sobrevivir a cualquier precio.",
      "base_attributes": { "FUE": 0, "AGI": 0, "SAB": 0, "SUE": 0 },
      "traits": ["adaptable", "determined"]
    }
  }
}
```

---

#### **4. `characters/classes.json`**

*   **Propósito:** Define los arquetipos de jugador. Para nuestro "One Page RPG", usamos una clase genérica "Aventurero".
*   **Instrucciones de Llenado:** `starting_equipment` es una lista de IDs de objetos del archivo `items.json` que el jugador puede elegir al inicio.

```json
{
  "classes": {
    "adventurer": {
      "id": "adventurer",
      "name": "Aventurero",
      "description": "Un alma errante, marcada por el destino, que debe usar su ingenio, fuerza y suerte para navegar por un mundo que se desmorona.",
      "primary_attributes": ["FUE", "AGI", "SAB", "SUE"],
      "starting_equipment": ["espada_simple", "arco_caza", "grimorio_basico", "amuleto_suerte"]
    }
  }
}
```

---

#### **5. `characters/npcs.json`**

*   **Propósito:** Base de datos de todos los personajes no jugables.
*   **Instrucciones de Llenado:** `key_npcs` son personajes únicos. `secondary_npcs` son personajes con nombre pero menos impacto en la trama. `archetypes` son para PNJ genéricos. `relationship_start` define la actitud inicial.
*   **Opciones Disponibles:**
    *   `location`: ID de la localización donde se encuentra el NPC.

```json
{
  "archetypes": {
    "thug": { "description": "Músculo a sueldo, leal solo al dinero." },
    "crime_boss": { "description": "Inteligente, despiadado y siempre buscando una ventaja." },
    "hermit": { "description": "Un recluso que posee conocimientos prohibidos." },
    "fanatic": { "description": "Un líder carismático consumido por una fe peligrosa." }
  },
  "key_npcs": {
    "alenko_la_rata": {
      "id": "alenko_la_rata", "name": "'La Rata' Alenko", "archetype": "crime_boss", "race": "human",
      "location": "murogris_ciudad", "quests_given": ["prologo_deuda_ecos"], "relationship_start": -30
    },
    "eremita_eco": {
      "id": "eremita_eco", "name": "El Eremita del Eco", "archetype": "hermit", "race": "human",
      "location": "cueva_aislada", "knowledge": ["velo_dimension", "corazon_resonante", "historia_real_plaga"]
    },
    "malakai_profeta": { "id": "malakai_profeta", "name": "Malakai, el Profeta Mudo", "archetype": "fanatic", "race": "human", "location": "arroyo_aullido_pueblo" }
  },
  "secondary_npcs": {
    "grol_thug": { "id": "grol_thug", "name": "Grol", "archetype": "thug", "race": "human", "location": "murogris_ciudad" },
    "finch_thug": { "id": "finch_thug", "name": "Finch", "archetype": "thug", "race": "human", "location": "murogris_ciudad" },
    "gregor_tabernero": { "id": "gregor_tabernero", "name": "Gregor", "archetype": "civilian", "race": "human", "location": "arroyo_aullido_pueblo" }
  }
}
```

---

#### **6. `creatures/creatures.json`**

*   **Propósito:** Bestiario del juego. Define las estadísticas, habilidades y botín de los enemigos.
*   **Instrucciones de Llenado:** `stats` debe coincidir con las mecánicas del juego (DEF es la dificultad para golpearlo, Heridas es su salud). Las `abilities` tienen un bloque `mechanic` para que el motor las ejecute. `enemy_pools` se usa para encuentros procedurales.
*   **Opciones Disponibles:**
    *   `mechanic.type`: `SPECIAL_ATTACK`, `AURA`, `SUMMON`, `PASSIVE`.
    *   `mechanic.effect`: `DEAL_DAMAGE`, `APPLY_STATUS`, `APPLY_MODIFIER`, `HEAL`.

```json
{
  "enemy_pools": {
    "level_1_3": ["susurrante", "rastrero_hueso", "guardia_silencio"],
    "level_4_6": ["salmodiante", "coleccionista_voces"]
  },
  "enemies": {
    "susurrante": {
      "id": "susurrante", "name": "Susurrante", "level": 2,
      "stats": { "FUE": 1, "AGI": 4, "DEF": 7, "Heridas": 2 },
      "abilities": [{ "id": "drenaje_sombra", "name": "Drenaje de Sombra", "mechanic": { "type": "SPECIAL_ATTACK", "effect": "DEAL_DAMAGE", "damage_type": "fatigue", "power": 1 } }],
      "loot_table": { "common": ["eco_atrapado"], "uncommon": ["fragmento_sombra"] },
      "description": "Ecos de almas perdidas, formados por polvo y oscuridad."
    },
    "rastrero_hueso": {
      "id": "rastrero_hueso", "name": "Rastrero de Hueso", "level": 3,
      "stats": { "FUE": 3, "AGI": 3, "DEF": 6, "Heridas": 3 },
      "loot_table": { "common": ["fragmento_hueso_retorcido"] },
      "description": "Una abominación arácnida hecha de huesos humanos y animales."
    },
    "guardia_silencio": {
      "id": "guardia_silencio", "name": "Guardia del Silencio", "level": 3,
      "stats": { "FUE": 3, "AGI": 2, "DEF": 7, "Heridas": 3 },
      "loot_table": { "common": ["garrote_tosc"], "uncommon": ["simbolo_silencio"] },
      "description": "Un aldeano fanático con una máscara de cuero sin boca."
    },
    "salmodiante": {
      "id": "salmodiante", "name": "El Salmodiante", "level": 4,
      "stats": { "FUE": 3, "AGI": 3, "DEF": 8, "Heridas": 4 },
      "abilities": [{ "id": "canto_debilitador", "name": "Canto Debilitador", "mechanic": { "type": "AURA", "effect": "APPLY_MODIFIER", "attribute": "SAB", "value": -1, "range": "scene" } }],
      "loot_table": { "common": ["daga_ritual"] },
      "description": "Un Guardia del Silencio de élite cuyo zumbido gutural debilita la voluntad."
    }
  },
  "bosses": {
    "coleccionista_voces": {
      "id": "coleccionista_voces", "name": "El Coleccionista de Voces", "level": 6,
      "stats": { "FUE": 4, "AGI": 3, "DEF": 9, "Heridas": 5 },
      "abilities": [{ "id": "aguja_quitinosa", "name": "Aguja Quitosa", "mechanic": { "type": "SPECIAL_ATTACK", "effect": "APPLY_STATUS", "status_id": "voluntad_rota" } }],
      "loot_table": { "guaranteed": ["laringe_cristal", "aguja_hueso_inacabada"] },
      "description": "Una abominación que extrae las voces con una aguja de hueso."
    }
  }
}
```

---

#### **7. `items/items.json`**

*   **Propósito:** Define todos los objetos del juego.
*   **Instrucciones de Llenado:** `type` diferencia entre categorías. El bloque `mechanic` define lo que el objeto hace en términos de juego.
*   **Opciones Disponibles:**
    *   `type`: `WEAPON`, `ARMOR`, `CONSUMABLE`, `QUEST_ITEM`, `MISC`.
    *   `mechanic.type`: `EQUIPMENT_BONUS`, `CONSUMABLE_EFFECT`.
    *   `mechanic.effect`: `RESTORE_WOUNDS`, `REMOVE_STATUS`, `APPLY_STATUS`.

```json
{
  "weapons": {
    "espada_simple": { "id": "espada_simple", "name": "Espada Simple", "type": "WEAPON", "mechanic": { "type": "EQUIPMENT_BONUS", "attribute": "FUE", "value": 1, "context": "COMBAT" } }
  },
  "consumables": {
    "balsamo_silente": {
      "id": "balsamo_silente", "name": "Bálsamo Silente", "type": "CONSUMABLE", "value": 25, "rarity": "uncommon",
      "mechanic": { "type": "CONSUMABLE_EFFECT", "effect": "APPLY_STATUS", "status_id": "perfect_stealth", "duration_hours": 1 }
    }
  },
  "quest_items": {
    "diente_sombra": { "id": "diente_sombra", "name": "Diente de Sombra", "type": "QUEST_ITEM", "description": "Un colmillo negro y frío que vibra cerca de la magia del Velo." }
  },
  "status_effects": {
    "perfect_stealth": { "id": "perfect_stealth", "name": "Sigilo Perfecto", "type": "BUFF", "description_mechanical": "Otorga éxito automático en tiradas de sigilo que no sean críticas." },
    "veneno_corruptor": { "id": "veneno_corruptor", "name": "Veneno Corruptor", "type": "DEBUFF", "description_mechanical": "Sufres 1 herida al final de tu turno.", "mechanic": { "type": "DAMAGE_OVER_TIME", "damage": 1, "attribute": "wounds", "interval": "end_of_turn" }, "duration_turns": 3 }
  }
}
```

---

#### **8. `locations/locations.json`**

*   **Propósito:** Describe todos los lugares del juego.
*   **Instrucciones de Llenado:** `key_locations` son lugares fijos. `interactables` define los puzzles y desafíos del entorno, cada uno con una tirada de `mechanic` asociada.
*   **Opciones Disponibles:**
    *   `interaction_type`: `CHALLENGE` (una tirada), `LOOT` (un contenedor), `DIALOGUE` (inicia una conversación).

```json
{
  "biomes": { "bosque_otoñal": { "id": "bosque_otoñal", "name": "Bosque Otoñal", "enemies": ["lobo", "susurrante"] } },
  "key_locations": {
    "murogris_ciudad": {
      "id": "murogris_ciudad", "name": "Ciudad de Murogris", "type": "settlement", "biome": "bosque_otoñal",
      "description": "Una ciudad portuaria sombría, llena de niebla, secretos y crimen.",
      "npcs": ["alenko_la_rata", "grol_thug", "finch_thug"], "services": ["inn", "blacksmith", "docks"]
    },
    "muelle_almacen_7": {
      "id": "muelle_almacen_7", "name": "Almacén 7 del Muelle", "type": "dungeon",
      "description": "Un almacén oscuro y decrépito al final del muelle, envuelto en una niebla antinatural.",
      "enemies": ["rastrero_hueso"],
      "interactables": [
        { "id": "ventana_superior_rota", "name": "Ventana Superior Rota", "interaction_type": "CHALLENGE", "mechanic": { "attribute": "AGI", "difficulty": 8 } },
        { "id": "cofre_principal", "name": "Cofre de Alenko", "interaction_type": "LOOT", "is_locked": true, "mechanic": { "attribute": "FUE", "difficulty": 9, "description": "Forzar la cerradura" } }
      ]
    },
    "arroyo_aullido_pueblo": { "id": "arroyo_aullido_pueblo", "name": "Arroyo del Aullido", "type": "settlement", "description": "El epicentro de la Plaga del Silencio, un pueblo aterrorizado y mudo.", "npcs": ["malakai_profeta", "gregor_tabernero"] }
  }
}
```

---

#### **9. `quests/quests.json`**

*   **Propósito:** Define las misiones principales de la historia.
*   **Instrucciones de Llenado:** Cada objetivo tiene un `completion_trigger` que le dice al motor cuándo se ha completado ese paso.
*   **Opciones Disponibles:**
    *   `completion_trigger.event`: `ENTER_LOCATION`, `ITEM_ACQUIRED`, `DECISION_MADE`, `NPC_TALKED_TO`, `ENEMY_DEFEATED`.

```json
{
  "story_quests": {
    "prologo_deuda_ecos": {
      "id": "prologo_deuda_ecos", "name": "La Deuda del Ladrón de Ecos", "type": "main", "act": 0, "giver": "alenko_la_rata",
      "description": "Paga tu deuda con 'La Rata' Alenko recuperando un misterioso cargamento del muelle.",
      "objectives": [
        { "text": "Infiltrate en el Almacén 7.", "completion_trigger": { "event": "ENTER_LOCATION", "location_id": "muelle_almacen_7" } },
        { "text": "Recupera la caja.", "completion_trigger": { "event": "ITEM_ACQUIRED", "item_id": "caja_sellada_velo" } },
        { "text": "Decide el destino de la caja.", "completion_trigger": { "event": "DECISION_MADE", "decision_id": "prologo_caja_destino" } }
      ],
      "rewards": { "xp": 2, "gold": 0 }, "next_quest": "lamento_aguja_hueso"
    },
    "lamento_aguja_hueso": {
      "id": "lamento_aguja_hueso", "name": "El Lamento de la Aguja de Hueso", "type": "main", "act": 1,
      "description": "El misterio de la caja te lleva a buscar el origen de una plaga que roba la voz y el alma.",
      "objectives": [ { "text": "Viaja a Arroyo del Aullido e investiga la plaga.", "completion_trigger": { "event": "ENTER_LOCATION", "location_id": "arroyo_aullido_pueblo" } } ]
    }
  }
}
```

---

#### **10. `quests/sidequest_generator.json`**

*   **Propósito:** Proporciona los bloques de construcción para crear misiones secundarias procedurales e infinitas.
*   **Instrucciones de Llenado:** Añade más componentes a cada lista (`givers`, `actions`, `targets`, etc.) para aumentar exponencialmente la variedad de misiones generadas.

```json
{
  "templates": [ "{giver} en {location_giver} necesita que alguien {action} un/a {target} que se encuentra en {location_target}, pero {complication}." ],
  "components": {
    "givers": [ { "text": "Un granjero preocupado" }, { "text": "Un guardia paranoico" }, { "text": "Un alquimista excéntrico" } ],
    "locations_giver": ["una posada lúgubre", "un puesto de guardia solitario", "una tienda polvorienta"],
    "actions": ["recupere", "investigue", "destruya", "entregue"],
    "targets": [ { "id": "herencia_familiar", "text": "herencia familiar perdida" }, { "id": "componente_alquimico", "text": "componente alquímico raro" } ],
    "locations_target": [ { "id": "minas_olvidadas", "text": "las Minas Olvidadas", "enemies": ["rastrero_hueso"] }, { "id": "una cueva infestada", "text": "una cueva infestada", "enemies": ["susurrante"] } ],
    "complications": [ { "id": "custodiado", "text": "está custodiado por una criatura inesperada", "effect": { "spawn_enemy_pool": "level_1_3" } }, { "id": "mentira", "text": "la persona que te contrató te mintió sobre su verdadero propósito", "effect": { "trigger_decision": "confront_giver" } } ],
    "rewards_pool": { "medium": { "gold": "25-40", "xp": 1, "item": "random_consumable" } }
  }
}
```

---

#### **11. `story/decisions.json`**

*   **Propósito:** Define los puntos de inflexión narrativos clave. Es el corazón de los callbacks y las consecuencias.
*   **Instrucciones de Llenado:** `immediate_effects` se aplican al instante (añadir/quitar objetos, establecer `worldFlags`). `long_term_consequences` apuntan a ramas de la historia que alterarán el futuro.
*   **Opciones Disponibles:**
    *   `immediate_effects`: `set_world_flag`, `add_item`, `remove_item`, `add_gold`, `change_relationship`.

```json
{
  "critical_decisions": {
    "prologo_caja_destino": {
      "id": "prologo_caja_destino", "act": 0, "situation": "Has recuperado la caja con artefactos del Velo. ¿Qué haces con ella?",
      "choices": [
        {
          "id": "entregar_caja", "text": "Entregarle la caja a Alenko.",
          "immediate_effects": { "set_world_flag": { "alenko_status": "neutral_ally" }, "change_relationship": { "npc_id": "alenko_la_rata", "value": 50 } },
          "long_term_consequences": { "story_branch": "poder_desatado_murogris" }
        },
        {
          "id": "destruir_caja", "text": "Arrojar la caja al mar.",
          "immediate_effects": { "set_world_flag": { "alenko_status": "hostile_enemy" }, "change_relationship": { "npc_id": "alenko_la_rata", "value": -100 } },
          "long_term_consequences": { "story_branch": "enemigo_en_las_sombras" }
        },
        {
          "id": "huir_con_caja", "text": "Huir de la ciudad con la caja.",
          "immediate_effects": { "set_world_flag": { "alenko_status": "hostile_hunter" }, "add_item": "caja_sellada_velo", "change_relationship": { "npc_id": "alenko_la_rata", "value": -100 } },
          "long_term_consequences": { "story_branch": "guardian_marcado" }
        }
      ]
    }
  }
}
```

---

#### **12. `story/lore.json`**

*   **Propósito:** Contiene textos de lore para ser mostrados en libros, inscripciones o diálogos.
*   **Instrucciones de Llenado:** `timeline` estructura la historia del mundo. `concepts` explica elementos clave del lore que el jugador puede investigar.

```json
{
  "timeline": {
    "edad_cancion": { "name": "La Edad de la Canción", "events": ["El mundo es 'cantado' a la existencia."] },
    "edad_reyes_sacerdotes": { "name": "La Edad de los Reyes-Sacerdotes", "events": ["El Rey Vorlag busca el silencio absoluto para alcanzar la inmortalidad."] },
    "silencio_desgarrador": { "name": "El Silencio Desgarrador", "events": ["Un ritual fallido rompe la barrera con el Velo, colapsando el antiguo imperio."] },
    "edad_susurros": { "name": "La Edad de los Susurros", "events": ["La magia del Canto es débil y la herida del Velo amenaza con reabrirse."] }
  },
  "concepts": {
    "velo": { "name": "El Velo", "description": "Un 'reverso' espiritual y silencioso del mundo, de donde proviene la Entropía Silente." },
    "ecos": { "name": "Los Ecos", "description": "Espíritus del Silencio corrompidos por el mundo físico, que se convierten en monstruos como los Susurrantes." }
  }
}
```

---

#### **13. `story/dialogs.json`**

*   **Propósito:** Almacena todos los diálogos pre-escritos. Es la base para las interacciones con NPCs.
*   **Instrucciones de Llenado:** `greetings` y `topics` pueden ser condicionales, usando `relationship_less_than/greater_than` o `world_flag_is_set`. El motor elegirá el primer diálogo cuya condición se cumpla. `{player_name}` es un token que se reemplaza dinámicamente.

```json
{
  "templates": { "greeting": ["¿Qué quieres?", "Date prisa, no tengo todo el día."], "farewell": ["Lárgate.", "Ten cuidado ahí fuera."] },
  "npc_dialogs": {
    "alenko_la_rata": {
      "greetings": [
        { "condition": { "world_flag_is_set": "alenko_status:hostile_enemy" }, "text": "Tú... Tienes agallas para volver a mi ciudad." },
        { "condition": { "relationship_greater_than": 30 }, "text": "Ah, mi socio más prometedor. Pasa, hablemos de negocios." },
        { "condition": "default", "text": "Así que este es el que causa tantos problemas..." }
      ],
      "topics": {
        "quest_offer": "Tengo... una oportunidad de negocio para ti. Recupera mi caja y tu deuda quedará saldada.",
        "callback_thugs_defeated": "He oído que mis chicos tuvieron un... accidente. Tienes agallas. O eres muy estúpido. Espero que sea lo primero.",
        "threat": "Si me fallas... Grol se asegurará de que nunca más vuelvas a caminar."
      }
    }
  }
}
```

---

#### **14. `events/random_encounters.json`**

*   **Propósito:** Colección de eventos raros y únicos que pueden ocurrir durante el viaje.
*   **Instrucciones de Llenado:** Cada encuentro tiene una `rarity`, `conditions` para aparecer, y `choices` con consecuencias mecánicas claras.
*   **Opciones Disponibles:**
    *   `rarity`: `common` (30%+), `uncommon` (10-29%), `rare` (1-9%).
    *   `consequence`: Puede usar cualquiera de los efectos definidos en `decisions.json`, además de `start_combat`, `add_quest`, `add_gold`, etc.

```json
{
  "encounters": [
    {
      "id": "el_mercader_caido", "name": "El Mercader Caído", "rarity": "common", "conditions": { "location_type": "road" },
      "description": "Encuentras una carreta destrozada. Cerca, un mercader moribundo te entrega un amuleto y te pide que se lo lleves a su familia en Murogris.",
      "choices": [
        { "text": "Honrar su último deseo.", "consequence": { "add_quest": "el_amuleto_del_mercader", "set_world_flag": { "mercader_ayudado": true } } },
        { "text": "Saquear la carreta.", "mechanic": { "attribute": "SUE", "difficulty": 7 }, "consequence": { "on_success": { "add_gold": 30, "set_world_flag": { "mercader_saqueado": true } } } }
      ]
    },
    {
      "id": "el_musico_silente", "name": "El Músico Silente", "rarity": "uncommon", "conditions": { "time_of_day": "night" },
      "description": "En la oscuridad, encuentras a un hombre tocando un laúd con una habilidad magistral. No tiene boca. La música no se detiene.",
      "choices": [
        { "text": "Acercarte e intentar comunicarte.", "mechanic": { "attribute": "SAB", "difficulty": 9 }, "consequence": { "on_success": { "add_status_effect": "melodia_inspiradora" } } },
        { "text": "Atacarlo.", "consequence": { "start_combat": "musico_espectral" } }
      ]
    }
  ]
}
```