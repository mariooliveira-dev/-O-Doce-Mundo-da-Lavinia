import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import { DbProduct, DbCategory } from '../types/database';
import { getSavedProductsFromStorage, saveProductsToStorage } from '../utils/storage';

export const productService = {
  /**
   * Busca todos os produtos do Servidor/Supabase (com fallback para cache no localStorage)
   */
  async fetchProducts(): Promise<Product[]> {
    const savedLocal = getSavedProductsFromStorage();

    // 1. Tenta buscar no Supabase se configurado (prioridade máxima para Vercel)
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          const rows = data as DbProduct[];
          const remoteProducts = rows.map((item: DbProduct): Product => ({
            id: item.id,
            name: item.name,
            category: item.category,
            description: item.description,
            price: item.price,
            image: item.image,
            badge: item.badge || undefined,
            rating: item.rating || 5.0,
            reviewCount: item.review_count || 1,
            customizable: item.customizable,
            available: item.available !== false,
            options: item.options || undefined,
          }));

          saveProductsToStorage(remoteProducts);
          return remoteProducts;
        } else if (!error && data && data.length === 0 && savedLocal && savedLocal.length > 0) {
          // Se a tabela do Supabase estiver vazia, preenche com os produtos locais
          await this.saveAllProducts(savedLocal);
        }
      } catch (err) {
        console.error('Erro ao buscar produtos no Supabase:', err);
      }
    }

    // 2. Tenta buscar da API Central Express do Servidor (/api/products)
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          saveProductsToStorage(json.data);
          return json.data;
        }
      }
    } catch {
      // API de servidor indisponível (ex: host 100% estático)
    }

    // 3. Fallback: LocalStorage ou PRODUCTS padrão
    return savedLocal || PRODUCTS;
  },

  /**
   * Adiciona um novo produto no Servidor, Supabase e localStorage
   */
  async createProduct(newProd: Omit<Product, 'id' | 'rating' | 'reviewCount'>): Promise<Product> {
    const id = `prod-${Date.now()}`;
    const product: Product = {
      ...newProd,
      id,
      rating: 5.0,
      reviewCount: 1,
      available: newProd.available !== false,
    };

    // 1. Salva no Supabase se configurado
    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload: DbProduct = {
          id: product.id,
          name: product.name,
          category: product.category,
          description: product.description,
          price: product.price,
          image: product.image,
          badge: product.badge || null,
          rating: product.rating,
          review_count: product.reviewCount,
          customizable: Boolean(product.customizable),
          available: product.available,
          options: product.options || null,
        };

        await (supabase.from('produtos') as any)
          .upsert([dbPayload], { onConflict: 'id' });
      } catch (err) {
        console.error('Falha na inserção no Supabase:', err);
      }
    }

    // 2. Salva na API do Servidor Central Express (/api/products)
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
    } catch {
      // Ignora erro se servidor estático
    }

    return product;
  },

  /**
   * Atualiza dados de um produto existente no Servidor, Supabase e localStorage
   */
  async updateProduct(id: string, updated: Partial<Product>): Promise<boolean> {
    // 1. Atualiza no Supabase se configurado
    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload: Partial<DbProduct> = { id };
        if (updated.name !== undefined) dbPayload.name = updated.name;
        if (updated.category !== undefined) dbPayload.category = updated.category;
        if (updated.description !== undefined) dbPayload.description = updated.description;
        if (updated.price !== undefined) dbPayload.price = updated.price;
        if (updated.image !== undefined) dbPayload.image = updated.image;
        if (updated.badge !== undefined) dbPayload.badge = updated.badge || null;
        if (updated.customizable !== undefined) dbPayload.customizable = updated.customizable;
        if (updated.available !== undefined) dbPayload.available = updated.available;
        if (updated.options !== undefined) dbPayload.options = updated.options || null;

        await (supabase.from('produtos') as any)
          .upsert(dbPayload, { onConflict: 'id' });
      } catch (err) {
        console.error('Falha ao atualizar produto no Supabase:', err);
      }
    }

    // 2. Atualiza na API do Servidor Central Express (/api/products/:id)
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {
      // Ignora
    }

    return true;
  },

  /**
   * Remove um produto pelo ID no Servidor e Supabase
   */
  async deleteProduct(id: string): Promise<boolean> {
    // 1. Deleta no Supabase se configurado
    if (isSupabaseConfigured && supabase) {
      try {
        await (supabase.from('produtos') as any)
          .delete()
          .eq('id', id);
      } catch (err) {
        console.error('Falha ao deletar produto no Supabase:', err);
      }
    }

    // 2. Deleta na API do Servidor Central Express (/api/products/:id)
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch {
      // Ignora
    }

    return true;
  },

  /**
   * Salva uma lista completa de produtos de uma vez (em batch) no servidor e no Supabase
   */
  async saveAllProducts(products: Product[]): Promise<boolean> {
    saveProductsToStorage(products);

    if (isSupabaseConfigured && supabase) {
      try {
        await (supabase.from('produtos') as any)
          .delete()
          .neq('id', '___impossible_id___');

        const dbPayloads: DbProduct[] = products.map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          description: product.description,
          price: product.price,
          image: product.image,
          badge: product.badge || null,
          rating: product.rating || 5.0,
          review_count: product.reviewCount || 1,
          customizable: Boolean(product.customizable),
          available: product.available !== false,
          options: product.options || null,
        }));

        await (supabase.from('produtos') as any)
          .upsert(dbPayloads, { onConflict: 'id' });
      } catch (err) {
        console.error('Erro ao enviar batch de produtos para o Supabase:', err);
      }
    }

    // Salva também no servidor Express
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products),
      });
    } catch {
      // Ignora
    }

    return true;
  },

  /**
   * Restaura os produtos para a lista padrão no servidor
   */
  async resetProducts(): Promise<Product[]> {
    saveProductsToStorage(PRODUCTS);
    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayloads: DbProduct[] = PRODUCTS.map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          description: product.description,
          price: product.price,
          image: product.image,
          badge: product.badge || null,
          rating: product.rating || 5.0,
          review_count: product.reviewCount || 1,
          customizable: Boolean(product.customizable),
          available: product.available !== false,
          options: product.options || null,
        }));

        await (supabase.from('produtos') as any)
          .upsert(dbPayloads, { onConflict: 'id' });
      } catch (err) {
        console.error('Erro ao resetar produtos no Supabase:', err);
      }
    }

    try {
      await fetch('/api/products/reset', { method: 'POST' });
    } catch {
      // Ignora
    }

    return PRODUCTS;
  },

  /**
   * Busca a lista de categorias cadastradas
   */
  async fetchCategories(): Promise<DbCategory[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [
        { id: '1', name: 'Todos os Doces', slug: 'todos', display_order: 1 },
        { id: '2', name: 'Bolos & Bentô Cakes', slug: 'bolos', display_order: 2 },
        { id: '3', name: 'Cupcakes Gourmet', slug: 'cupcakes', display_order: 3 },
        { id: '4', name: 'Docinhos de Festa', slug: 'docinhos', display_order: 4 },
        { id: '5', name: 'Copos da Felicidade', slug: 'copos', display_order: 5 },
        { id: '6', name: 'Kits Festa Mágicos', slug: 'kits', display_order: 6 },
      ];
    }

    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data) {
        return [];
      }

      return data as DbCategory[];
    } catch {
      return [];
    }
  },

  /**
   * Cadastra uma nova categoria
   */
  async createCategory(category: Omit<DbCategory, 'id'>): Promise<DbCategory | null> {
    if (!isSupabaseConfigured || !supabase) {
      return { id: `cat-${Date.now()}`, ...category };
    }

    try {
      const { data, error } = await (supabase.from('categorias') as any)
        .insert([category])
        .select()
        .single();

      if (error) {
        console.error('Erro ao cadastrar categoria no Supabase:', error.message);
        return null;
      }

      return data as DbCategory;
    } catch {
      return null;
    }
  },
};
