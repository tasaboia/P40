import { useState, useEffect } from "react";

interface CacheData<T> {
  value: T;
  timestamp: number;
}

export function useCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutos por padrão
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verifica se há dados em cache
        const cached = localStorage.getItem(key);
        if (cached) {
          const { value, timestamp }: CacheData<T> = JSON.parse(cached);
          if (Date.now() - timestamp < ttl) {
            setData(value);
            setLoading(false);
            return;
          }
        }

        // Se não houver cache ou estiver expirado, busca novos dados
        const value = await fetchFn();
        localStorage.setItem(
          key,
          JSON.stringify({
            value,
            timestamp: Date.now(),
          })
        );
        setData(value);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Erro desconhecido"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, fetchFn, ttl]);

  return { data, loading, error };
}
