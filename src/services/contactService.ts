import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DbContact } from '../types/database';
import { rateLimiter, RATE_LIMIT_PRESETS } from '../lib/rateLimiter';

export const contactService = {
  /**
   * Salva uma nova mensagem de contato enviada por cliente com proteção de Rate Limit
   */
  async saveContactMessage(contact: Omit<DbContact, 'id' | 'status' | 'created_at'>): Promise<{ success: boolean; message: string }> {
    const rateKey = `contact_${contact.email?.toLowerCase().trim() || 'anon'}`;
    const rateCheck = rateLimiter.recordAttempt(rateKey, RATE_LIMIT_PRESETS.contactMessage);
    if (!rateCheck.allowed) {
      return { success: false, message: rateCheck.errorMessage || 'Muitas mensagens enviadas recentemente. Por favor, aguarde alguns minutos.' };
    }

    if (!isSupabaseConfigured || !supabase) {
      return { success: true, message: 'Mensagem enviada com sucesso (Modo Demonstração)!' };
    }

    try {
      const payload: Omit<DbContact, 'id' | 'created_at'> = {
        ...contact,
        status: 'pendente',
      };

      const { error } = await (supabase.from('contatos') as any)
        .insert([payload]);

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Sua mensagem foi enviada para o nosso ateliê!' };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Erro ao enviar mensagem',
      };
    }
  },

  /**
   * Busca a lista de mensagens de contato (Para o Painel Admin)
   */
  async fetchContacts(): Promise<DbContact[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('contatos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data as DbContact[];
    } catch {
      return [];
    }
  },
};
