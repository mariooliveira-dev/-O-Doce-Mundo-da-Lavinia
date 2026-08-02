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

    // 1. Tenta buscar no servidor Express central (compartilhado entre todos os navegadores)
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          saveProductsToStorage(json.data);
          return json.data;
        }
      }
    } catch (err) {
      console.warn('API /api/products indisponível, tentando Supabase/localStorage...');
    }

    // 2. Tenta buscar no Supabase se configurado
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

          // Tenta salvar de volta no servidor para manter em sincronia
          try {
            fetch('/api/products', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(remoteProducts),
            });
          } catch {}

          return remoteProducts;
        }
      } catch (err) {
        console.error('Erro ao buscar produtos no Supabase:', err);
      }
    }

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

    // 1. Envia para o servidor central Express
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
    } catch (err) {
      console.warn('Falha ao enviar produto para /api/products:', err);
    }

    // 2. Se Supabase estiver configurado, salva no Supabase
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
          .insert([dbPayload]);
      } catch (err) {
        console.error('Falha na inserção no Supabase:', err);
      }
    }

    return product;
  },

  /**
   * Atualiza dados de um produto existente no Servidor, Supabase e localStorage
   */
  async updateProduct(id: string, updated: Partial<Product>): Promise<boolean> {
    // 1. Atualiza no servidor central Express
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn('Falha ao atualizar no servidor Express:', err);
    }

    // 2. Se Supabase estiver configurado, atualiza lá também
    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload: Partial<DbProduct> = {};
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
          .update(dbPayload)
          .eq('id', id);
      } catch (err) {
        console.error('Falha ao atualizar produto no Supabase:', err);
      }
    }

    return true;
  },

  /**
   * Remove um produto pelo ID no Servidor e Supabase
   */
  async deleteProduct(id: string): Promise<boolean> {
    // 1. Deleta no servidor central Express
    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Falha ao deletar produto no servidor Express:', err);
    }

    // 2. Deleta no Supabase se configurado
    if (isSupabaseConfigured && supabase) {
      try {
        await (supabase.from('produtos') as any)
          .delete()
          .eq('id', id);
      } catch (err) {
        console.error('Falha ao deletar produto no Supabase:', err);
      }
    }

    return true;
  },

  /**
   * Salva uma lista completa de produtos de uma vez (em batch) no servidor
   */
  async saveAllProducts(products: Product[]): Promise<boolean> {
    saveProductsToStorage(products);
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products),
      });
      return true;
    } catch (err) {
      console.warn('Erro ao salvar lote de produtos no servidor:', err);
      return false;
    }
  },

  /**
   * Restaura os produtos para a lista padrão no servidor
   */
  async resetProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products/reset', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          saveProductsToStorage(json.data);
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Erro ao resetar produtos no servidor:', err);
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
