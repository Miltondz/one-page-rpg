# 📁 **ARQUITECTURA DE ARCHIVOS JSON PARA EL MOTOR NARRATIVO**

## 🗂️ **ESTRUCTURA COMPLETA DE ARCHIVOS**

### **1. Configuración Principal**

```json

// config/game_config.json

{

"game": {

"name": "One Page RPG",

"version": "1.0.0",

"default_world": "aetheria",

"starting_level": 1,

"max_level": 20,

"difficulty_settings": {

"easy": { "enemy_health_multiplier": 0.8, "reward_multiplier": 0.8 },

"normal": { "enemy_health_multiplier": 1.0, "reward_multiplier": 1.0 },

"hard": { "enemy_health_multiplier": 1.3, "reward_multiplier": 1.2 }

}

},

"mechanics": {

"base_health": 20,

"base_mana": 10,

"xp_curve": [100, 300, 600, 1000, 1500],

"inventory_slots": 20,

"quick_slots": 4

}

}

```

### **2. Mundos y Configuración Global**

```json

// worlds/worlds.json

{

"worlds": {

"aetheria": {

"id": "aetheria",

"name": "Aetheria",

"description": "Un reino de magia antigua donde las líneas ley se desgarran",

"type": "fantasy",

"factions": [

{

"id": "arcane_circle",

"name": "Círculo Arcano",

"alignment": "neutral",

"goal": "Preservar el balance mágico",

"relationships": {

"brotherhood_sword": -20,

"eternal_shadow": -40

}

},

{

"id": "brotherhood_sword",

"name": "Hermandad de la Espada", 

"alignment": "lawful",

"goal": "Ley y orden por la fuerza"

}

],

"global_conflicts": [

"La Corriente Arcana se debilita cada día más",

"Criaturas oscuras emergen de las sombras",

"Las estaciones mágicas están fuera de control"

],

"magic_system": {

"type": "elemental",

"schools": ["fuego", "agua", "tierra", "aire", "luz", "oscuridad"],

"limitations": ["agotamiento", "componentes", "consecuencias"]

}

},

"nexus_prime": {

"id": "nexus_prime",

"name": "Nexus Prime",

"description": "Estación espacial multirracial al borde de la guerra civil",

"type": "sci-fi",

"factions": [

{

"id": "terran_alliance",

"name": "Alianza Terrana",

"alignment": "lawful",

"goal": "Expansión y control humano"

}

],

"technology_level": "advanced",

"global_conflicts": [

"Sabotaje en sistemas de soporte vital",

"Escasez de recursos críticos"

]

}

}

}

```

### **3. Razas y Culturas**

```json

// characters/races.json

{

"races": {

"human": {

"id": "human",

"name": "Humano",

"description": "Versátiles y ambiciosos, se adaptan a cualquier situación",

"base_attributes": {

"strength": 3,

"agility": 3, 

"wisdom": 3,

"luck": 3

},

"traits": ["adaptable", "ambitious"],

"cultures": ["imperial", "merchant", "nomad", "scholar"]

},

"elf": {

"id": "elf", 

"name": "Elfo",

"description": "Longevos y mágicos, conectados con las fuerzas naturales",

"base_attributes": {

"strength": 2,

"agility": 4,

"wisdom": 4, 

"luck": 2

},

"traits": ["magical_affinity", "nature_connection"],

"lifespan": 700,

"cultures": ["sylvan", "high_elf", "dark_elf"]

},

"dwarf": {

"id": "dwarf",

"name": "Enano",

"description": "Resistentes y tradicionalistas, maestros de la artesanía",

"base_attributes": {

"strength": 4,

"agility": 2,

"wisdom": 3,

"luck": 3

},

"traits": ["craftsmanship", "stonecunning"],

"cultures": ["mountain", "forge", "merchant_clan"]

}

}

}

```

### **4. Clases y Habilidades**

```json

// characters/classes.json

{

"classes": {

"warrior": {

"id": "warrior",

"name": "Guerrero",

"description": "Maestro del combate cuerpo a cuerpo",

"primary_attributes": ["strength", "agility"],

"starting_equipment": ["basic_sword", "leather_armor"],

"skills": {

"level_1": ["power_attack", "defensive_stance"],

"level_5": ["whirlwind", "shield_bash"],

"level_10": ["berserker_rage", "unstoppable"]

}

},

"mage": {

"id": "mage",

"name": "Mago",

"description": "Manipulador de las fuerzas arcana",

"primary_attributes": ["wisdom", "intelligence"],

"starting_equipment": ["basic_staff", "apprentice_robes"],

"spell_schools": ["elemental", "arcane", "divination"],

"skills": {

"level_1": ["fire_bolt", "magic_missile"],

"level_5": ["fireball", "telekinesis"],

"level_10": ["meteor_swarm", "time_stop"]

}

},

"rogue": {

"id": "rogue",

"name": "Pícaro",

"description": "Sigiloso y letal desde las sombras",

"primary_attributes": ["agility", "luck"],

"starting_equipment": ["dagger", "leather_armor"],

"skills": {

"level_1": ["sneak_attack", "lockpicking"],

"level_5": ["backstab", "trap_disarming"],

"level_10": ["assassinate", "shadow_step"]

}

}

}

}

```

### **5. NPCs y Personajes Clave**

```json

// characters/npcs.json

{

"archetypes": {

"mentor": {

"description": "Guía sabio que ayuda al héroe",

"names": ["Elian", "Morgana", "Roderick", "Sylvia"],

"roles": ["anciano_sabio", "mago_retirado", "guerrero_veterano"],

"knowledge_domains": ["world_history", "ancient_magic", "combat_tactics"],

"dialogue_templates": {

"greeting": [

"Te he estado esperando, {player_class}.",

"Tu destino te ha traído hasta mí."

],

"advice": [

"Recuerda que {wisdom_advice}.",

"Cuidado con {warning} en {location}."

]

}

},

"ally": {

"description": "Compañero leal en la aventura",

"names": ["Kael", "Liana", "Garrick", "Elara"],

"roles": ["warrior", "scout", "healer", "mage"],

"skills": ["combat", "stealth", "healing", "survival"]

}

},

"key_npcs": {

"elder_morgan": {

"id": "elder_morgan",

"name": "Morgana la Sabia",

"archetype": "mentor",

"race": "human",

"location": "starting_village",

"knowledge": ["ancient_prophecy", "ley_line_locations"],

"quests_given": ["first_prophecy", "ley_line_investigation"],

"relationship_start": 50,

"dialogue_tree": {

"greeting": "Ah, llegas justo cuando te necesito, {player_name}.",

"topics": ["prophecy", "magic", "world_state"]

}

}

}

}

```

### **6. Criaturas y Enemigos**

```json

// creatures/creatures.json

{

"enemies": {

"goblin": {

"id": "goblin",

"name": "Goblin",

"level": 1,

"health": 10,

"attack": 3,

"defense": 1,

"abilities": ["quick_strike"],

"loot_table": {

"common": ["goblin_ear", "rusty_dagger"],

"uncommon": ["small_potion", "leather_scrap"],

"rare": ["magic_amulet"]

},

"behavior": "aggressive",

"spawn_locations": ["forest", "caves"],

"description": "Una criatura pequeña pero astuta y peligrosa en grupo."

},

"skeleton": {

"id": "skeleton", 

"name": "Esqueleto",

"level": 3,

"health": 15,

"attack": 4,

"defense": 3,

"abilities": ["bone_armor", "fear_aura"],

"damage_resistances": ["piercing"],

"damage_vulnerabilities": ["bludgeoning"],

"loot_table": {

"common": ["bone_fragment", "ancient_coin"],

"uncommon": ["enchanted_skull", "rusty_sword"]

},

"description": "Restos animados por magia oscura, implacables y sin miedo."

}

},

"bosses": {

"dragon_ancient": {

"id": "dragon_ancient",

"name": "Draco el Ancestral",

"level": 15,

"health": 200,

"attack": 25,

"defense": 15,

"phases": 3,

"abilities": {

"phase_1": ["fire_breath", "tail_swipe"],

"phase_2": ["wing_buffet", "fear_roar"],

"phase_3": ["meteor_shower", "ancient_curse"]

},

"loot_table": {

"guaranteed": ["dragon_heart", "ancient_scale"],

"rare": ["dragonbone_sword", "fire_amulet"]

},

"description": "Un dragón milenario que custodia tesoros ancestrales."

}

}

}

```

### **7. Objetos y Equipamiento**

```json

// items/items.json

{

"consumables": {

"health_potion": {

"id": "health_potion",

"name": "Poción de Salud",

"type": "consumable",

"value": 10,

"effect": "restore_health",

"power": 20,

"description": "Una poción roja que restaura 20 puntos de salud.",

"rarity": "common"

},

"mana_potion": {

"id": "mana_potion", 

"name": "Poción de Maná",

"type": "consumable",

"value": 15,

"effect": "restore_mana",

"power": 15,

"description": "Una poción azul que restaura 15 puntos de maná.",

"rarity": "common"

}

},

"weapons": {

"iron_sword": {

"id": "iron_sword",

"name": "Espada de Hierro",

"type": "weapon",

"subtype": "sword",

"damage": 8,

"attributes": ["strength"],

"value": 50,

"requirements": {"level": 1},

"description": "Una espada de hierro forjada competentemente.",

"rarity": "common"

},

"staff_fire": {

"id": "staff_fire",

"name": "Bástaffo de Fuego",

"type": "weapon", 

"subtype": "staff",

"damage": 5,

"magic_bonus": 3,

"attributes": ["wisdom"],

"value": 100,

"requirements": {"level": 3},

"description": "Un báculo que amplifica los hechizos de fuego.",

"rarity": "uncommon"

}

},

"armor": {

"leather_armor": {

"id": "leather_armor",

"name": "Armadura de Cuero",

"type": "armor",

"subtype": "light",

"defense": 3,

"value": 40,

"description": "Armadura ligera hecha de cuero endurecido.",

"rarity": "common"

}

},

"quest_items": {

"ancient_amulet": {

"id": "ancient_amulet",

"name": "Amuleto Antiguo",

"type": "quest",

"value": 0,

"description": "Un amuleto con inscripciones antiguas. Parece importante.",

"quest": "lost_heirloom"

}

}

}

```

### **8. Locaciones y Entornos**

```json

// locations/locations.json

{

"biomes": {

"forest": {

"id": "forest",

"name": "Bosque",

"description": "Un bosque denso lleno de vida y misterio.",

"enemies": ["goblin", "wolf", "spider"],

"resources": ["wood", "herbs", "berries"],

"hazards": ["traps", "wild_animals", "confusing_paths"],

"music_theme": "forest_ambient",

"weather_variants": ["sunny", "rainy", "foggy"]

},

"dungeon": {

"id": "dungeon",

"name": "Mazmorra",

"description": "Pasajes subterráneos llenos de peligros y tesoros.",

"enemies": ["skeleton", "zombie", "giant_spider"],

"resources": ["ore", "gems", "ancient_artifacts"],

"hazards": ["traps", "collapse", "darkness"],

"music_theme": "dungeon_ambient"

}

},

"key_locations": {

"starting_village": {

"id": "starting_village",

"name": "Aldea Brisa Nocturna",

"type": "settlement",

"biome": "forest",

"description": "Una aldea tranquila donde comienza tu aventura.",

"npcs": ["elder_morgan", "blacksmith_torin", "innkeeper_lina"],

"services": ["inn", "blacksmith", "general_store"],

"quests_available": ["first_steps", "missing_herbs"]

},

"ancient_ruins": {

"id": "ancient_ruins",

"name": "Ruinas del Olvido",

"type": "dungeon",

"biome": "forest",

"description": "Restos de una civilización antigua, ahora habitada por criaturas.",

"enemies": ["skeleton", "ghost", "gargoyle"],

"boss": "ancient_guardian",

"loot_tier": "uncommon",

"quests_related": ["ancient_secrets", "lost_artifact"]

}

}

}

```

### **9. Sistema de Misiones**

```json

// quests/quests.json

{

"templates": {

"fetch": {

"description": "Recuperar un objeto específico",

"structure": {

"hook": "{npc} necesita {item} de {location}",

"objective": "Encontrar y recuperar {item}",

"completion": "Entregar {item} a {npc}",

"rewards": ["gold", "xp", "item"]

},

"variations": [

"{item} fue robado por {enemy}",

"{item} está maldito y necesita purificación",

"{item} es en realidad una persona/ente"

]

},

"escort": {

"description": "Proteger a un NPC hasta un destino",

"structure": {

"hook": "{npc} necesita llegar seguro a {destination}",

"objective": "Proteger a {npc} durante el viaje",

"completion": "Llegar a {destination} con {npc} vivo",

"rewards": ["gold", "xp", "faction_reputation"]

}

}

},

"story_quests": {

"first_prophecy": {

"id": "first_prophecy",

"name": "La Profecía del Anciano",

"type": "main",

"act": 1,

"giver": "elder_morgan",

"description": "Morgana te habla de una profecía antigua que menciona tu llegada.",

"objectives": [

"Escuchar la profecía de Morgana",

"Buscar el primer artefacto en las ruinas antiguas",

"Derrotar al guardián de las ruinas"

],

"rewards": {

"xp": 100,

"gold": 50,

"items": ["ancient_amulet"],

"faction_rep": {"arcane_circle": 10}

},

"next_quest": "ley_line_investigation"

}

}

}

```

### **10. Decisiones y Consecuencias**

```json

// story/decisions.json

{

"critical_decisions": {

"mentor_fate": {

"id": "mentor_fate",

"act": 1,

"situation": "Tu mentor está mortalmente herido protegiéndote",

"choices": [

{

"id": "save_mentor",

"text": "Usar el elixir curativo en tu mentor",

"immediate_effects": {

"mentor_survives": true,

"lose_elixir": true,

"time_loss": true

},

"long_term_consequences": {

"mentor_available": true,

"faction_rep": {"arcane_circle": 20},

"story_branch": "mentor_alive"

}

},

{

"id": "complete_mission",

"text": "Continuar con la misión crucial",

"immediate_effects": {

"mentor_dies": true,

"mission_success": true,

"time_saved": true

},

"long_term_consequences": {

"mentor_unavailable": true,

"faction_rep": {"brotherhood_sword": 15},

"story_branch": "ruthless_efficiency"

}

}

]

}

},

"story_branches": {

"mentor_alive": {

"description": "Tu mentor sobrevive y te guía",

"quests_available": ["mentor_guidance", "arcane_training"],

"faction_effects": {"arcane_circle": 30},

"ending_variants": ["wise_ruler", "magical_balance"]

},

"ruthless_efficiency": {

"description": "Elegiste la eficiencia sobre la compasión",

"quests_available": ["military_alliance", "strategic_control"],

"faction_effects": {"brotherhood_sword": 25},

"ending_variants": ["strong_leader", "iron_fist"]

}

}

}

```

### **11. Lore e Historia**

```json

// story/lore.json

{

"timeline": {

"ancient_era": {

"events": [

"Los dioses forjan el mundo y las razas primigenias",

"La Era Dorada de la magia y la tecnología",

"El Gran Cataclismo que divide el mundo"

],

"artifacts": ["crystal_primordial", "first_king_sword", "tome_of_creation"]

},

"current_era": {

"events": [

"El debilitamiento de la Corriente Arcana",

"El resurgimiento de las criaturas oscuras",

"Tu nacimiento bajo el signo de la profecía"

]

}

},

"prophecies": {

"hero_prophecy": {

"id": "hero_prophecy",

"text": "Cuando la magia decaiga y las sombras crezcan, un {player_race} de corazón {alignment} surgirá para restaurar el balance o sumir al mundo en la oscuridad eterna.",

"elements": ["weakening_magic", "rising_darkness", "chosen_one"],

"fulfillment_conditions": {

"heroic": ["save_mentor", "protect_innocents", "restore_balance"],

"dark": ["sacrifice_mentor", "embrace_power", "dominate_world"]

}

}

}

}

```

### **12. Diálogos y Textos**

```json

// story/dialogs.json

{

"templates": {

"greeting": [

"Te he estado esperando, {player_class}.",

"No esperaba verte por aquí...",

"Justo la persona que necesitaba ver."

],

"quest_offer": [

"Tengo un problema que quizás puedas resolver...",

"Necesito alguien con tus habilidades especiales.",

"Escuché que buscas {reward}. Puedo ayudarte... por un precio."

],

"combat_taunts": {

"player": [

"¡No subestimes mi poder!",

"Por la luz/oscuridad, te detendré.",

"Este es el fin de tu camino."

],

"enemy": [

"¡Tu alma alimentará mi poder!",

"Otro héroe para aplastar.",

"¡La batalla ha comenzado!"

]

}

},

"npc_dialogs": {

"elder_morgan": {

"greeting": "Ah, {player_name}. El destino nos une en estos tiempos oscuros.",

"topics": {

"prophecy": "La profecía habla de uno como tú, pero el futuro no está escrito.",

"magic": "La magia fluye como un río, y actualmente ese río se seca.",

"world_state": "Las criaturas oscuras crecen en número y fuerza cada día."

},

"quest_dialog": {

"offer": "Necesito que investigues las ruinas al norte. Algo importante te espera allí.",

"accept": "La sabiduría guía tus pasos. Ten cuidado con los guardianes antiguos.",

"complete": "Has encontrado el amuleto. Esto confirma la profecía."

}

}

}

}

```

## 📋 **CHECKLIST DE ARCHIVOS ESENCIALES**

### **Estructura de Carpetas:**

```

game_data/

├── config/

│ └── game_config.json

├── worlds/

│ └── worlds.json

├── characters/

│ ├── races.json

│ ├── classes.json

│ └── npcs.json

├── creatures/

│ └── creatures.json

├── items/

│ └── items.json

├── locations/

│ └── locations.json

├── quests/

│ └── quests.json

└── story/

├── decisions.json

├── lore.json

└── dialogs.json

```

### **Archivos Mínimos Necesarios:**

1\. ✅ **game_config.json** - Configuración base del juego

2\. ✅ **worlds.json** - Mundos, facciones y conflictos globales  

3\. ✅ **races.json** - Razas jugables y sus características

4\. ✅ **classes.json** - Clases y habilidades

5\. ✅ **npcs.json** - Personajes no jugables clave

6\. ✅ **creatures.json** - Enemigos y criaturas

7\. ✅ **items.json** - Objetos, equipo y consumibles

8\. ✅ **locations.json** - Biomas y lugares importantes

9\. ✅ **quests.json** - Sistema de misiones y plantillas

10\. ✅ **decisions.json** - Elecciones críticas y consecuencias

11\. ✅ **lore.json** - Historia del mundo y profecías

12\. ✅ **dialogs.json** - Diálogos y textos del juego

### **Verificación de Completitud:**

- [ ] **Mundo**: 2+ mundos con facciones y conflictos definidos

- [ ] **Personajes**: 3+ razas, 3+ clases, NPCs arquetípicos

- [ ] **Contenido de Juego**: 10+ enemigos, 20+ objetos, 5+ locaciones

- [ ] **Narrativa**: Arco principal, decisiones ramificadas, lore coherente

- [ ] **Sistema**: Misiones, diálogos, economía balanceada

**Esta estructura cubre TODO lo necesario para que el motor narrativo funcione sin necesidad de código hardcodeado. Cada archivo es autocontenido y se referencia mediante IDs únicos.**