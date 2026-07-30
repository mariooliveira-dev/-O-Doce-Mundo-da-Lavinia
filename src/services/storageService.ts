import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const storageService = {
  /**
   * Realiza upload de uma imagem para o Supabase Storage (Bucket 'images')
   */
  async uploadImage(file: File, bucket = 'images', folder = 'uploads'): Promise<{ url: string | null; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      // Leitura local em formato Base64 para demonstração sem backend
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ url: reader.result as string });
        };
        reader.onerror = () => {
          resolve({ url: null, error: 'Erro ao ler arquivo de imagem local.' });
        };
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.warn(`Upload no bucket '${bucket}' falhou (${uploadError.message}). Utilizando fallback para Base64 local:`, uploadError);
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({ url: reader.result as string });
          };
          reader.onerror = () => {
            resolve({ url: null, error: 'Erro ao converter imagem em Base64 local.' });
          };
          reader.readAsDataURL(file);
        });
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return { url: data.publicUrl };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao realizar upload da imagem';
      return { url: null, error: msg };
    }
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
  async listImages(folder = 'uploads', bucket = 'images') {
    if (!isSupabaseConfigured || !supabase) {
      return { data: [], error: null };
    }

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder);

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },
};
