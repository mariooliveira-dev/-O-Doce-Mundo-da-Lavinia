import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import { DbProduct, DbCategory } from '../types/database';
import { getSavedProductsFromStorage, saveProductsToStorage } from '../utils/storage';

export const productService = {
  /**
   * Busca todos os produtos do Supabase (com fallback para cache no localStorage)
   */
  async fetchProducts(): Promise<Product[]> {
    const savedLocal = getSavedProductsFromStorage();

    if (!isSupabaseConfigured || !supabase) {
      return savedLocal || PRODUCTS;
    }

    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        console.warn('Supabase produtos retornou vazio ou erro, usando cache local:', error?.message);
        return savedLocal || PRODUCTS;
      }

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
        options: item.options || undefined,
      }));

      // Salva no cache local para resiliência
      saveProductsToStorage(remoteProducts);
      return remoteProducts;
    } catch (err) {
      console.error('Erro ao buscar produtos no Supabase:', err);
      return savedLocal || PRODUCTS;
    }
  },

  /**
   * Adiciona um novo produto
   */
  async createProduct(newProd: Omit<Product, 'id' | 'rating' | 'reviewCount'>): Promise<Product> {
    const id = `prod-${Date.now()}`;
    const product: Product = {
      ...newProd,
      id,
      rating: 5.0,
      reviewCount: 1,
    };

    if (!isSupabaseConfigured || !supabase) {
      return product;
    }

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
        options: product.options || null,
      };

      const { data, error } = await (supabase.from('produtos') as any)
        .insert([dbPayload])
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir produto no Supabase:', error.message);
        return product;
      }

      if (data) {
        const item = data as DbProduct;
        return {
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
          options: item.options || undefined,
        };
      }
    } catch (err) {
      console.error('Falha na requisição de criação do produto:', err);
    }

    return product;
  },

  /**
   * Atualiza dados de um produto existente
   */
  async updateProduct(id: string, updated: Partial<Product>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      return true;
    }

    try {
      const dbPayload: Partial<DbProduct> = {};
      if (updated.name !== undefined) dbPayload.name = updated.name;
      if (updated.category !== undefined) dbPayload.category = updated.category;
      if (updated.description !== undefined) dbPayload.description = updated.description;
      if (updated.price !== undefined) dbPayload.price = updated.price;
      if (updated.image !== undefined) dbPayload.image = updated.image;
      if (updated.badge !== undefined) dbPayload.badge = updated.badge || null;
      if (updated.customizable !== undefined) dbPayload.customizable = updated.customizable;
      if (updated.options !== undefined) dbPayload.options = updated.options || null;

      const { error } = await (supabase.from('produtos') as any)
        .update(dbPayload)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar produto no Supabase:', error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Falha ao atualizar produto:', err);
      return false;
    }
  },

  /**
   * Remove um produto pelo ID
   */
  async deleteProduct(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      return true;
    }

    try {
      const { error } = await (supabase.from('produtos') as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar produto no Supabase:', error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Falha ao deletar produto:', err);
      return false;
    }
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
