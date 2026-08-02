import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Product } from '../types';
import { SiteConfig, DEFAULT_SITE_CONFIG } from '../context/AdminContext';
import { productService } from '../services/productService';
import { configService } from '../services/configService';
import { getSavedProductsFromStorage, getSavedConfigFromStorage, saveProductsToStorage, saveConfigToStorage } from '../utils/storage';
import { PRODUCTS } from '../data/products';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const QUERY_KEY_PRODUCTS = ['products'] as const;
export const QUERY_KEY_CONFIG = ['siteConfig'] as const;

/**
 * Hook do React Query com sincronização em tempo real e cache otimizado para produtos.
 */
export function useProductsQuery() {
  const queryClient = useQueryClient();

  const query = useQuery<Product[]>({
    queryKey: QUERY_KEY_PRODUCTS,
    queryFn: async () => {
      // 1. Tenta carregar do Supabase / Servidor
      const remote = await productService.fetchProducts();
      if (remote && remote.length > 0) {
        saveProductsToStorage(remote);
        return remote;
      }

      // 2. Fallback: Tenta carregar do localStorage
      const local = getSavedProductsFromStorage();
      if (local && local.length > 0) {
        return local;
      }

      // 3. Fallback final: Produtos padrão
      return PRODUCTS;
    },
    placeholderData: () => getSavedProductsFromStorage() || PRODUCTS,
    staleTime: 1000 * 5, // Considera atual por 5s, depois busca em background
    refetchOnMount: 'always', // Garante busca do Supabase ao abrir no celular ou recarregar
    refetchOnWindowFocus: true, // Atualiza ao retornar para a aba no celular
    refetchInterval: 15000, // Polling a cada 15s para sincronizar múltiplos dispositivos
  });

  // Escuta alterações em tempo real no Supabase se disponível
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel('realtime_produtos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'produtos' },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRODUCTS });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    ...query,
    invalidateProducts: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRODUCTS }),
  };
}

/**
 * Hook do React Query com sincronização em tempo real e cache otimizado para configurações.
 */
export function useSiteConfigQuery() {
  const queryClient = useQueryClient();

  const query = useQuery<SiteConfig>({
    queryKey: QUERY_KEY_CONFIG,
    queryFn: async () => {
      // 1. Tenta carregar do Supabase
      const remote = await configService.fetchSiteConfig();
      if (remote) {
        saveConfigToStorage(remote);
        return remote;
      }

      // 2. Fallback local
      const local = getSavedConfigFromStorage();
      if (local) {
        return { ...DEFAULT_SITE_CONFIG, ...local };
      }

      return DEFAULT_SITE_CONFIG;
    },
    placeholderData: () => {
      const local = getSavedConfigFromStorage();
      if (local) return { ...DEFAULT_SITE_CONFIG, ...local };
      return DEFAULT_SITE_CONFIG;
    },
    staleTime: 1000 * 5,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
  });

  // Escuta alterações em tempo real no Supabase se disponível
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel('realtime_configuracoes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'configuracoes' },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEY_CONFIG });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    ...query,
    invalidateConfig: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY_CONFIG }),
  };
}

export { useMenuData } from './useMenuData';

