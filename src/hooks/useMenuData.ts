import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Product } from '../types';
import { SiteConfig, DEFAULT_SITE_CONFIG } from '../types';
import { productService } from '../services/productService';
import { configService } from '../services/configService';
import { getSavedProductsFromStorage, getSavedConfigFromStorage, saveProductsToStorage, saveConfigToStorage } from '../utils/storage';
import { PRODUCTS } from '../data/products';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
export const QUERY_KEY_PRODUCTS = ['products'] as const;
export const QUERY_KEY_CONFIG = ['siteConfig'] as const;
export const QUERY_KEY_MENU_PRODUCTS = QUERY_KEY_PRODUCTS;
export const QUERY_KEY_MENU_CONFIG = QUERY_KEY_CONFIG;

export interface UseMenuDataOptions {
  /**
   * Tempo em milissegundos que os dados são considerados recentes (staleTime).
   * Padrão reativo: 2 segundos para garantir sincronização instantânea em múltiplos aparelhos.
   */
  staleTime?: number;
  /**
   * Habilita a escuta de mudanças em tempo real via Supabase Realtime WebSocket.
   */
  enableRealtime?: boolean;
}

/**
 * Hook customizado 'useMenuData' que utiliza 'useQuery' do React Query
 * para buscar os dados do cardápio diretamente do Supabase com estratégia de sincronização em tempo real.
 */
export function useMenuData(options: UseMenuDataOptions = {}) {
  const { staleTime = 1000 * 2, enableRealtime = true } = options;
  const queryClient = useQueryClient();

  // 1. Query para os produtos do cardápio
  const productsQuery = useQuery<Product[]>({
    queryKey: QUERY_KEY_PRODUCTS,
    queryFn: async () => {
      // Busca diretamente do Supabase / backend remoto
      const remoteProducts = await productService.fetchProducts();
      if (remoteProducts && remoteProducts.length > 0) {
        saveProductsToStorage(remoteProducts);
        return remoteProducts;
      }

      // Fallback local caso offline
      const localProducts = getSavedProductsFromStorage();
      if (localProducts && localProducts.length > 0) {
        return localProducts;
      }

      return PRODUCTS;
    },
    placeholderData: () => getSavedProductsFromStorage() || PRODUCTS,
    staleTime,
    gcTime: 1000 * 60 * 60, // 1 hora na memória
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 10000, // Polling a cada 10s para clientes sem websocket
  });

  // 2. Query para as configurações do cardápio/loja
  const configQuery = useQuery<SiteConfig>({
    queryKey: QUERY_KEY_CONFIG,
    queryFn: async () => {
      const remoteConfig = await configService.fetchSiteConfig();
      if (remoteConfig) {
        saveConfigToStorage(remoteConfig);
        return remoteConfig;
      }

      const localConfig = getSavedConfigFromStorage();
      if (localConfig) {
        return { ...DEFAULT_SITE_CONFIG, ...localConfig };
      }

      return DEFAULT_SITE_CONFIG;
    },
    placeholderData: () => {
      const localConfig = getSavedConfigFromStorage();
      if (localConfig) return { ...DEFAULT_SITE_CONFIG, ...localConfig };
      return DEFAULT_SITE_CONFIG;
    },
    staleTime,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 10000,
  });

  // Listener para revalidação ao alternar abas/focar tela no celular
  useEffect(() => {
    const handleFocusOrVisibility = () => {
      if (document.visibilityState === 'visible') {
        productsQuery.refetch();
        configQuery.refetch();
      }
    };

    window.addEventListener('focus', handleFocusOrVisibility);
    document.addEventListener('visibilitychange', handleFocusOrVisibility);

    return () => {
      window.removeEventListener('focus', handleFocusOrVisibility);
      document.removeEventListener('visibilitychange', handleFocusOrVisibility);
    };
  }, [productsQuery, configQuery]);

  // Inscrição em tempo real com o Supabase Realtime para sincronizar instantaneamente entre celular e PC
  useEffect(() => {
    if (!enableRealtime || !isSupabaseConfigured || !supabase) return;

    const productsChannel = supabase
      .channel('menu_data_products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRODUCTS });
      })
      .subscribe();

    const configChannel = supabase
      .channel('menu_data_config_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'configuracoes' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY_CONFIG });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(configChannel);
    };
  }, [enableRealtime, queryClient]);

  const products = productsQuery.data || PRODUCTS;
  const siteConfig = configQuery.data || DEFAULT_SITE_CONFIG;
  const isLoading = productsQuery.isLoading || configQuery.isLoading;
  const isFetching = productsQuery.isFetching || configQuery.isFetching;
  const error = productsQuery.error || configQuery.error;

  const refetch = async () => {
    await Promise.all([productsQuery.refetch(), configQuery.refetch()]);
  };

  return {
    products,
    siteConfig,
    isLoading,
    isFetching,
    error,
    productsQuery,
    configQuery,
    refetch,
  };
}
