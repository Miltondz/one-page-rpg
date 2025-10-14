/**
 * useGameCatalog - Hook para cargar catálogos del juego
 * 
 * Carga todos los catálogos de datos (items, enemigos, NPCs, locaciones)
 * desde archivos JSON y los mantiene en caché.
 */

import { useState, useEffect } from 'react';
import type {
  GameCatalog,
  ItemCatalog,
  EnemyCatalog,
  NPCCatalog,
  LocationCatalog,
  CatalogLoadState,
} from '../types/catalog';

interface UseGameCatalogReturn extends CatalogLoadState {
  catalog: GameCatalog | null;
}

const CATALOG_PATHS = {
  items: '/game_data/items/items.json',
  enemies: '/game_data/creatures/creatures.json',
  npcs: '/game_data/characters/npcs.json',
  locations: '/game_data/locations/locations.json',
};

/**
 * Hook para cargar todos los catálogos del juego
 */
export const useGameCatalog = (): UseGameCatalogReturn => {
  const [state, setState] = useState<CatalogLoadState>({
    isLoading: false,
    isLoaded: false,
    error: null,
    progress: 0,
  });
  
  const [catalog, setCatalog] = useState<GameCatalog | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCatalogs = async () => {
      if (!isMounted) return;

      setState({
        isLoading: true,
        isLoaded: false,
        error: null,
        progress: 0,
      });

      try {
        const totalCatalogs = Object.keys(CATALOG_PATHS).length;
        let loadedCount = 0;

        // Cargar items
        const itemsResponse = await fetch(CATALOG_PATHS.items);
        if (!itemsResponse.ok) throw new Error('Failed to load items catalog');
        const itemsData = await itemsResponse.json();
        const items: ItemCatalog = indexById(itemsData.items || []);
        loadedCount++;
        if (isMounted) setState(prev => ({ ...prev, progress: (loadedCount / totalCatalogs) * 100 }));

        // Cargar enemigos
        const enemiesResponse = await fetch(CATALOG_PATHS.enemies);
        if (!enemiesResponse.ok) throw new Error('Failed to load enemies catalog');
        const enemiesData = await enemiesResponse.json();
        const enemies: EnemyCatalog = indexById(enemiesData.creatures || []);
        loadedCount++;
        if (isMounted) setState(prev => ({ ...prev, progress: (loadedCount / totalCatalogs) * 100 }));

        // Cargar NPCs
        const npcsResponse = await fetch(CATALOG_PATHS.npcs);
        if (!npcsResponse.ok) throw new Error('Failed to load NPCs catalog');
        const npcsData = await npcsResponse.json();
        const npcs: NPCCatalog = indexById(npcsData.npcs || []);
        loadedCount++;
        if (isMounted) setState(prev => ({ ...prev, progress: (loadedCount / totalCatalogs) * 100 }));

        // Cargar locaciones
        const locationsResponse = await fetch(CATALOG_PATHS.locations);
        if (!locationsResponse.ok) throw new Error('Failed to load locations catalog');
        const locationsData = await locationsResponse.json();
        const locations: LocationCatalog = indexById(locationsData.locations || []);
        loadedCount++;
        if (isMounted) setState(prev => ({ ...prev, progress: (loadedCount / totalCatalogs) * 100 }));

        // Crear catálogo completo
        const gameCatalog: GameCatalog = {
          items,
          enemies,
          npcs,
          locations,
        };

        if (isMounted) {
          setCatalog(gameCatalog);
          setState({
            isLoading: false,
            isLoaded: true,
            error: null,
            progress: 100,
          });

          console.log('✅ Game catalogs loaded:', {
            items: Object.keys(items).length,
            enemies: Object.keys(enemies).length,
            npcs: Object.keys(npcs).length,
            locations: Object.keys(locations).length,
          });
        }
      } catch (error) {
        console.error('❌ Error loading game catalogs:', error);
        
        if (isMounted) {
          setState({
            isLoading: false,
            isLoaded: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
            progress: 0,
          });
        }
      }
    };

    loadCatalogs();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    catalog,
    ...state,
  };
};

/**
 * Convierte un array de objetos con 'id' en un objeto indexado por ID
 */
function indexById<T extends { id: string }>(array: T[]): Record<string, T> {
  return array.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, T>);
}

/**
 * Hook para obtener un item específico por ID
 */
export const useItem = (itemId: string, catalog: GameCatalog | null) => {
  if (!catalog) return null;
  return catalog.items[itemId] || null;
};

/**
 * Hook para obtener un enemigo específico por ID
 */
export const useEnemy = (enemyId: string, catalog: GameCatalog | null) => {
  if (!catalog) return null;
  return catalog.enemies[enemyId] || null;
};

/**
 * Hook para obtener un NPC específico por ID
 */
export const useNPC = (npcId: string, catalog: GameCatalog | null) => {
  if (!catalog) return null;
  return catalog.npcs[npcId] || null;
};

/**
 * Hook para obtener una locación específica por ID
 */
export const useLocation = (locationId: string, catalog: GameCatalog | null) => {
  if (!catalog) return null;
  return catalog.locations[locationId] || null;
};

export default useGameCatalog;
