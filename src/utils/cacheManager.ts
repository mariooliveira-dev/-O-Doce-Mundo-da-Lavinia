import { Product } from '../types';
import { SiteConfig, STORAGE_KEY_PRODUCTS, STORAGE_KEY_CONFIG } from './storage';

/**
 * Chaves conhecidas de versões anteriores ou legadas que devem ser removidas para liberar espaço.
 */
const OBSOLETE_CACHE_KEYS = [
  'docemundo_products_v4',
  'docemundo_products_v3',
  'docemundo_products_v2',
  'docemundo_products',
  'docemundo_site_config',
  'docemundo_site_config_v0',
];

/**
 * Limpa proativamente todas as chaves antigas e redundantes do localStorage.
 */
export const purgeObsoleteLocalCache = () => {
  if (typeof window === 'undefined') return;

  for (const key of OBSOLETE_CACHE_KEYS) {
    try {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignora erro ao remover chave
    }
  }
};

/**
 * Mantém os produtos intactos com suas fotos originais.
 * Com a compressão Canvas ativada, as fotos do usuário são leves (~40KB-80KB) e não estouram o localStorage.
 */
export const sanitizeProductsForLocalCache = (products: Product[]): Product[] => {
  return products;
};

/**
 * Tenta gravar no localStorage protegendo contra QuotaExceededError.
 */
export const safeSetLocalCache = (key: string, data: any): boolean => {
  if (typeof window === 'undefined') return false;

  purgeObsoleteLocalCache();

  try {
    const json = JSON.stringify(data);
    localStorage.setItem(key, json);
    return true;
  } catch (err) {
    console.warn(`[CacheManager] Cota do localStorage excedida para a chave "${key}". Executando purga emergencial...`);

    // Tentativa de emergência: remover itens não essenciais
    try {
      // Tenta salvar versão compacta sem imagens pesadas
      if (Array.isArray(data)) {
        const minimal = data.map((item) => ({
          ...item,
          image: typeof item.image === 'string' && item.image.startsWith('data:') ? '' : item.image,
        }));
        localStorage.setItem(key, JSON.stringify(minimal));
        return true;
      }
    } catch {
      // Se ainda falhar, o React Query continuará servindo a partir da memória do app e Supabase sem quebrar nada.
      console.warn('[CacheManager] Cache salvo apenas em memória React Query e Supabase.');
    }
    return false;
  }
};

/**
 * Inicialização automatizada da estratégia de cache.
 */
export const initSmartCacheStrategy = () => {
  purgeObsoleteLocalCache();
};
