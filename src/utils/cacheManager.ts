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
 * Sanitiza o payload para o localStorage, substituindo base64 muito grandes por um fallback leve.
 * O dado original permanece 100% completo e com qualidade maxima no Supabase e na memória do React Query.
 */
export const sanitizeProductsForLocalCache = (products: Product[]): Product[] => {
  return products.map((p) => {
    let img = p.image;
    // Se a imagem for uma string base64 pesada (> 30KB)
    if (img && img.startsWith('data:') && img.length > 30000) {
      img = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80';
    }
    return {
      ...p,
      image: img,
    };
  });
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
