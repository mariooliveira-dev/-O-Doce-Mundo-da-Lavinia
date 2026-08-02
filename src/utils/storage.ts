import { Product } from '../types';
import { purgeObsoleteLocalCache, safeSetLocalCache, sanitizeProductsForLocalCache } from './cacheManager';

export interface SiteConfig {
  phoneDisplay: string;
  phoneRaw: string;
  profileImage: string;
  profileBio1: string;
  profileBio2: string;
  profileBio3: string;
  founderName: string;
  founderTitle: string;
  logoUrl: string;
  logoSlogan: string;
  adminPassword: string;
}

export const STORAGE_KEY_CONFIG = 'docemundo_site_config_v1';
export const STORAGE_KEY_PRODUCTS = 'docemundo_products_v1';
export const STORAGE_KEY_AUTH = 'docemundo_admin_auth_v1';

const PRODUCT_STORAGE_KEYS = [
  'docemundo_products_v1',
  'docemundo_products_v4',
  'docemundo_products_v3',
  'docemundo_products_v2',
  'docemundo_products',
];

/**
 * Recupera os produtos salvos no localStorage buscando por qualquer chave de versão anterior.
 */
export const getSavedProductsFromStorage = (): Product[] | null => {
  if (typeof window === 'undefined') return null;
  purgeObsoleteLocalCache();
  
  const keysToTry = [STORAGE_KEY_PRODUCTS, ...PRODUCT_STORAGE_KEYS.filter((k) => k !== STORAGE_KEY_PRODUCTS)];
  for (const key of keysToTry) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as Product[];
        }
      }
    } catch (e) {
      console.warn(`Erro ao ler chave ${key} do localStorage:`, e);
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
  const configCopy = { ...config };
  if (configCopy.profileImage && configCopy.profileImage.startsWith('data:') && configCopy.profileImage.length > 50000) {
    configCopy.profileImage = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80';
  }
  if (configCopy.logoUrl && configCopy.logoUrl.startsWith('data:') && configCopy.logoUrl.length > 50000) {
    configCopy.logoUrl = '';
  }
  safeSetLocalCache(STORAGE_KEY_CONFIG, configCopy);
};

