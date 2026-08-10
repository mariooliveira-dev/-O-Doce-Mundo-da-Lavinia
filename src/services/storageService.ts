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

/**
 * Converte de forma síncrona uma string Base64 Data-URL em um objeto Blob bem-formado,
 * prevenindo falhas no fetch() e erros 400 em uploads no Supabase Storage.
 */
function dataURLtoBlob(dataurl: string): Blob {
  try {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch {
    return new Blob([], { type: 'image/jpeg' });
  }
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

    // 2. Se Supabase estiver configurado, tenta salvar prioritariamente no Supabase Storage (Bucket: 'images', Pasta: 'uploads/')
    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = 'jpg';
        const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 20);
        const fileName = `${folder}/${Date.now()}_${cleanName}.${fileExt}`;

        // Converte o base64 compactado em Blob
        const blob = dataURLtoBlob(compressedBase64);

        if (blob.size > 0) {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, blob, {
              contentType: 'image/jpeg',
              cacheControl: '3600',
              upsert: true,
            });

          if (!uploadError && uploadData) {
            const { data } = supabase.storage
              .from(bucket)
              .getPublicUrl(fileName);

            if (data?.publicUrl) {
              console.log('✅ Imagem enviada com sucesso para o Supabase Storage:', data.publicUrl);
              return { url: data.publicUrl };
            }
          } else if (uploadError) {
            console.warn('⚠️ Aviso de Upload no Supabase Storage:', uploadError.message);
          }
        }
      } catch (err) {
        console.warn('Aviso: Falha de upload no Supabase Storage, acionando servidor fallback.', err);
      }
    }

    // 3. Fallback: Envia para a API central do servidor Express (/api/upload)
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
      // Ignora e prossegue para o fallback final
    }

    // 4. Fallback final: Retorna a imagem compactada em alta qualidade (~40KB-80KB)
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
