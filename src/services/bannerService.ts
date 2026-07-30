import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DbBanner } from '../types/database';

export const bannerService = {
  /**
   * Busca os banners cadastrados
   */
  async fetchBanners(): Promise<DbBanner[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [
        {
          id: 'b-1',
          title: 'Bolos & Festas Mágicas',
          subtitle: 'Doces 100% artesanais feitos com carinho',
          image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
          active: true,
          display_order: 1,
        },
      ];
    }

    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error || !data) return [];
      return data as DbBanner[];
    } catch {
      return [];
    }
  },

  /**
   * Cadastra um novo banner
   */
  async createBanner(banner: Omit<DbBanner, 'id' | 'created_at'>): Promise<DbBanner | null> {
    if (!isSupabaseConfigured || !supabase) {
      return { id: `banner-${Date.now()}`, ...banner };
    }

    try {
      const { data, error } = await (supabase.from('banners') as any)
        .insert([banner])
        .select()
        .single();

      if (error) return null;
      return data as DbBanner;
    } catch {
      return null;
    }
  },

  /**
   * Atualiza um banner
   */
  async updateBanner(id: string, updated: Partial<DbBanner>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return true;

    try {
      const { error } = await (supabase.from('banners') as any)
        .update(updated)
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Remove um banner
   */
  async deleteBanner(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return true;

    try {
      const { error } = await (supabase.from('banners') as any)
        .delete()
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  },
};
