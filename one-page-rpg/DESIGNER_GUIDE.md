# 🎨 GUÍA DEL DISEÑADOR - One Page RPG

**Versión:** 0.6.0  
**Para diseñadores que quieren:** Crear sus propias aventuras interactivas usando el motor

---

## 📖 ÍNDICE

1. [Introducción](#introducción)
2. [Estructura de Archivos del Juego](#estructura-de-archivos-del-juego)
3. [Configuración de Locaciones](#configuración-de-locaciones)
4. [Configuración de Facciones](#configuración-de-facciones)
5. [Sistema de NPCs Procedurales](#sistema-de-npcs-procedurales)
6. [Diseño de Quests](#diseño-de-quests)
7. [Items y Economía](#items-y-economía)
8. [Bestiary y Combate](#bestiary-y-combate)
9. [Narrativa Dinámica](#narrativa-dinámica)
10. [Ejemplos Completos](#ejemplos-completos)

---

## 🎯 INTRODUCCIÓN

### ¿Qué es One Page RPG?

Un **motor de narrativa interactiva** con:

- ✅ Sistema de dados 2d6 integrado
- ✅ Generación procedural de NPCs
- ✅ Reputación y memoria dinámica
- ✅ Economía basada en relaciones
- ✅ Decisiones con consecuencias persistentes

### ¿Qué puedes crear?

1. **Aventuras de un solo acto** (One-page adventures)
2. **Campañas modulares** (Múltiples capítulos)
3. **Mundos sandbox** (Exploración libre)
4. **Historias ramificadas** (Múltiples finales)

### Filosofía de Diseño

**"Content-driven, code-light"**

- 📄 **Configura con JSON/YAML** (no programes)
- 🎲 **Procedural + Manual** (controla lo que quieres)
- 🌿 **Emergente** (los sistemas interactúan)
- 📖 **Narrativo** (mecánicas sirven a la historia)

---

## 📂 ESTRUCTURA DE ARCHIVOS DEL JUEGO

### Árbol de Directorios

```
games/
└── mi-aventura/
    ├── config.json           # Configuración principal
    ├── locations.json        # Locaciones y áreas
    ├── factions.json         # Facciones y relaciones
    ├── npcs/
    │   ├── manual.json       # NPCs diseñados manualmente
    │   └── templates.json    # Templates para generación procedural
    ├── quests/
    │   ├── main.json         # Quests principales
    │   ├── side.json         # Quests secundarias
    │   └── events.json       # Eventos aleatorios
    ├── items/
    │   ├── weapons.json      # Armas
    │   ├── armor.json        # Armaduras
    │   ├── consumables.json  # Pociones, etc.
    │   └── treasures.json    # Items especiales
    ├── bestiary.json         # Enemigos y criaturas
    ├── lore.json             # Lore y worldbuilding
    └── dialogues/
        ├── generic.json      # Diálogos genéricos
        └── unique.json       # Diálogos únicos por NPC
```

### Archivo Principal: `config.json`

```json
{
  "game": {
    "id": "mi-aventura-001",
    "title": "El Misterio de la Torre Rota",
    "version": "1.0.0",
    "author": "Tu Nombre",
    "description": "Una aventura de fantasía oscura sobre...",
    "genre": "dark-fantasy",
    "estimatedPlaytime": "2-3 horas"
  },
  
  "settings": {
    "startingLocation": "village-center",
    "startingGold": 50,
    "startingLevel": 1,
    "difficulty": "normal",
    "permadeath": true,
    "saveSlots": 3
  },
  
  "mechanics": {
    "diceSystem": "2d6",
    "combatMode": "turn-based",
    "reputationEnabled": true,
    "npcMemoryEnabled": true,
    "proceduralNPCs": true,
    "dynamicEconomy": true
  },
  
  "worldState": {
    "time": {
      "current": 0,
      "dayLength": 24,
      "weatherEnabled": true
    },
    "entropy": {
      "enabled": true,
      "startingLevel": 0,
      "maxLevel": 100,
      "decayRate": 1
    }
  },
  
  "ui": {
    "theme": "dark",
    "fontSize": "medium",
    "narrationSpeed": "normal",
    "showDiceRolls": true,
    "showStatChanges": true
  }
}
```

---

## 🏛️ CONFIGURACIÓN DE LOCACIONES

### Estructura Básica: `locations.json`

```json
{
  "locations": [
    {
      "id": "village-center",
      "name": "Plaza del Pueblo",
      "type": "settlement",
      "description": "Una plaza empedrada rodeada de edificios de piedra. El sonido del mercado llena el aire.",
      
      "properties": {
        "safe": true,
        "canRest": true,
        "hasMerchants": true,
        "faction": "neutral"
      },
      
      "connections": [
        {
          "to": "tavern",
          "direction": "north",
          "travelTime": 1,
          "difficulty": 0,
          "requiresKey": false
        },
        {
          "to": "dark-forest",
          "direction": "east",
          "travelTime": 5,
          "difficulty": 2,
          "requiresKey": false,
          "warning": "El bosque es peligroso de noche."
        }
      ],
      
      "npcs": {
        "fixed": ["merchant-gorn", "guard-elara"],
        "procedural": {
          "count": 3,
          "archetypes": ["commoner", "traveler"],
          "factions": ["neutral", "von-hess"]
        }
      },
      
      "items": {
        "lootTable": "common-village",
        "hidden": [
          {
            "item": "old-key",
            "difficulty": 8,
            "hint": "Hay algo brillante entre las piedras sueltas."
          }
        ]
      },
      
      "events": [
        {
          "id": "market-day",
          "probability": 0.3,
          "conditions": {
            "timeOfDay": "morning",
            "dayOfWeek": [1, 4]
          }
        }
      ],
      
      "ambiance": {
        "sounds": ["market chatter", "horse hooves", "bell tower"],
        "smells": ["fresh bread", "smoke", "damp stone"],
        "mood": "bustling"
      }
    }
  ]
}
```

### Tipos de Locaciones

#### 1. Settlement (Asentamiento)
```json
{
  "type": "settlement",
  "properties": {
    "safe": true,
    "canRest": true,
    "hasMerchants": true,
    "hasInn": true,
    "population": "medium"
  }
}
```

#### 2. Wilderness (Naturaleza)
```json
{
  "type": "wilderness",
  "properties": {
    "safe": false,
    "canRest": false,
    "encounterRate": 0.4,
    "weatherAffected": true,
    "vegetation": "dense-forest"
  }
}
```

#### 3. Dungeon
```json
{
  "type": "dungeon",
  "properties": {
    "safe": false,
    "canRest": false,
    "levels": 3,
    "illumination": "dark",
    "trapDensity": "high",
    "bossPresent": true
  }
}
```

#### 4. Social Hub
```json
{
  "type": "social-hub",
  "properties": {
    "safe": true,
    "canRest": true,
    "dialogueHeavy": true,
    "questHub": true,
    "factionBase": "circle-of-echo"
  }
}
```

### Conexiones Dinámicas

**Conexiones condicionales:**
```json
{
  "connections": [
    {
      "to": "secret-chamber",
      "direction": "hidden",
      "requiresKey": "ancient-key",
      "conditions": {
        "questCompleted": "find-the-key",
        "reputation": {
          "faction": "circle-of-echo",
          "minimum": 50
        }
      },
      "discoveryText": "Un pasaje secreto se revela ante ti..."
    }
  ]
}
```

---

## ⚔️ CONFIGURACIÓN DE FACCIONES

### Estructura: `factions.json`

```json
{
  "factions": [
    {
      "id": "von-hess",
      "name": "Casa Von Hess",
      "type": "political",
      
      "description": {
        "short": "Nobleza corrupta que busca poder.",
        "long": "La Casa Von Hess ha gobernado Griswald por generaciones, pero su ambición los ha corrompido...",
        "publicReputation": "Poderosos pero distantes",
        "secretReputation": "Corruptos y despiadados"
      },
      
      "ideology": {
        "primary": "power",
        "values": ["order", "hierarchy", "control"],
        "vices": ["corruption", "greed", "manipulation"]
      },
      
      "relationships": {
        "circle-of-echo": -0.3,
        "cult-of-silence": -0.5,
        "merchants-guild": 0.2
      },
      
      "territory": [
        "noble-quarter",
        "castle-grounds",
        "administrative-district"
      ],
      
      "resources": {
        "wealth": 95,
        "military": 80,
        "influence": 90,
        "magic": 30
      },
      
      "rewards": {
        "items": [
          {
            "reputation": 50,
            "item": "von-hess-signet",
            "description": "Sello oficial de la Casa"
          },
          {
            "reputation": 80,
            "item": "nobles-favor",
            "description": "Un favor de la nobleza"
          }
        ],
        "abilities": [
          {
            "reputation": 60,
            "ability": "political-immunity",
            "description": "Inmunidad legal en territorio Von Hess"
          }
        ]
      },
      
      "ranks": [
        {
          "level": 0,
          "title": "Desconocido",
          "benefits": []
        },
        {
          "level": 40,
          "title": "Asociado",
          "benefits": ["10% discount", "basic-intel"]
        },
        {
          "level": 60,
          "title": "Aliado",
          "benefits": ["20% discount", "safe-passage", "medium-intel"]
        },
        {
          "level": 80,
          "title": "Agente Oficial",
          "benefits": ["30% discount", "military-aid", "high-intel"]
        }
      ],
      
      "quests": [
        "investigate-rival",
        "suppress-dissent",
        "collect-taxes",
        "spy-mission"
      ]
    }
  ],
  
  "globalRelationships": {
    "enemyThreshold": -50,
    "allyThreshold": 50,
    "warThreshold": -80,
    "propagationFactor": 0.3
  }
}
```

### Tipos de Facciones

1. **Política:** Control territorial, recursos
2. **Religiosa:** Fe, conversión, dogma
3. **Criminal:** Mercado negro, corrupción
4. **Militar:** Fuerza, disciplina, conquista
5. **Académica:** Conocimiento, investigación
6. **Comercial:** Oro, comercio, influencia

---

## 👤 SISTEMA DE NPCs PROCEDURALES

### NPCs Manuales: `npcs/manual.json`

```json
{
  "npcs": [
    {
      "id": "merchant-gorn",
      "name": "Gorn el Mercader",
      "archetype": "merchant",
      
      "appearance": {
        "age": 45,
        "gender": "male",
        "race": "human",
        "physique": "stout",
        "facialFeatures": "Barba rojiza, cicatriz en la mejilla",
        "clothing": "Túnica de mercader con bordados dorados"
      },
      
      "personality": {
        "traits": ["greedy", "cunning", "cautious"],
        "motivation": "gold",
        "fear": "poverty",
        "quirk": "Siempre cuenta monedas con los dedos"
      },
      
      "relationships": {
        "faction": "merchants-guild",
        "reputation": 60,
        "familyTies": ["gorn-brother", "gorn-daughter"],
        "allies": ["merchant-ilsa"],
        "enemies": ["thief-guild"]
      },
      
      "stats": {
        "str": 2,
        "agi": 2,
        "wis": 4,
        "luk": 3,
        "health": 3,
        "combat": false
      },
      
      "secret": {
        "text": "Está siendo extorsionado por el gremio de ladrones",
        "severity": "moderate",
        "shareThreshold": 70,
        "consequences": "Si se revela, puede pedirte ayuda o huir del pueblo"
      },
      
      "dialogue": {
        "greeting": {
          "friendly": "¡Ah, mi mejor cliente! ¿Qué puedo ofrecerte hoy?",
          "neutral": "Bienvenido. ¿Buscas algo en particular?",
          "hostile": "Lárgate. No te vendo nada."
        },
        "farewell": {
          "friendly": "¡Que los vientos te sean favorables, amigo!",
          "neutral": "Buena suerte.",
          "hostile": "*gruñe y se aleja*"
        },
        "topics": [
          {
            "keyword": "rumores",
            "response": "He oído que algo extraño sucede en el bosque oscuro...",
            "unlocks": "quest-dark-forest-mystery"
          },
          {
            "keyword": "familia",
            "relationshipRequired": 50,
            "response": "Mi hermano desapareció hace un mes. Temo lo peor."
          }
        ]
      },
      
      "inventory": {
        "shop": "general-store",
        "priceModifier": 1.2,
        "stock": [
          {
            "item": "health-potion",
            "quantity": 5,
            "refreshRate": "daily"
          },
          {
            "item": "rope",
            "quantity": 3,
            "refreshRate": "weekly"
          }
        ],
        "uniqueItems": [
          {
            "item": "gorns-lucky-charm",
            "condition": "reputation >= 80",
            "price": 200
          }
        ]
      },
      
      "schedule": {
        "monday": {
          "morning": "village-center",
          "afternoon": "merchants-guild",
          "evening": "tavern",
          "night": "home"
        },
        "sunday": {
          "allDay": "home"
        }
      },
      
      "quests": [
        "merchant-debt",
        "find-lost-shipment",
        "negotiate-deal"
      ]
    }
  ]
}
```

### Templates Procedurales: `npcs/templates.json`

```json
{
  "templates": [
    {
      "archetype": "guard",
      "namePatterns": {
        "male": ["Aldric", "Borin", "Cedric", "Darius", "Ector"],
        "female": ["Alara", "Brenna", "Cyra", "Delia", "Elysia"],
        "surnames": ["Iron", "Stone", "Shield", "Blade", "Watch"]
      },
      
      "appearanceOptions": {
        "age": {"min": 25, "max": 45},
        "physique": ["muscular", "athletic", "broad"],
        "clothing": ["chainmail", "guard uniform", "city watch armor"],
        "features": [
          "scarred face",
          "stern expression",
          "military bearing",
          "watchful eyes"
        ]
      },
      
      "personalityWeights": {
        "lawful": 0.8,
        "loyal": 0.7,
        "suspicious": 0.6,
        "duty-bound": 0.9
      },
      
      "motivations": [
        {"motivation": "duty", "weight": 0.5},
        {"motivation": "gold", "weight": 0.2},
        {"motivation": "family", "weight": 0.3}
      ],
      
      "stats": {
        "str": {"min": 3, "max": 5},
        "agi": {"min": 2, "max": 4},
        "wis": {"min": 2, "max": 3},
        "luk": {"min": 1, "max": 3},
        "health": 4,
        "combat": true
      },
      
      "secretTemplates": [
        {
          "template": "Es {corrupto/a} y acepta sobornos",
          "severity": "moderate",
          "weight": 0.2
        },
        {
          "template": "Desertó de otra ciudad por {crimen}",
          "severity": "major",
          "weight": 0.1
        },
        {
          "template": "Está enamorado de {NPC aleatorio}",
          "severity": "minor",
          "weight": 0.3
        }
      ],
      
      "dialogueTemplates": {
        "greeting": [
          "Alto ahí. ¿Cuál es tu propósito aquí?",
          "Mantén la paz, ciudadano.",
          "Estado tu negocio."
        ],
        "farewell": [
          "Sigue tu camino.",
          "Mantente fuera de problemas.",
          "Que no te vuelva a ver causando problemas."
        ]
      },
      
      "inventoryProfile": {
        "alwaysHas": ["guard-sword", "guard-shield"],
        "sometimes": [
          {"item": "healing-potion", "chance": 0.3},
          {"item": "city-watch-badge", "chance": 0.8}
        ],
        "gold": {"min": 10, "max": 50}
      }
    }
  ],
  
  "generationRules": {
    "diversityFactors": {
      "gender": 0.5,
      "race": {"human": 0.6, "elf": 0.2, "dwarf": 0.15, "other": 0.05}
    },
    "relationshipGeneration": {
      "chanceOfFamilyTie": 0.2,
      "chanceOfRivalry": 0.15,
      "chanceOfFriendship": 0.25
    },
    "uniquenessThreshold": 0.8
  }
}
```

### Sistema de Generación

**Cuando se genera un NPC procedural:**

1. **Selección de Archetype:** Basado en `archetypes` de la locación
2. **Aplicación de Template:** Usa `templates.json` para el archetype
3. **Personalización:** Aplica seed y varianza
4. **Relaciones:** Crea vínculos con otros NPCs y facciones
5. **Secretos:** Genera secreto procedural
6. **Inventario:** Asigna items según perfil
7. **Diálogos:** Genera diálogos desde templates

**Ejemplo de NPC Generado:**
```
Seed: "griswald-game-12345"
Archetype: "guard"
Template: ver arriba

Resultado:
- Nombre: Darius Stone
- Edad: 34
- Physique: muscular
- Motivación: duty (70%), family (30%)
- Secreto: "Desertó de otra ciudad por asesinato accidental" (Major, 8% share)
- Faction: von-hess (rep: 40)
- Inventory: guard-sword, guard-shield, healing-potion, 27 oro
```

---

## 📜 DISEÑO DE QUESTS

### Quest Principal: `quests/main.json`

```json
{
  "quests": [
    {
      "id": "main-01-hermit-prophecy",
      "title": "La Profecía del Eremita",
      "type": "main",
      "chapter": 1,
      
      "description": {
        "summary": "El Eremita te ha revelado una profecía sobre el Velo.",
        "full": "Según el Eremita, el Velo que protege Griswald está debilitándose. Debes encontrar la forma de fortalecerlo... o destruirlo.",
        "objectives": [
          "Hablar con el Eremita",
          "Investigar el Velo en la Biblioteca",
          "Decidir el destino del Velo"
        ]
      },
      
      "stages": [
        {
          "id": "stage-1",
          "title": "El Encuentro",
          "description": "El Eremita te espera en su cabaña.",
          
          "objectives": [
            {
              "type": "dialogue",
              "target": "hermit-npc",
              "location": "hermit-cabin",
              "optional": false
            }
          ],
          
          "triggers": {
            "start": {
              "condition": "game-start",
              "auto": true
            },
            "complete": {
              "condition": "dialogue-complete",
              "npc": "hermit-npc",
              "keyword": "prophecy"
            }
          },
          
          "rewards": {
            "xp": 10,
            "items": ["hermits-journal"],
            "unlocks": ["stage-2"]
          }
        },
        
        {
          "id": "stage-2",
          "title": "La Investigación",
          "description": "Busca información sobre el Velo en la Biblioteca del Círculo.",
          
          "objectives": [
            {
              "type": "location",
              "target": "circle-library",
              "optional": false
            },
            {
              "type": "item-find",
              "target": "ancient-tome",
              "difficulty": 9,
              "hint": "Los libros más antiguos están en el sótano..."
            },
            {
              "type": "dialogue",
              "target": "librarian-npc",
              "keyword": "veil-lore",
              "optional": true,
              "bonus": "Información adicional sobre el Velo"
            }
          ],
          
          "triggers": {
            "complete": {
              "condition": "item-obtained",
              "item": "ancient-tome"
            }
          },
          
          "rewards": {
            "xp": 15,
            "reputation": {
              "circle-of-echo": 10
            },
            "unlocks": ["stage-3"]
          },
          
          "branching": {
            "if_talked_to_librarian": {
              "dialogueOption": "Entiendo más sobre el Velo",
              "effect": "easier-final-decision"
            }
          }
        },
        
        {
          "id": "stage-3",
          "title": "La Decisión",
          "description": "Debes decidir qué hacer con tu conocimiento del Velo.",
          
          "decision": {
            "type": "critical",
            "prompt": "¿Qué harás con el Velo?",
            
            "options": [
              {
                "id": "option-strengthen",
                "text": "Fortalecer el Velo (ayudar al Círculo)",
                "requirements": {
                  "reputation": {
                    "circle-of-echo": 30
                  }
                },
                "consequences": {
                  "immediate": {
                    "reputation": {
                      "circle-of-echo": 30,
                      "von-hess": -20
                    },
                    "narrative": "El Círculo del Eco te abraza como aliado..."
                  },
                  "longTerm": {
                    "worldState": {
                      "veilStrength": 50
                    },
                    "unlocksQuests": ["circle-restoration"],
                    "blocksQuests": ["cult-acceleration"]
                  }
                }
              },
              
              {
                "id": "option-weaken",
                "text": "Debilitar el Velo (ayudar al Culto)",
                "requirements": {
                  "reputation": {
                    "cult-of-silence": 30
                  }
                },
                "consequences": {
                  "immediate": {
                    "reputation": {
                      "cult-of-silence": 30,
                      "circle-of-echo": -40
                    },
                    "narrative": "El Culto del Silencio te recibe como hermano..."
                  },
                  "longTerm": {
                    "worldState": {
                      "veilStrength": -50,
                      "entropy": 20
                    },
                    "unlocksQuests": ["cult-acceleration"],
                    "blocksQuests": ["circle-restoration"],
                    "ending": "cult-ending"
                  }
                }
              },
              
              {
                "id": "option-sell",
                "text": "Vender la información (ayudar a Von Hess)",
                "requirements": {},
                "consequences": {
                  "immediate": {
                    "gold": 500,
                    "reputation": {
                      "von-hess": 30,
                      "circle-of-echo": -20
                    },
                    "narrative": "Casa Von Hess te recompensa generosamente..."
                  },
                  "longTerm": {
                    "worldState": {
                      "vonHessPower": 30
                    },
                    "unlocksQuests": ["von-hess-dominion"],
                    "ending": "power-ending"
                  }
                }
              },
              
              {
                "id": "option-keep",
                "text": "Guardarte el conocimiento para ti",
                "requirements": {},
                "consequences": {
                  "immediate": {
                    "items": ["veil-knowledge"],
                    "reputation": {
                      "circle-of-echo": -10,
                      "von-hess": -10
                    },
                    "narrative": "Decides mantener este poder para ti..."
                  },
                  "longTerm": {
                    "playerState": {
                      "cursed": true,
                      "luk": -1
                    },
                    "narrative": "El conocimiento prohibido tiene un precio...",
                    "ending": "neutral-ending"
                  }
                }
              }
            ]
          },
          
          "triggers": {
            "complete": {
              "condition": "decision-made"
            }
          },
          
          "rewards": {
            "xp": 20,
            "achievement": "main-01-complete"
          }
        }
      ],
      
      "failure": {
        "conditions": [
          {
            "if": "hermit-npc-dead",
            "consequence": "Quest failed, alternate path opened"
          }
        ],
        "alternativePath": "main-01-alt-discovery"
      }
    }
  ]
}
```

### Side Quest: `quests/side.json`

```json
{
  "quests": [
    {
      "id": "side-merchant-debt",
      "title": "La Deuda del Mercader",
      "type": "side",
      "giver": "merchant-gorn",
      
      "description": {
        "summary": "Gorn necesita ayuda para pagar una deuda al gremio de ladrones.",
        "full": "El mercader Gorn ha sido extorsionado por el gremio de ladrones. Debes ayudarle a resolver esto."
      },
      
      "requirements": {
        "npcRelationship": {
          "npc": "merchant-gorn",
          "minimum": 50
        },
        "secretKnown": "gorn-extortion-secret"
      },
      
      "stages": [
        {
          "id": "learn-details",
          "objectives": [
            {
              "type": "dialogue",
              "target": "merchant-gorn",
              "keyword": "debt-details"
            }
          ]
        },
        
        {
          "id": "resolve-debt",
          "decision": {
            "prompt": "¿Cómo ayudarás a Gorn?",
            "options": [
              {
                "id": "pay-debt",
                "text": "Pagar la deuda (200 oro)",
                "requirements": {"gold": 200},
                "consequences": {
                  "gold": -200,
                  "reputation_gorn": 30,
                  "narrative": "Gorn está eternamente agradecido."
                }
              },
              {
                "id": "intimidate-thieves",
                "text": "Intimidar al gremio (STR check)",
                "requirements": {"str": 4},
                "check": {
                  "attribute": "str",
                  "difficulty": 10
                },
                "consequences": {
                  "success": {
                    "reputation_gorn": 40,
                    "reputation_thieves-guild": -30,
                    "narrative": "Los ladrones retroceden ante tu fuerza."
                  },
                  "failure": {
                    "health": -2,
                    "reputation_thieves-guild": -50,
                    "narrative": "Los ladrones no se amedrentan fácilmente..."
                  }
                }
              },
              {
                "id": "negotiate",
                "text": "Negociar (WIS check)",
                "check": {
                  "attribute": "wis",
                  "difficulty": 9
                },
                "consequences": {
                  "success": {
                    "gold": -100,
                    "reputation_gorn": 35,
                    "reputation_thieves-guild": 10,
                    "narrative": "Llegas a un acuerdo beneficioso para todos."
                  }
                }
              },
              {
                "id": "betray",
                "text": "Traicionar a Gorn y quedarte con el oro",
                "consequences": {
                  "gold": 200,
                  "reputation_gorn": -80,
                  "reputation_thieves-guild": 20,
                  "narrative": "Gorn nunca te perdonará esto...",
                  "tag": "betrayer"
                }
              }
            ]
          }
        }
      ],
      
      "rewards": {
        "xp": 10,
        "items": ["gorns-lucky-charm"],
        "unlocks": ["merchants-guild-access"]
      },
      
      "timeLimit": {
        "days": 7,
        "failureConsequence": "Gorn huye del pueblo, quest failed"
      }
    }
  ]
}
```

### Eventos Aleatorios: `quests/events.json`

```json
{
  "events": [
    {
      "id": "event-ambush",
      "title": "Emboscada en el Camino",
      "type": "combat-encounter",
      
      "triggers": {
        "location": ["forest-path", "mountain-road"],
        "time": "night",
        "probability": 0.3,
        "conditions": {
          "reputation_thieves-guild": {"max": -20}
        }
      },
      
      "narrative": {
        "intro": "Sombras se mueven entre los árboles. ¡Una emboscada!",
        "enemyReveal": "Tres bandidos emergen del bosque, armas en mano."
      },
      
      "encounter": {
        "enemies": [
          {"type": "bandit", "count": 3, "level": "player-level"}
        ],
        "escapeAllowed": true,
        "escapeDifficulty": 7
      },
      
      "outcomes": {
        "victory": {
          "xp": 5,
          "loot": "bandit-loot-table",
          "narrative": "Los bandidos huyen derrotados."
        },
        "escape": {
          "narrative": "Logras escapar en la oscuridad."
        },
        "defeat": {
          "gold": -50,
          "narrative": "Despiertas horas después, despojado de tus pertenencias..."
        }
      }
    },
    
    {
      "id": "event-mysterious-traveler",
      "title": "El Viajero Misterioso",
      "type": "dialogue-encounter",
      
      "triggers": {
        "location": ["tavern"],
        "time": "evening",
        "probability": 0.2
      },
      
      "narrative": {
        "intro": "Un viajero encapuchado se acerca a tu mesa.",
        "dialogue": "\"Tienes el aspecto de alguien que busca respuestas...\""
      },
      
      "options": [
        {
          "text": "Escuchar al viajero",
          "consequences": {
            "unlocks": "hidden-quest-path",
            "narrative": "El viajero te revela información sobre un lugar olvidado..."
          }
        },
        {
          "text": "Ignorarlo",
          "consequences": {
            "narrative": "El viajero se desvanece en la multitud."
          }
        },
        {
          "text": "[AGI] Intentar robarle",
          "check": {
            "attribute": "agi",
            "difficulty": 11
          },
          "consequences": {
            "success": {
              "items": ["mysterious-token"],
              "narrative": "Robas un extraño medallón sin que lo note..."
            },
            "failure": {
              "reputation": -10,
              "narrative": "¡Te atrapa! Eres expulsado de la taberna."
            }
          }
        }
      ]
    }
  ]
}
```

---

## 🗡️ ITEMS Y ECONOMÍA

### Armas: `items/weapons.json`

```json
{
  "weapons": [
    {
      "id": "iron-sword",
      "name": "Espada de Hierro",
      "type": "weapon",
      "subtype": "sword",
      
      "stats": {
        "damage": 1,
        "attribute": "str",
        "range": "melee",
        "durability": 100
      },
      
      "value": {
        "basePrice": 100,
        "weight": 3,
        "rarity": "common"
      },
      
      "description": {
        "short": "Una espada de hierro estándar",
        "long": "Una espada bien forjada pero sin características especiales. Confiable y efectiva."
      },
      
      "requirements": {
        "str": 2,
        "level": 1
      },
      
      "vendors": ["blacksmith", "general-store"],
      "lootTables": ["basic-loot", "guard-drop"]
    },
    
    {
      "id": "veil-blade",
      "name": "Hoja del Velo",
      "type": "weapon",
      "subtype": "sword",
      
      "stats": {
        "damage": 3,
        "attribute": "str",
        "range": "melee",
        "durability": 200,
        "special": "silence-touch"
      },
      
      "value": {
        "basePrice": 1000,
        "weight": 2,
        "rarity": "legendary"
      },
      
      "description": {
        "short": "Una espada forjada con fragmentos del Velo",
        "long": "Esta hoja vibra con energía entrópica. Dice la leyenda que puede cortar el tejido mismo de la realidad.",
        "lore": "Forjada durante la Primera Plaga, cuando el Velo casi colapsa..."
      },
      
      "requirements": {
        "str": 3,
        "wis": 2,
        "level": 5,
        "quest": "main-03-veil-fragment"
      },
      
      "abilities": [
        {
          "name": "Silence Touch",
          "description": "Los enemigos golpeados no pueden usar habilidades mágicas por 2 turnos",
          "cost": 1,
          "cooldown": 3
        }
      ],
      
      "vendors": [],
      "unique": true,
      "questItem": true
    }
  ]
}
```

### Consumibles: `items/consumables.json`

```json
{
  "consumables": [
    {
      "id": "health-potion",
      "name": "Poción de Curación",
      "type": "consumable",
      "subtype": "potion",
      
      "effect": {
        "type": "heal",
        "value": 2,
        "instant": true
      },
      
      "value": {
        "basePrice": 50,
        "weight": 0.5,
        "rarity": "common"
      },
      
      "description": {
        "short": "Restaura 2 Heridas",
        "long": "Una poción roja brillante con propiedades curativas.",
        "useText": "Bebes la poción y sientes como tus heridas se cierran."
      },
      
      "stackable": true,
      "maxStack": 10,
      
      "vendors": ["alchemist", "general-store"],
      "lootTables": ["common-loot", "chest-minor"],
      
      "craftable": {
        "recipe": [
          {"item": "red-herb", "quantity": 2},
          {"item": "water", "quantity": 1}
        ],
        "skillRequired": "alchemy",
        "skillLevel": 1
      }
    }
  ]
}
```

---

## 🐲 BESTIARY Y COMBATE

### Bestiary: `bestiary.json`

```json
{
  "creatures": [
    {
      "id": "bandit",
      "name": "Bandido",
      "type": "humanoid",
      "threat": "low",
      
      "stats": {
        "health": 3,
        "defense": 7,
        "str": 3,
        "agi": 2,
        "wis": 1,
        "luk": 2
      },
      
      "combat": {
        "attackType": "str",
        "damage": 1,
        "tactics": "aggressive",
        "abilities": [
          {
            "name": "Desperate Strike",
            "description": "Ataque desesperado cuando HP < 1",
            "trigger": "low-health",
            "effect": "+2 to attack roll"
          }
        ]
      },
      
      "description": {
        "appearance": "Un humano andrajoso armado con un cuchillo oxidado",
        "behavior": "Agresivo pero cobarde ante oponentes fuertes"
      },
      
      "loot": {
        "guaranteed": [],
        "table": [
          {"item": "gold", "amount": {"min": 5, "max": 20}, "chance": 1.0},
          {"item": "rusty-dagger", "chance": 0.3},
          {"item": "health-potion", "chance": 0.1}
        ]
      },
      
      "xpReward": 2,
      
      "spawnLocations": ["forest-path", "mountain-road"],
      "spawnChance": 0.4
    },
    
    {
      "id": "veil-wraith",
      "name": "Aparición del Velo",
      "type": "undead",
      "threat": "high",
      
      "stats": {
        "health": 8,
        "defense": 10,
        "str": 2,
        "agi": 4,
        "wis": 5,
        "luk": 1
      },
      
      "combat": {
        "attackType": "wis",
        "damage": 2,
        "tactics": "strategic",
        "resistances": {
          "physical": 0.5,
          "magic": 0.0
        },
        "weaknesses": {
          "holy": 2.0
        },
        "abilities": [
          {
            "name": "Entropy Touch",
            "description": "Reduce 1 punto de un atributo aleatorio por 3 turnos",
            "cooldown": 3,
            "effect": "debuff-random-stat"
          },
          {
            "name": "Phase Shift",
            "description": "Se vuelve intangible, evitando el próximo ataque",
            "cooldown": 4,
            "effect": "dodge-next-attack"
          }
        ]
      },
      
      "description": {
        "appearance": "Una figura espectral que parece desgarrarse y recomponerse constantemente",
        "behavior": "Inteligente y sádica, disfruta el sufrimiento",
        "lore": "Creaciones del Velo desestabilizado, estas apariciones buscan extender el Silencio"
      },
      
      "loot": {
        "guaranteed": [
          {"item": "veil-fragment", "quantity": 1}
        ],
        "table": [
          {"item": "gold", "amount": {"min": 50, "max": 100}, "chance": 1.0},
          {"item": "spectral-essence", "chance": 0.6},
          {"item": "veil-weapon-shard", "chance": 0.2}
        ]
      },
      
      "xpReward": 10,
      
      "spawnLocations": ["veil-touched-zone", "corrupted-temple"],
      "spawnChance": 0.2,
      
      "uniqueDialogue": {
        "onEncounter": "\"El Silencio... viene... para todos...\"",
        "onDefeat": "\"No... el Canto... duele...\""
      }
    }
  ],
  
  "encounterTables": {
    "forest-low": [
      {"creature": "bandit", "weight": 0.5},
      {"creature": "wolf", "weight": 0.3},
      {"creature": "goblin", "weight": 0.2}
    ],
    "veil-zone": [
      {"creature": "veil-wraith", "weight": 0.4},
      {"creature": "corrupted-guard", "weight": 0.3},
      {"creature": "shadow-beast", "weight": 0.3}
    ]
  }
}
```

---

## 📚 NARRATIVA DINÁMICA

### Sistema de Estado del Mundo

**worldState tracking:**
```json
{
  "worldState": {
    "entropy": {
      "current": 0,
      "threshold": 50,
      "effects": [
        {
          "level": 25,
          "description": "El Velo comienza a debilitarse...",
          "mechanical": {
            "encounterRate": 1.2,
            "veilCreatures": 0.3
          }
        },
        {
          "level": 50,
          "description": "¡El Velo colapsa parcialmente!",
          "mechanical": {
            "encounterRate": 1.5,
            "veilCreatures": 0.6,
            "npcPanic": 0.4
          },
          "narrative": "Los ciudadanos comienzan a huir de la ciudad..."
        }
      ]
    },
    
    "factionPower": {
      "von-hess": 50,
      "circle-of-echo": 30,
      "cult-of-silence": 20
    },
    
    "timeTracking": {
      "day": 0,
      "season": "autumn",
      "weatherPattern": "rainy"
    }
  }
}
```

### Consecuencias Narrativas

**Tags de Player:**
```json
{
  "playerTags": {
    "betrayer": {
      "description": "Has traicionado la confianza de alguien",
      "effects": {
        "npcTrust": -10,
        "dialogueOptions": ["guilt-response", "justify-betrayal"]
      }
    },
    "hero-of-circle": {
      "description": "El Círculo del Eco te considera un héroe",
      "effects": {
        "reputation_circle-of-echo": 20,
        "dialogueOptions": ["hero-greeting"],
        "specialVendor": true
      }
    }
  }
}
```

---

## 🎮 EJEMPLOS COMPLETOS

### Mini-Aventura Completa: "El Anillo Perdido"

**Estructura:**
```
mini-adventures/
└── lost-ring/
    ├── config.json
    ├── locations.json
    ├── npcs.json
    ├── quest.json
    └── items.json
```

**config.json:**
```json
{
  "game": {
    "id": "lost-ring-001",
    "title": "El Anillo Perdido",
    "description": "Una breve aventura sobre amor, pérdida y un anillo mágico",
    "estimatedPlaytime": "30 minutos"
  },
  "settings": {
    "startingLocation": "village-square",
    "startingGold": 30
  }
}
```

**quest.json:**
```json
{
  "quests": [
    {
      "id": "lost-ring-main",
      "title": "El Anillo Perdido",
      "stages": [
        {
          "id": "meet-sara",
          "objectives": [
            {"type": "dialogue", "target": "sara-npc", "keyword": "lost-ring"}
          ]
        },
        {
          "id": "find-ring",
          "objectives": [
            {"type": "location", "target": "old-well"},
            {"type": "item-find", "target": "golden-ring", "difficulty": 8}
          ]
        },
        {
          "id": "return-ring",
          "decision": {
            "prompt": "¿Devolverás el anillo a Sara o lo venderás?",
            "options": [
              {
                "id": "return",
                "text": "Devolver el anillo",
                "consequences": {
                  "reputation_sara": 50,
                  "narrative": "Sara llora de alegría. Te considera su mejor amigo.",
                  "ending": "good-ending"
                }
              },
              {
                "id": "sell",
                "text": "Vender el anillo",
                "consequences": {
                  "gold": 200,
                  "reputation_sara": -80,
                  "narrative": "Vendes el anillo. Sara nunca te perdonará.",
                  "ending": "bad-ending"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

---

## 🛠️ HERRAMIENTAS Y VALIDACIÓN

### Validador de Configuración

```bash
# Validar todos los archivos del juego
npm run validate-game games/mi-aventura

# Validar archivo específico
npm run validate-json games/mi-aventura/quests/main.json
```

### Test de Generación Procedural

```bash
# Generar NPCs de prueba
npm run test-npc-generation --seed "test-seed-123" --count 10

# Ver resultado
cat test-output/npcs-generated.json
```

### Editor Visual (Roadmap)

```
🔧 En desarrollo:
- Editor de quests visual
- Generador de locaciones
- Prueba de diálogos interactiva
```

---

## ✅ CHECKLIST DEL DISEÑADOR

### Configuración Básica
- [ ] Crear `config.json` con metadatos del juego
- [ ] Definir `startingLocation` y recursos iniciales
- [ ] Configurar mecánicas habilitadas

### Mundo
- [ ] Diseñar al menos 5 locaciones
- [ ] Conectar locaciones con `connections`
- [ ] Definir 2-3 facciones con relaciones

### NPCs
- [ ] Crear 3-5 NPCs manuales clave
- [ ] Configurar templates para NPCs procedurales
- [ ] Asignar NPCs a locaciones

### Quests
- [ ] Diseñar quest principal con 3+ stages
- [ ] Crear 2-3 side quests
- [ ] Añadir eventos aleatorios

### Items
- [ ] Definir al menos 5 items únicos
- [ ] Configurar loot tables
- [ ] Balancear precios y rareza

### Combate
- [ ] Crear 3-5 tipos de enemigos
- [ ] Balancear stats y dificultad
- [ ] Definir loot de enemigos

### Narrativa
- [ ] Escribir descripciones de locaciones
- [ ] Crear diálogos principales
- [ ] Diseñar múltiples finales

### Testing
- [ ] Probar camino completo de quest principal
- [ ] Verificar que todas las decisiones funcionen
- [ ] Balancear economía y dificultad

---

## 📚 RECURSOS ADICIONALES

### Templates de Ejemplo
- `examples/basic-adventure/` - Aventura simple
- `examples/faction-war/` - Guerra de facciones
- `examples/procedural-dungeon/` - Dungeon procedural

### Documentación Técnica
- Ver `TECHNICAL_GUIDE.md` para interfaces y APIs
- Ver `README.md` para setup y ejecución

### Comunidad
- Discord: (link)
- GitHub Issues: Para reportar bugs o sugerir features

---

**¡Feliz diseño de aventuras!**

*"La mejor historia es la que emerge del juego."*

🎨🎲📖
