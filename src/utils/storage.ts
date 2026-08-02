import { Product } from '../types';

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
  for (const key of PRODUCT_STORAGE_KEYS) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as Product[];
        }
      }
    } catch (e) {
      console.error(`Erro ao ler produtos do localStorage (chave: ${key}):`, e);
    }
  }
  return null;
};

/**
 * Salva a lista de produtos no localStorage em todas as chaves de compatibilidade.
 */
export const saveProductsToStorage = (products: Product[]) => {
  if (typeof window === 'undefined') return;
  try {
    const json = JSON.stringify(products);
    for (const key of PRODUCT_STORAGE_KEYS) {
      localStorage.setItem(key, json);
    }
  } catch (e) {
    console.error('Erro ao salvar produtos no localStorage:', e);
  }
};

/**
 * Recupera as configurações do site do localStorage.
 */
export const getSavedConfigFromStorage = (): Partial<SiteConfig> | null => {
  if (typeof window === 'undefined') return null;
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
 * Salva as configurações do site no localStorage.
 */
export const saveConfigToStorage = (config: SiteConfig) => {
  if (typeof window === 'undefined') return;
  try {
    const json = JSON.stringify(config);
    localStorage.setItem(STORAGE_KEY_CONFIG, json);
  } catch (e) {
    console.error('Erro ao salvar configurações no localStorage:', e);
  }
};
