import { queryClient } from '../lib/queryClient';
import { QUERY_KEY_PRODUCTS, QUERY_KEY_CONFIG } from '../hooks/useMenuQuery';
import { QUERY_KEY_MENU_PRODUCTS, QUERY_KEY_MENU_CONFIG } from '../hooks/useMenuData';
import { productService } from '../services/productService';
import { configService } from '../services/configService';
import { saveProductsToStorage, saveConfigToStorage, getSavedProductsFromStorage, getSavedConfigFromStorage } from './storage';
import { isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_SITE_CONFIG } from '../context/AdminContext';

export interface SyncResult {
  success: boolean;
  message: string;
  syncedProductsCount: number;
  configUpdated: boolean;
  supabaseConnected: boolean;
  timestamp: string;
}

/**
 * Utilitário de 'Backup Synchronization' que compara e sincroniza
 * o estado do localStorage e do cache React Query com os dados mais recentes do Supabase.
 */
export async function syncBackupWithSupabase(): Promise<SyncResult> {
  const timestamp = new Date().toLocaleTimeString('pt-BR');

  try {
    // 1. Busca dados do Supabase
    const [remoteProducts, remoteConfig] = await Promise.all([
      productService.fetchProducts(),
      configService.fetchSiteConfig(),
    ]);

    const localProducts = getSavedProductsFromStorage() || [];
    const localConfig = getSavedConfigFromStorage();

    let syncedProductsCount = 0;
    let configUpdated = false;

    // 2. Se o Supabase retornou produtos, atualiza o storage local e o cache do React Query
    if (remoteProducts && remoteProducts.length > 0) {
      syncedProductsCount = remoteProducts.length;
      saveProductsToStorage(remoteProducts);

      // Atualiza ambas as chaves de query no React Query
      queryClient.setQueryData(QUERY_KEY_PRODUCTS, remoteProducts);
      queryClient.setQueryData(QUERY_KEY_MENU_PRODUCTS, remoteProducts);
    } else if (localProducts.length > 0 && isSupabaseConfigured) {
      // Se o Supabase estivesse vazio, faz upload do backup local para o Supabase
      await productService.saveAllProducts(localProducts);
      syncedProductsCount = localProducts.length;
    }

    // 3. Se o Supabase retornou configurações
    if (remoteConfig) {
      const fullConfig = { ...DEFAULT_SITE_CONFIG, ...remoteConfig };
      configUpdated = true;
      saveConfigToStorage(fullConfig);

      queryClient.setQueryData(QUERY_KEY_CONFIG, fullConfig);
      queryClient.setQueryData(QUERY_KEY_MENU_CONFIG, fullConfig);
    } else if (localConfig && isSupabaseConfigured) {
      const fullLocalConfig = { ...DEFAULT_SITE_CONFIG, ...localConfig };
      await configService.updateSiteConfig(fullLocalConfig);
      configUpdated = true;
    }

    // 4. Invalida todas as queries relativas a cardápio e config para forçar os componentes a re-renderizarem
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRODUCTS }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_MENU_PRODUCTS }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_CONFIG }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_MENU_CONFIG }),
    ]);

    return {
      success: true,
      message: `Sincronização concluída com sucesso às ${timestamp}!`,
      syncedProductsCount,
      configUpdated,
      supabaseConnected: isSupabaseConfigured,
      timestamp,
    };
  } catch (err: any) {
    console.error('Erro durante a sincronização do backup:', err);
    return {
      success: false,
      message: err?.message || 'Falha ao sincronizar com o banco de dados remoto.',
      syncedProductsCount: 0,
      configUpdated: false,
      supabaseConnected: isSupabaseConfigured,
      timestamp,
    };
  }
}
