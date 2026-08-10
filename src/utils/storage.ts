import { Product, SiteConfig } from '../types';
import { purgeObsoleteLocalCache, safeSetLocalCache, sanitizeProductsForLocalCache } from './cacheManager';

export type { SiteConfig };

export const STORAGE_KEY_CONFIG = 'docemundo_site_config_v1';
export const STORAGE_KEY_PRODUCTS = 'docemundo_products_v1';
export const STORAGE_KEY_AUTH = 'docemundo_admin_auth_v1';
export const STORAGE_KEY_DELETED_IDS = 'docemundo_deleted_product_ids_v1';

const PRODUCT_STORAGE_KEYS = [
  'docemundo_products_v1',
  'docemundo_products_v4',
  'docemundo_products_v3',
  'docemundo_products_v2',
  'docemundo_products',
];

/**
 * Recupera o conjunto de IDs de produtos deletados pelo usuário
 */
export const getDeletedProductIds = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_IDS);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr.map(String));
    }
  } catch {
    //
  }
  return new Set();
};

/**
 * Adiciona um ID à lista de deletados
 */
export const addDeletedProductId = (id: string) => {
  if (typeof window === 'undefined') return;
  try {
    const set = getDeletedProductIds();
    set.add(String(id));
    localStorage.setItem(STORAGE_KEY_DELETED_IDS, JSON.stringify(Array.from(set)));
  } catch {
    //
  }
};

/**
 * Limpa a lista de IDs deletados ao restaurar os produtos padrões
 */
export const clearDeletedProductIds = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_DELETED_IDS);
  } catch {
    //
  }
};

/**
 * Recupera os produtos salvos no localStorage respeitando exclusões ativas
 */
export const getSavedProductsFromStorage = (): Product[] | null => {
  if (typeof window === 'undefined') return null;
  purgeObsoleteLocalCache();
  
  const deletedSet = getDeletedProductIds();

  // Tenta a chave atual primeiro
  const currentSaved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  if (currentSaved !== null) {
    try {
      const parsed = JSON.parse(currentSaved);
      if (Array.isArray(parsed)) {
        return (parsed as Product[]).filter((p) => !deletedSet.has(String(p.id)));
      }
    } catch (e) {
      console.warn(`Erro ao ler chave ${STORAGE_KEY_PRODUCTS} do localStorage:`, e);
    }
  }

  // Fallback para chaves legadas
  const keysToTry = PRODUCT_STORAGE_KEYS.filter((k) => k !== STORAGE_KEY_PRODUCTS);
  for (const key of keysToTry) {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return (parsed as Product[]).filter((p) => !deletedSet.has(String(p.id)));
        }
      }
    } catch {
      // Ignora
    }
  }
  return null;
};

/**
 * Salva a lista de produtos no localStorage usando o CacheManager inteligente.
 */
export const saveProductsToStorage = (products: Product[]) => {
  if (typeof window === 'undefined') return;
  const sanitized = sanitizeProductsForLocalCache(products);
  safeSetLocalCache(STORAGE_KEY_PRODUCTS, sanitized);
};

/**
 * Recupera as configurações do site do localStorage.
 */
export const getSavedConfigFromStorage = (): Partial<SiteConfig> | null => {
  if (typeof window === 'undefined') return null;
  purgeObsoleteLocalCache();

  const keys = ['docemundo_site_config_v1', 'docemundo_site_config'];
  for (const key of keys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(`Erro ao ler configurações do localStorage (chave: ${key}):`, e);
    }
  }
  return null;
};

/**
 * Salva as configurações do site no localStorage usando o CacheManager.
 */
export const saveConfigToStorage = (config: SiteConfig) => {
  if (typeof window === 'undefined') return;
  safeSetLocalCache(STORAGE_KEY_CONFIG, config);
};

