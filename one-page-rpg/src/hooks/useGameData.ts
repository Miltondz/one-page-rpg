import { useState, useEffect } from 'react';

/**
 * Hook para cargar datos JSON del juego
 */
export function useGameData<T>(dataPath: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(dataPath);
        
        if (!response.ok) {
          throw new Error(`Failed to load ${dataPath}: ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err) {
        console.error(`Error loading game data from ${dataPath}:`, err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dataPath]);

  return { data, loading, error };
}

/**
 * Hook para cargar múltiples archivos JSON
 */
export function useMultipleGameData(dataPaths: Record<string, string>) {
  const [data, setData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const results: Record<string, unknown> = {};

        await Promise.all(
          Object.entries(dataPaths).map(async ([key, path]) => {
            const response = await fetch(path);
            if (!response.ok) {
              throw new Error(`Failed to load ${path}: ${response.statusText}`);
            }
            results[key] = await response.json();
          })
        );

        setData(results);
        setError(null);
      } catch (err) {
        console.error('Error loading game data:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(dataPaths)]);

  return { data, loading, error };
}

export default useGameData;
