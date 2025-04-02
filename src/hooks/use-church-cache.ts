import { useState, useEffect } from 'react';
import { Church } from '@p40/common/contracts/church/zions';
import api from '@p40/lib/axios';

const CACHE_KEY = 'zion-storage';
const CACHE_VERSION = '1.0.0';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos

interface CacheData {
  version: string;
  timestamp: number;
  data: {
    zions: any[];
    selectedZion: Church | null;
    activeTab: string;
  };
}

interface ZionResponse {
  region: {
    id: string;
    name: string;
    code: string;
  };
  churches: Church[];
}

export function useChurchCache() {
  const [zions, setZions] = useState<ZionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchZions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get<ZionResponse[]>('/api/church/list');
      
      if (response.status === 200) {
        setZions(response.data);
        
        // Atualiza o cache
        const newCache: CacheData = {
          version: CACHE_VERSION,
          timestamp: Date.now(),
          data: {
            zions: response.data,
            selectedZion: null,
            activeTab: 'zion'
          }
        };
        
        localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
      }
    } catch (err) {
      console.error('Erro ao buscar igrejas:', err);
      setError(err instanceof Error ? err : new Error('Erro ao buscar igrejas'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAndUpdateCache = async () => {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (!cachedData) {
          console.log('Cache não encontrado, buscando dados...');
          await fetchZions();
          return;
        }

        const parsedCache: CacheData = JSON.parse(cachedData);
        const isExpired = Date.now() - parsedCache.timestamp > CACHE_EXPIRY;
        const isOutdatedVersion = parsedCache.version !== CACHE_VERSION;

        if (isExpired || isOutdatedVersion) {
          console.log('Cache desatualizado, atualizando...');
          setIsRefreshing(true);
          localStorage.removeItem(CACHE_KEY);
          await fetchZions();
          setIsRefreshing(false);
        } else {
          // Usa os dados do cache se estiver válido
          setZions(parsedCache.data.zions);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Erro ao verificar/atualizar cache:', err);
        setError(err instanceof Error ? err : new Error('Erro ao verificar cache'));
        setIsLoading(false);
      }
    };

    checkAndUpdateCache();
  }, []);

  // Função para forçar atualização
  const refreshZions = async () => {
    setIsRefreshing(true);
    localStorage.removeItem(CACHE_KEY);
    await fetchZions();
    setIsRefreshing(false);
  };

  return {
    zions,
    isLoading,
    error,
    isRefreshing,
    refreshZions
  };
} 