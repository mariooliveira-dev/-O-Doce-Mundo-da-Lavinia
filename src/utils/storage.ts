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
 * Salva a lista de produtos no localStorage de forma otimizada para evitar QuotaExceededError.
 */
export const saveProductsToStorage = (products: Product[]) => {
  if (typeof window === 'undefined') return;

  // Limpa rigorosamente TODAS as chaves antigas e duplicadas do localStorage para liberar cota
  const legacyKeys = [
    'docemundo_products_v4',
    'docemundo_products_v3',
    'docemundo_products_v2',
    'docemundo_products',
  ];
  for (const legacyKey of legacyKeys) {
    try {
      localStorage.removeItem(legacyKey);
    } catch {}
  }

  try {
    // Reduz imagens base64 gigantes (> 40KB) APENAS para o clone do localStorage local,
    // garantindo que NUNCA estoure a cota de 5MB do navegador.
    // O Supabase e a memória do React mantêm a imagem original completa!
    const sanitizedProducts = products.map((p) => {
      if (p.image && p.image.startsWith('data:') && p.image.length > 40000) {
        return {
          ...p,
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        };
      }
      return p;
    });

    const json = JSON.stringify(sanitizedProducts);
    localStorage.setItem(STORAGE_KEY_PRODUCTS, json);
  } catch (e) {
    // Fallback se o localStorage estiver completamente ocupado por outros dados
    try {
      const minimalProducts = products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description,
        available: p.available,
        badge: p.badge,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      }));
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(minimalProducts));
    } catch {
      console.warn('Aviso: Armazenamento local (localStorage) cheio. Os dados permanecem preservados no Supabase e na memória do site.');
    }
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
    const configCopy = { ...config };
    if (configCopy.profileImage && configCopy.profileImage.startsWith('data:') && configCopy.profileImage.length > 50000) {
      configCopy.profileImage = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80';
    }
    if (configCopy.logoUrl && configCopy.logoUrl.startsWith('data:') && configCopy.logoUrl.length > 50000) {
      configCopy.logoUrl = '';
    }
    const json = JSON.stringify(configCopy);
    localStorage.setItem(STORAGE_KEY_CONFIG, json);
  } catch (e) {
    console.warn('Aviso ao salvar configurações no localStorage:', e);
  }
};
