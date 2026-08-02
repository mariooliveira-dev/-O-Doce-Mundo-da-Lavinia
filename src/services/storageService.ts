import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const storageService = {
  /**
   * Realiza upload de uma imagem para o Servidor Express ou Supabase Storage
   */
  async uploadImage(file: File, bucket = 'images', folder = 'uploads'): Promise<{ url: string | null; error?: string }> {
    // Convert File to Base64 first
    const base64Data = await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });

    if (!base64Data) {
      return { url: null, error: 'Erro ao ler arquivo de imagem.' };
    }

    // 1. Tenta enviar para a API central do servidor Express
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, filename: file.name }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.url) {
          return { url: json.url };
        }
      }
    } catch (err) {
      console.warn('API /api/upload indisponível, usando fallback de base64/Supabase...');
    }

    // 2. Se Supabase estiver configurado, faz upload no Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (!uploadError) {
          const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

          return { url: data.publicUrl };
        }
      } catch (err) {
        console.warn('Erro ao fazer upload no Supabase Storage:', err);
      }
    }

    // Retorna a representação base64 se nenhuma API remota respondeu
    return { url: base64Data };
  },

  /**
   * Exclui um arquivo do Supabase Storage
   */
  async deleteImage(filePath: string, bucket = 'images'): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: true };
    }

    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao excluir imagem do storage',
      };
    }
  },

  /**
   * Obtém a URL pública de uma imagem no Supabase Storage
   */
  getPublicUrl(filePath: string, bucket = 'images'): string {
    if (!isSupabaseConfigured || !supabase) {
      return filePath;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  /**
   * Lista os arquivos de uma pasta do Storage
   */
  async listFiles(folder = 'uploads', bucket = 'images'): Promise<string[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder);

      if (error || !data) {
        return [];
      }

      return data.map((item) => `${folder}/${item.name}`);
    } catch {
      return [];
    }
  },
};
