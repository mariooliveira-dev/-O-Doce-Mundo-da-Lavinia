import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Compacta arquivos de imagem diretamente no navegador via Canvas.
 * Reduz fotos de celulares/câmeras de 5MB-10MB para ~40KB-80KB com altíssima qualidade visual!
 */
export async function compressImageFile(file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return resolve('');

      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
    };
    reader.onerror = () => resolve('');
  });
}

export const storageService = {
  /**
   * Realiza upload de uma imagem para o Servidor Express ou Supabase Storage com compressão inteligente
   */
  async uploadImage(file: File, bucket = 'images', folder = 'uploads'): Promise<{ url: string | null; error?: string }> {
    // 1. Compacta a foto do usuário primeiro
    const compressedBase64 = await compressImageFile(file);

    if (!compressedBase64) {
      return { url: null, error: 'Erro ao processar e compactar o arquivo de imagem.' };
    }

    // 2. Tenta enviar para a API central do servidor Express (se disponível)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: compressedBase64, filename: file.name }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.url) {
          return { url: json.url };
        }
      }
    } catch {
      // Ignora e prossegue para o Supabase
    }

    // 3. Se Supabase estiver configurado, tenta salvar no Supabase Storage
    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = 'jpg';
        const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        // Converte o base64 compactado em Blob para o Supabase Storage
        const resBlob = await fetch(compressedBase64);
        const blob = await resBlob.blob();

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: true,
          });

        if (!uploadError) {
          const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

          if (data?.publicUrl) {
            return { url: data.publicUrl };
          }
        }
      } catch (err) {
        console.warn('Erro ou bucket não encontrado no Supabase Storage:', err);
      }
    }

    // 4. Retorna a imagem compactada (~50KB) que salva perfeitamente no banco de dados e localStorage sem estourar limites!
    return { url: compressedBase64 };
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
