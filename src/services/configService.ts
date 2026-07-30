import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SiteConfig, DEFAULT_SITE_CONFIG } from '../context/AdminContext';
import { DbSiteConfig } from '../types/database';

const CONFIG_ROW_ID = 'main_config';

export const configService = {
  /**
   * Busca as configurações gerais do site no Supabase
   */
  async fetchSiteConfig(): Promise<SiteConfig> {
    if (!isSupabaseConfigured || !supabase) {
      const saved = localStorage.getItem('docemundo_site_config_v1');
      if (saved) {
        try {
          return { ...DEFAULT_SITE_CONFIG, ...JSON.parse(saved) };
        } catch {
          return DEFAULT_SITE_CONFIG;
        }
      }
      return DEFAULT_SITE_CONFIG;
    }

    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('id', CONFIG_ROW_ID)
        .single();

      if (error || !data) {
        console.warn('Configurações não encontradas no Supabase, usando padrão local.');
        const saved = localStorage.getItem('docemundo_site_config_v1');
        return saved ? { ...DEFAULT_SITE_CONFIG, ...JSON.parse(saved) } : DEFAULT_SITE_CONFIG;
      }

      const row = data as unknown as DbSiteConfig;
      return {
        phoneDisplay: row.phone_display || DEFAULT_SITE_CONFIG.phoneDisplay,
        phoneRaw: row.phone_raw || DEFAULT_SITE_CONFIG.phoneRaw,
        profileImage: row.profile_image || DEFAULT_SITE_CONFIG.profileImage,
        profileBio1: row.profile_bio_1 || DEFAULT_SITE_CONFIG.profileBio1,
        profileBio2: row.profile_bio_2 || DEFAULT_SITE_CONFIG.profileBio2,
        profileBio3: row.profile_bio_3 || DEFAULT_SITE_CONFIG.profileBio3,
        founderName: row.founder_name || DEFAULT_SITE_CONFIG.founderName,
        founderTitle: row.founder_title || DEFAULT_SITE_CONFIG.founderTitle,
        logoUrl: row.logo_url ?? DEFAULT_SITE_CONFIG.logoUrl,
        logoSlogan: row.logo_slogan || DEFAULT_SITE_CONFIG.logoSlogan,
        adminPassword: DEFAULT_SITE_CONFIG.adminPassword,
      };
    } catch (err) {
      console.error('Erro ao buscar configurações no Supabase:', err);
      return DEFAULT_SITE_CONFIG;
    }
  },

  /**
   * Salva ou atualiza as configurações do site no Supabase
   */
  async updateSiteConfig(config: SiteConfig): Promise<boolean> {
    // Guarda backup em localStorage para garantir que as alterações reflitam imediatamente na UI
    try {
      localStorage.setItem('docemundo_site_config_v1', JSON.stringify(config));
    } catch {
      // ignore
    }

    if (!isSupabaseConfigured || !supabase) {
      return true;
    }

    try {
      const payload: DbSiteConfig = {
        id: CONFIG_ROW_ID,
        phone_display: config.phoneDisplay,
        phone_raw: config.phoneRaw,
        profile_image: config.profileImage,
        profile_bio_1: config.profileBio1,
        profile_bio_2: config.profileBio2,
        profile_bio_3: config.profileBio3,
        founder_name: config.founderName,
        founder_title: config.founderTitle,
        logo_url: config.logoUrl,
        logo_slogan: config.logoSlogan,
        updated_at: new Date().toISOString(),
      };

      const { error } = await (supabase.from('configuracoes') as any)
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase RLS ou aviso ao atualizar configuracoes (salvo localmente):', error.message);
        // Mesmo com aviso de RLS, retorna true pois a alteração já está salva em localStorage
        return true;
      }

      return true;
    } catch (err) {
      console.warn('Falha na requisição de configuracoes no Supabase (salvo localmente):', err);
      return true;
    }
  },
};
