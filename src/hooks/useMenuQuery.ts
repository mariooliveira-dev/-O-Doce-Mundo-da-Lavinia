import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '../types';
import { SiteConfig, DEFAULT_SITE_CONFIG } from '../context/AdminContext';
import { productService } from '../services/productService';
import { configService } from '../services/configService';
import { getSavedProductsFromStorage, getSavedConfigFromStorage, saveProductsToStorage, saveConfigToStorage } from '../utils/storage';
import { PRODUCTS } from '../data/products';

export const QUERY_KEY_PRODUCTS = ['products'] as const;
export const QUERY_KEY_CONFIG = ['siteConfig'] as const;

/**
 * Hook do React Query com cache otimizado para os produtos do cardápio.
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

      // 2. Fallback: Tenta carregar do localStorage otimizado
      const local = getSavedProductsFromStorage();
      if (local && local.length > 0) {
        return local;
      }

      // 3. Fallback final: Produtos padrão
      return PRODUCTS;
    },
    initialData: () => getSavedProductsFromStorage() || PRODUCTS,
    staleTime: 1000 * 60 * 5, // 5 minutos sem chamadas desnecessárias
  });

  return {
    ...query,
    invalidateProducts: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRODUCTS }),
  };
}

/**
 * Hook do React Query com cache otimizado para as configurações do site.
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
    initialData: () => {
      const local = getSavedConfigFromStorage();
      if (local) return { ...DEFAULT_SITE_CONFIG, ...local };
      return DEFAULT_SITE_CONFIG;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    invalidateConfig: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY_CONFIG }),
  };
}
