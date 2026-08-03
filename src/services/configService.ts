import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SiteConfig, DEFAULT_SITE_CONFIG } from '../types';
import { DbSiteConfig } from '../types/database';
import { getSavedConfigFromStorage, saveConfigToStorage } from '../utils/storage';

const CONFIG_ROW_ID = 'main_config';

export const configService = {
  /**
   * Busca as configurações gerais do site no Servidor/Supabase (com fallback local)
   */
  async fetchSiteConfig(): Promise<SiteConfig> {
    const savedConfig = getSavedConfigFromStorage();
    const localMergedConfig: SiteConfig = savedConfig
      ? { ...DEFAULT_SITE_CONFIG, ...savedConfig }
      : DEFAULT_SITE_CONFIG;

    // 1. Se Supabase estiver configurado, busca do Supabase primeiro
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('configuracoes')
          .select('*')
          .eq('id', CONFIG_ROW_ID)
          .single();

        if (!error && data) {
          const row = data as unknown as DbSiteConfig;
          const remoteConfig: SiteConfig = {
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

          saveConfigToStorage(remoteConfig);
          return remoteConfig;
        }
      } catch (err) {
        console.error('Erro ao buscar configurações no Supabase:', err);
      }
    }

    // 2. Tenta buscar da API Central Express do Servidor (/api/config)
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const mergedConfig: SiteConfig = { ...DEFAULT_SITE_CONFIG, ...json.data };
          saveConfigToStorage(mergedConfig);
          return mergedConfig;
        }
      }
    } catch {
      // Ignora erro se servidor estático
    }

    return localMergedConfig;
  },

  /**
   * Salva ou atualiza as configurações do site no Servidor, Supabase e localStorage
   */
  async updateSiteConfig(config: SiteConfig): Promise<boolean> {
    // Guarda backup em localStorage para refletir imediatamente
    saveConfigToStorage(config);

    // 1. Salva no Supabase se configurado
    if (isSupabaseConfigured && supabase) {
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

        await (supabase.from('configuracoes') as any)
          .upsert(payload, { onConflict: 'id' });
      } catch (err) {
        console.warn('Falha ao atualizar configuracoes no Supabase:', err);
      }
    }

    // 2. Salva na API Central Express (/api/config)
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
    } catch {
      // Ignora
    }

    return true;
  },
};
