import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import { DbProduct, DbCategory } from '../types/database';
import {
  getSavedProductsFromStorage,
  saveProductsToStorage,
  getDeletedProductIds,
  addDeletedProductId,
  clearDeletedProductIds,
} from '../utils/storage';

export const productService = {
  /**
   * Mescla a lista do Supabase com as modificações locais/Express mais recentes
   */
  mergeProducts(remote: Product[], localOrExpress: Product[]): Product[] {
    if (!localOrExpress || localOrExpress.length === 0) return remote;
    const localMap = new Map<string, Product>();
    localOrExpress.forEach((p) => localMap.set(String(p.id), p));

    const merged = remote.map((remoteProd) => {
      const localProd = localMap.get(String(remoteProd.id));
      if (localProd) {
        return {
          ...remoteProd,
          image: localProd.image || remoteProd.image,
          price: localProd.price ?? remoteProd.price,
          name: localProd.name || remoteProd.name,
          description: localProd.description || remoteProd.description,
          category: localProd.category || remoteProd.category,
          available: localProd.available !== undefined ? localProd.available : remoteProd.available,
        };
      }
      return remoteProd;
    });

    localOrExpress.forEach((localProd) => {
      if (!merged.some((m) => String(m.id) === String(localProd.id))) {
        merged.push(localProd);
      }
    });

    return merged;
  },

  /**
   * Busca todos os produtos do Servidor/Supabase (com fallback para cache no localStorage)
   */
  async fetchProducts(): Promise<Product[]> {
    const savedLocal = getSavedProductsFromStorage();
    const deletedSet = getDeletedProductIds();

    // 1. Tenta buscar produtos da API do servidor Express primeiro
    let expressProducts: Product[] | null = null;
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          expressProducts = json.data.filter((p: Product) => !deletedSet.has(String(p.id)));
        }
      }
    } catch {
      // API de servidor indisponível
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
          const remoteProducts = rows
            .map((item: DbProduct): Product => ({
              id: String(item.id),
              name: item.name,
              category: item.category,
              description: item.description,
              price: Number(item.price),
              image: item.image,
              badge: item.badge || undefined,
              rating: item.rating ? Number(item.rating) : 5.0,
              reviewCount: item.review_count ? Number(item.review_count) : 1,
              customizable: Boolean(item.customizable),
              available: item.available !== false,
              options: item.options || undefined,
            }))
            .filter((p) => !deletedSet.has(String(p.id)));

          const finalProducts = this.mergeProducts(remoteProducts, expressProducts || savedLocal || []);
          saveProductsToStorage(finalProducts);
          return finalProducts;
        } else if (!error && data && data.length === 0 && deletedSet.size === 0) {
          console.log('ℹ️ Tabela public.produtos vazia no Supabase. Populando com produtos iniciais...');
          const initialToSave = savedLocal && savedLocal.length > 0 ? savedLocal : PRODUCTS;
          await this.saveAllProducts(initialToSave);
          return initialToSave;
        }
      } catch (err) {
        console.warn('Supabase indisponível no momento. Utilizando cache/servidor local.', err);
      }
    }

    if (expressProducts && expressProducts.length > 0) {
      saveProductsToStorage(expressProducts);
      return expressProducts;
    }

    // 3. Fallback: LocalStorage ou PRODUCTS padrão (filtrando itens excluídos)
    const fallbackList = savedLocal !== null ? savedLocal : PRODUCTS;
    return fallbackList.filter((p) => !deletedSet.has(String(p.id)));
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

    // 1. Salva no Supabase obrigatoriamente
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

        const { data, error } = await (supabase.from('produtos') as any)
          .upsert([dbPayload], { onConflict: 'id' })
          .select();

        if (error) {
          console.error('❌ Erro de inserção no Supabase:', error.message);
          // Tenta fallback sem a coluna 'available' caso a tabela do cliente não tenha sido atualizada
          if (error.message?.includes('available') || error.message?.includes('column')) {
            const fallbackPayload = { ...dbPayload };
            delete (fallbackPayload as any).available;
            const retryRes = await (supabase.from('produtos') as any)
              .upsert([fallbackPayload], { onConflict: 'id' });
            if (retryRes.error) {
              console.error('❌ Retry falhou ao inserir produto no Supabase:', retryRes.error.message);
            } else {
              console.log('✅ Produto inserido no Supabase via fallback (sem coluna available):', product.name);
            }
          }
        } else {
          console.log('✅ Produto salvo com sucesso no Supabase:', product.name, data);
        }
      } catch (err) {
        console.error('Falha grave na inserção no Supabase:', err);
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
  async updateProduct(id: string, updated: Partial<Product>, fullProduct?: Product): Promise<boolean> {
    const payloadToSave = fullProduct || (updated as Product);

    // 1. Atualiza no localStorage imediatamente
    const currentList = getSavedProductsFromStorage() || PRODUCTS;
    const existingIdx = currentList.findIndex((p) => String(p.id) === String(id));
    let newList = [...currentList];
    if (existingIdx >= 0) {
      newList[existingIdx] = { ...newList[existingIdx], ...updated, id };
    } else if (fullProduct) {
      newList.push(fullProduct);
    }
    saveProductsToStorage(newList);

    // 2. Atualiza no Supabase se configurado
    if (isSupabaseConfigured && supabase) {
      try {
        if (fullProduct) {
          const fullDbPayload: DbProduct = {
            id: fullProduct.id || id,
            name: fullProduct.name,
            category: fullProduct.category,
            description: fullProduct.description,
            price: fullProduct.price,
            image: fullProduct.image,
            badge: fullProduct.badge || null,
            rating: fullProduct.rating || 5.0,
            review_count: fullProduct.reviewCount || 1,
            customizable: Boolean(fullProduct.customizable),
            available: fullProduct.available !== false,
            options: fullProduct.options || null,
            updated_at: new Date().toISOString(),
          };

          const upsertRes = await (supabase.from('produtos') as any)
            .upsert([fullDbPayload], { onConflict: 'id' });

          if (upsertRes.error && (upsertRes.error.message?.includes('available') || upsertRes.error.message?.includes('column'))) {
            const fallbackPayload = { ...fullDbPayload };
            delete (fallbackPayload as any).available;
            await (supabase.from('produtos') as any)
              .upsert([fallbackPayload], { onConflict: 'id' });
          }
        } else {
          const dbPayload: Record<string, any> = { updated_at: new Date().toISOString() };
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
        }
      } catch (err) {
        console.warn('Aviso ao atualizar produto no Supabase:', err);
      }
    }

    // 3. Atualiza na API do Servidor Central Express usando requisição POST segura
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', product: payloadToSave, id }),
      });
      await fetch(`/api/products/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadToSave),
      });
    } catch {
      // Ignora erro se ambiente de hospedagem for estático
    }

    return true;
  },

  /**
   * Remove um produto pelo ID no Servidor, Supabase e localStorage
   */
  async deleteProduct(id: string): Promise<boolean> {
    // 1. Registra o ID como deletado de forma persistente
    addDeletedProductId(id);

    // 2. Remove do localStorage imediatamente
    const currentList = getSavedProductsFromStorage() || PRODUCTS;
    const updatedList = currentList.filter((p) => String(p.id) !== String(id));
    saveProductsToStorage(updatedList);

    // 3. Deleta no Supabase se configurado
    if (isSupabaseConfigured && supabase) {
      try {
        await (supabase.from('produtos') as any)
          .delete()
          .eq('id', id);

        if (!isNaN(Number(id))) {
          await (supabase.from('produtos') as any)
            .delete()
            .eq('id', Number(id));
        }
      } catch (err) {
        console.warn('Aviso ao deletar produto no Supabase:', err);
      }
    }

    // 4. Deleta na API do Servidor Central Express com requisições POST seguras
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      await fetch(`/api/products/delete/${id}`, { method: 'POST' });
    } catch {
      // Ignora erro de ambiente estático
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
          updated_at: new Date().toISOString(),
        }));

        const { error } = await (supabase.from('produtos') as any)
          .upsert(dbPayloads, { onConflict: 'id' });

        if (error) {
          if (error.message?.includes('available') || error.message?.includes('column') || error.message?.includes('schema cache')) {
            console.warn('⚠️ Coluna "available" não encontrada na tabela "produtos". Executando salvamento adaptativo sem "available"...');
            const fallbackPayloads = dbPayloads.map((p) => {
              const clone = { ...p };
              delete (clone as any).available;
              return clone;
            });
            const retryRes = await (supabase.from('produtos') as any)
              .upsert(fallbackPayloads, { onConflict: 'id' });
            if (retryRes.error) {
              console.error('❌ Erro no salvamento adaptativo em lote no Supabase:', retryRes.error.message);
            } else {
              console.log('✅ Todos os produtos foram salvos com sucesso no Supabase!');
            }
          } else {
            console.error('❌ Erro no salvamento em lote no Supabase:', error.message);
          }
        } else {
          console.log('✅ Batch de produtos salvo com sucesso no Supabase!');
        }
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
    clearDeletedProductIds();
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

        const { error } = await (supabase.from('produtos') as any)
          .upsert(dbPayloads, { onConflict: 'id' });

        if (error && (error.message?.includes('available') || error.message?.includes('column') || error.message?.includes('schema cache'))) {
          const fallbackPayloads = dbPayloads.map((p) => {
            const clone = { ...p };
            delete (clone as any).available;
            return clone;
          });
          await (supabase.from('produtos') as any)
            .upsert(fallbackPayloads, { onConflict: 'id' });
        }
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
