/**
 * Rate Limiter seguro para proteção contra Brute-Force, Spam e Requisições Excessivas.
 * Armazena histórico com janela deslizante (sliding window) no localStorage para persistência.
 */

export interface RateLimitConfig {
  /** Número máximo de tentativas permitidas dentro da janela de tempo */
  maxAttempts: number;
  /** Tamanho da janela em segundos */
  windowSeconds: number;
  /** Nome amigável da ação para mensagens de erro */
  actionName: string;
}

export interface RateLimitStatus {
  allowed: boolean;
  remainingAttempts: number;
  resetInSeconds: number;
  errorMessage?: string;
}

const STORAGE_PREFIX = 'docemundo_rate_limit_v1_';

export const RATE_LIMIT_PRESETS = {
  login: {
    maxAttempts: 5,
    windowSeconds: 300, // 5 minutos
    actionName: 'Tentativas de login',
  },
  signUp: {
    maxAttempts: 3,
    windowSeconds: 600, // 10 minutos
    actionName: 'Criação de conta',
  },
  passwordReset: {
    maxAttempts: 2,
    windowSeconds: 600, // 10 minutos
    actionName: 'Recuperação de senha',
  },
  resendEmail: {
    maxAttempts: 2,
    windowSeconds: 300, // 5 minutos
    actionName: 'Reenvio de e-mail',
  },
  contactMessage: {
    maxAttempts: 3,
    windowSeconds: 300, // 5 minutos
    actionName: 'Envio de mensagem',
  },
  orderSubmit: {
    maxAttempts: 5,
    windowSeconds: 180, // 3 minutos
    actionName: 'Envio de pedido',
  },
};

class RateLimiter {
  private getStorageKey(actionKey: string): string {
    // Sanitiza a chave para evitar caracteres inválidos no localStorage
    const safeKey = actionKey.toLowerCase().replace(/[^a-z0-9_:-]/g, '_');
    return `${STORAGE_PREFIX}${safeKey}`;
  }

  private getTimestamps(key: string): number[] {
    try {
      const raw = localStorage.getItem(this.getStorageKey(key));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((ts) => typeof ts === 'number');
      }
      return [];
    } catch {
      return [];
    }
  }

  private saveTimestamps(key: string, timestamps: number[]): void {
    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(timestamps));
    } catch (e) {
      console.warn('RateLimiter: Erro ao salvar histórico no localStorage', e);
    }
  }

  /**
   * Formata segundos restantes em texto legível em Português (ex: "2 minutos e 15 segundos")
   */
  public formatTime(seconds: number): string {
    if (seconds <= 0) return 'alguns segundos';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins > 0 && secs > 0) {
      return `${mins} min e ${secs}s`;
    } else if (mins > 0) {
      return `${mins} minuto${mins > 1 ? 's' : ''}`;
    }
    return `${secs} segundo${secs !== 1 ? 's' : ''}`;
  }

  /**
   * Verifica se uma ação está liberada para ser executada sem registrá-la ainda.
   */
  public check(key: string, config: RateLimitConfig): RateLimitStatus {
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;
    const cutoff = now - windowMs;

    // Filtra apenas tentativas dentro da janela de tempo atual
    const validTimestamps = this.getTimestamps(key).filter((ts) => ts > cutoff);

    if (validTimestamps.length >= config.maxAttempts) {
      const oldestInWindow = Math.min(...validTimestamps);
      const resetInMs = oldestInWindow + windowMs - now;
      const resetInSeconds = Math.max(1, Math.ceil(resetInMs / 1000));
      const formattedTime = this.formatTime(resetInSeconds);

      return {
        allowed: false,
        remainingAttempts: 0,
        resetInSeconds,
        errorMessage: `Limite de ${config.actionName.toLowerCase()} excedido por segurança! Muitas tentativas. Por favor, aguarde ${formattedTime} antes de tentar novamente.`,
      };
    }

    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - validTimestamps.length,
      resetInSeconds: 0,
    };
  }

  /**
   * Registra uma tentativa e retorna se foi liberada ou se excedeu o limite.
   */
  public recordAttempt(key: string, config: RateLimitConfig): RateLimitStatus {
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;
    const cutoff = now - windowMs;

    const validTimestamps = this.getTimestamps(key).filter((ts) => ts > cutoff);

    if (validTimestamps.length >= config.maxAttempts) {
      const oldestInWindow = Math.min(...validTimestamps);
      const resetInMs = oldestInWindow + windowMs - now;
      const resetInSeconds = Math.max(1, Math.ceil(resetInMs / 1000));
      const formattedTime = this.formatTime(resetInSeconds);

      return {
        allowed: false,
        remainingAttempts: 0,
        resetInSeconds,
        errorMessage: `Limite de ${config.actionName.toLowerCase()} excedido por segurança! Muitas tentativas. Por favor, aguarde ${formattedTime} antes de tentar novamente.`,
      };
    }

    // Registra o novo timestamp
    validTimestamps.push(now);
    this.saveTimestamps(key, validTimestamps);

    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - validTimestamps.length,
      resetInSeconds: 0,
    };
  }

  /**
   * Reseta/Limpa as tentativas de uma determinada chave (ex: após login bem-sucedido).
   */
  public reset(key: string): void {
    try {
      localStorage.removeItem(this.getStorageKey(key));
    } catch {
      // Ignore
    }
  }
}

export const rateLimiter = new RateLimiter();
